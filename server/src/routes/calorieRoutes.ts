import { Router } from 'express';
import { getDb, saveDb } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/dish/:dishId', async (req, res, next) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT * FROM dishes WHERE id = ? AND is_active = 1', [req.params.dishId]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ success: false, error: { message: '菜品不存在' } });
    }

    const columns = result[0].columns;
    const values = result[0].values[0];
    const dish: any = {};
    columns.forEach((col, i) => { dish[col] = values[i]; });

    res.json({
      success: true,
      data: {
        calories: dish.calories_per_100g,
        nutrients: {
          protein: dish.protein,
          carbs: dish.carbohydrates,
          fat: dish.fat,
          fiber: dish.fiber,
          sodium: dish.sodium,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/calculate', async (req, res, next) => {
  try {
    const { dishes } = req.body;
    
    if (!dishes || !Array.isArray(dishes)) {
      return res.status(400).json({ success: false, error: { message: '无效的请求数据' } });
    }

    const db = await getDb();
    
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const dish of dishes) {
      const result = db.exec('SELECT * FROM dishes WHERE id = ? AND is_active = 1', [dish.dishId]);
      if (result.length > 0 && result[0].values.length > 0) {
        const columns = result[0].columns;
        const values = result[0].values[0];
        const dbDish: any = {};
        columns.forEach((col, i) => { dbDish[col] = values[i]; });
        
        const portion = dish.portion || 100;
        const multiplier = portion / 100;
        
        totalCalories += dbDish.calories_per_100g * multiplier;
        totalProtein += dbDish.protein * multiplier;
        totalCarbs += dbDish.carbohydrates * multiplier;
        totalFat += dbDish.fat * multiplier;
      }
    }

    res.json({
      success: true,
      data: {
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/today', authenticateToken, async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const db = await getDb();
    
    const result = db.exec(
      `SELECT * FROM meal_records WHERE user_id = ? AND date(meal_time) = ? ORDER BY meal_time DESC`,
      [req.user!.id, today]
    );

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    if (result.length > 0) {
      const columns = result[0].columns;
      for (const row of result[0].values) {
        const record: any = {};
        columns.forEach((col, i) => { record[col] = row[i]; });
        totalCalories += record.total_calories || 0;
        totalProtein += record.total_protein || 0;
        totalCarbs += record.total_carbohydrates || 0;
        totalFat += record.total_fat || 0;
      }
    }

    const userResult = db.exec('SELECT target_calories FROM users WHERE id = ?', [req.user!.id]);
    const targetCalories = userResult.length > 0 && userResult[0].values.length > 0
      ? userResult[0].values[0][0]
      : 2000;

    res.json({
      success: true,
      data: {
        totalCalories,
        targetCalories,
        nutrients: {
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
        },
        mealCount: result.length > 0 ? result[0].values.length : 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    const db = await getDb();
    
    let query = 'SELECT * FROM meal_records WHERE user_id = ?';
    const params: any[] = [req.user!.id];

    if (startDate) {
      query += ' AND date(meal_time) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date(meal_time) <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY meal_time DESC LIMIT ?';
    params.push(Number(limit));

    const result = db.exec(query, params);

    let records: any[] = [];
    if (result.length > 0) {
      const columns = result[0].columns;
      records = result[0].values.map((row) => {
        const record: any = {};
        columns.forEach((col, i) => { record[col] = row[i]; });
        return record;
      });
    }

    res.json({
      success: true,
      data: records.map((record) => ({
        id: record.id,
        type: record.record_type,
        time: record.meal_time,
        dishes: JSON.parse(record.dishes || '[]'),
        totalCalories: record.total_calories,
        totalProtein: record.total_protein,
        totalCarbs: record.total_carbohydrates,
        totalFat: record.total_fat,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
