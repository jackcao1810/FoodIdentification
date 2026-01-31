import { Router } from 'express';
import { getDb } from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/overview', authenticateToken, async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const db = await getDb();
    
    const todayResult = db.exec(
      'SELECT COALESCE(SUM(total_calories), 0) as calories FROM meal_records WHERE user_id = ? AND date(meal_time) = ?',
      [req.user!.id, today]
    );
    const todayCalories = todayResult.length > 0 ? todayResult[0].values[0][0] : 0;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weeklyRecords = db.exec(
      `SELECT COALESCE(SUM(total_calories), 0) as calories, date(meal_time) as date
       FROM meal_records WHERE user_id = ? AND date(meal_time) >= ?
       GROUP BY date(meal_time)`,
      [req.user!.id, weekStart.toISOString().split('T')[0]]
    );

    let weeklyTotal = 0;
    if (weeklyRecords.length > 0) {
      for (const row of weeklyRecords[0].values) {
        weeklyTotal += row[0];
      }
    }
    const weeklyAverage = weeklyRecords.length > 0 ? Math.round(weeklyTotal / weeklyRecords[0].values.length) : 0;

    const streakResult = db.exec(
      'SELECT COUNT(DISTINCT date(meal_time)) as days FROM meal_records WHERE user_id = ? AND date(meal_time) >= date(\'now\', \'-30 days\')',
      [req.user!.id]
    );
    const streak = streakResult.length > 0 ? streakResult[0].values[0][0] : 0;

    res.json({
      success: true,
      data: {
        todayCalories,
        weeklyAverage,
        streak,
        achievements: [],
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/trend', authenticateToken, async (req, res, next) => {
  try {
    const { period = 'week' } = req.query;
    const db = await getDb();
    
    const days = period === 'month' ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const records = db.exec(
      `SELECT date(meal_time) as date, COALESCE(SUM(total_calories), 0) as calories,
              COALESCE(SUM(total_protein), 0) as protein,
              COALESCE(SUM(total_carbohydrates), 0) as carbs,
              COALESCE(SUM(total_fat), 0) as fat
       FROM meal_records WHERE user_id = ? AND date(meal_time) >= ?
       GROUP BY date(meal_time) ORDER BY date ASC`,
      [req.user!.id, startDate.toISOString().split('T')[0]]
    );

    const dates: string[] = [];
    const calories: number[] = [];
    const protein: number[] = [];
    const carbohydrates: number[] = [];
    const fat: number[] = [];

    if (records.length > 0) {
      for (const row of records[0].values) {
        dates.push(row[0]);
        calories.push(row[1]);
        protein.push(row[2]);
        carbohydrates.push(row[3]);
        fat.push(row[4]);
      }
    }

    res.json({
      success: true,
      data: { dates, calories, protein, carbohydrates, fat },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/nutrients', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { period = 'week' } = req.query;
    const db = await getDb();
    
    const days = period === 'month' ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const records = db.exec(
      `SELECT COALESCE(SUM(total_protein), 0) as protein,
              COALESCE(SUM(total_carbohydrates), 0) as carbs,
              COALESCE(SUM(total_fat), 0) as fat
       FROM meal_records WHERE user_id = ? AND date(meal_time) >= ?`,
      [req.user!.id, startDate.toISOString().split('T')[0]]
    );

    const userGoals = db.exec(
      'SELECT target_protein, target_carbohydrates, target_fat FROM users WHERE id = ?',
      [req.user!.id]
    );

    const dayCount = period === 'month' ? 30 : 7;
    const protein = records.length > 0 ? records[0].values[0][0] : 0;
    const carbs = records.length > 0 ? records[0].values[0][1] : 0;
    const fat = records.length > 0 ? records[0].values[0][2] : 0;
    
    const proteinGoal = userGoals.length > 0 && userGoals[0].values.length > 0 
      ? userGoals[0].values[0][0] || 80 
      : 80;
    const carbsGoal = userGoals.length > 0 && userGoals[0].values.length > 0 
      ? userGoals[0].values[0][1] || 300 
      : 300;
    const fatGoal = userGoals.length > 0 && userGoals[0].values.length > 0 
      ? userGoals[0].values[0][2] || 65 
      : 65;

    res.json({
      success: true,
      data: {
        averageProtein: Math.round(protein / dayCount),
        averageCarbs: Math.round(carbs / dayCount),
        averageFat: Math.round(fat / dayCount),
        proteinGoal,
        carbsGoal,
        fatGoal,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/daily', authenticateToken, async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const db = await getDb();

    const userResult = db.exec('SELECT target_calories FROM users WHERE id = ?', [req.user!.id]);
    const targetCalories = userResult.length > 0 && userResult[0].values.length > 0
      ? userResult[0].values[0][0]
      : 2000;
    
    const records = db.exec(
      'SELECT * FROM meal_records WHERE user_id = ? AND date(meal_time) = ? ORDER BY meal_time ASC',
      [req.user!.id, targetDate]
    );

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    const meals: { type: string; calories: number }[] = [];

    if (records.length > 0) {
      const columns = records[0].columns;
      for (const row of records[0].values) {
        const record: any = {};
        columns.forEach((col, i) => { record[col] = row[i]; });
        
        totalCalories += record.total_calories || 0;
        totalProtein += record.total_protein || 0;
        totalCarbs += record.total_carbohydrates || 0;
        totalFat += record.total_fat || 0;
        
        meals.push({
          type: record.record_type,
          calories: record.total_calories || 0,
        });
      }
    }

    res.json({
      success: true,
      data: {
        date: targetDate,
        totalCalories,
        targetCalories,
        protein: totalProtein,
        carbohydrates: totalCarbs,
        fat: totalFat,
        meals,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/weekly', authenticateToken, async (req, res, next) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const db = await getDb();

    const records = db.exec(
      `SELECT date(meal_time) as date, COALESCE(SUM(total_calories), 0) as calories,
              COALESCE(SUM(total_protein), 0) as protein,
              COALESCE(SUM(total_carbohydrates), 0) as carbs,
              COALESCE(SUM(total_fat), 0) as fat
       FROM meal_records WHERE user_id = ? AND date(meal_time) >= ?
       GROUP BY date(meal_time) ORDER BY date ASC`,
      [req.user!.id, startDate.toISOString().split('T')[0]]
    );

    const data = [];
    if (records.length > 0) {
      for (const row of records[0].values) {
        data.push({
          date: row[0],
          totalCalories: row[1],
          targetCalories: 2000,
          protein: row[2],
          carbohydrates: row[3],
          fat: row[4],
          meals: [],
        });
      }
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/monthly', authenticateToken, async (req, res, next) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const db = await getDb();

    const records = db.exec(
      `SELECT date(meal_time) as date, COALESCE(SUM(total_calories), 0) as calories,
              COALESCE(SUM(total_protein), 0) as protein,
              COALESCE(SUM(total_carbohydrates), 0) as carbs,
              COALESCE(SUM(total_fat), 0) as fat
       FROM meal_records WHERE user_id = ? AND date(meal_time) >= ?
       GROUP BY date(meal_time) ORDER BY date ASC`,
      [req.user!.id, startDate.toISOString().split('T')[0]]
    );

    const data = [];
    if (records.length > 0) {
      for (const row of records[0].values) {
        data.push({
          date: row[0],
          totalCalories: row[1],
          targetCalories: 2000,
          protein: row[2],
          carbohydrates: row[3],
          fat: row[4],
          meals: [],
        });
      }
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
