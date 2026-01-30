import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, date } = req.query;
    const db = await getDb();
    
    let query = 'SELECT * FROM meal_records WHERE user_id = ?';
    const params: any[] = [req.user!.id];

    if (date) {
      query += ' AND date(meal_time) = ?';
      params.push(date);
    }

    const offset = (Number(page) - 1) * Number(limit);
    query += ' ORDER BY meal_time DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

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
        userId: record.user_id,
        recordType: record.record_type,
        mealTime: record.meal_time,
        dishes: JSON.parse(record.dishes || '[]'),
        totalCalories: record.total_calories,
        totalProtein: record.total_protein,
        totalCarbs: record.total_carbohydrates,
        totalFat: record.total_fat,
        notes: record.notes,
        createdAt: record.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const result = db.exec(
      'SELECT * FROM meal_records WHERE id = ? AND user_id = ?',
      [req.params.id, req.user!.id]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ success: false, error: { message: '记录不存在' } });
    }

    const columns = result[0].columns;
    const values = result[0].values[0];
    const record: any = {};
    columns.forEach((col, i) => { record[col] = values[i]; });

    res.json({
      success: true,
      data: {
        id: record.id,
        userId: record.user_id,
        recordType: record.record_type,
        mealTime: record.meal_time,
        dishes: JSON.parse(record.dishes || '[]'),
        totalCalories: record.total_calories,
        totalProtein: record.total_protein,
        totalCarbs: record.total_carbohydrates,
        totalFat: record.total_fat,
        notes: record.notes,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { recordType, mealTime, dishes, notes } = req.body;

    if (!recordType || !dishes || !Array.isArray(dishes)) {
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

    const recordId = uuidv4();
    db.run(
      `INSERT INTO meal_records (id, user_id, record_type, meal_time, dishes, total_calories, total_protein, total_carbohydrates, total_fat, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        recordId,
        req.user!.id,
        recordType,
        mealTime || new Date().toISOString(),
        JSON.stringify(dishes),
        Math.round(totalCalories),
        Math.round(totalProtein * 10) / 10,
        Math.round(totalCarbs * 10) / 10,
        Math.round(totalFat * 10) / 10,
        notes || null
      ]
    );
    saveDb();

    res.status(201).json({
      success: true,
      data: {
        id: recordId,
        recordType,
        mealTime: mealTime || new Date().toISOString(),
        dishes,
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

router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { recordType, mealTime, dishes, notes } = req.body;
    const db = await getDb();

    const result = db.exec(
      'SELECT * FROM meal_records WHERE id = ? AND user_id = ?',
      [req.params.id, req.user!.id]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ success: false, error: { message: '记录不存在' } });
    }

    const columns = result[0].columns;
    const values = result[0].values[0];
    const existing: any = {};
    columns.forEach((col, i) => { existing[col] = values[i]; });

    let totalCalories = existing.total_calories || 0;
    let totalProtein = existing.total_protein || 0;
    let totalCarbs = existing.total_carbohydrates || 0;
    let totalFat = existing.total_fat || 0;

    if (dishes) {
      totalCalories = 0;
      totalProtein = 0;
      totalCarbs = 0;
      totalFat = 0;

      for (const dish of dishes) {
        const dishResult = db.exec('SELECT * FROM dishes WHERE id = ? AND is_active = 1', [dish.dishId]);
        if (dishResult.length > 0 && dishResult[0].values.length > 0) {
          const dishColumns = dishResult[0].columns;
          const dishValues = dishResult[0].values[0];
          const dbDish: any = {};
          dishColumns.forEach((col, i) => { dbDish[col] = dishValues[i]; });
          
          const portion = dish.portion || 100;
          const multiplier = portion / 100;
          
          totalCalories += dbDish.calories_per_100g * multiplier;
          totalProtein += dbDish.protein * multiplier;
          totalCarbs += dbDish.carbohydrates * multiplier;
          totalFat += dbDish.fat * multiplier;
        }
      }
    }

    const dishesToUse = dishes || JSON.parse(existing.dishes || '[]');

    db.run(
      `UPDATE meal_records SET record_type = ?, meal_time = ?, dishes = ?, total_calories = ?, total_protein = ?, total_carbohydrates = ?, total_fat = ?, notes = ?, updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`,
      [
        recordType || existing.record_type,
        mealTime || existing.meal_time,
        JSON.stringify(dishesToUse),
        Math.round(totalCalories),
        Math.round(totalProtein * 10) / 10,
        Math.round(totalCarbs * 10) / 10,
        Math.round(totalFat * 10) / 10,
        notes !== undefined ? notes : existing.notes,
        req.params.id,
        req.user!.id
      ]
    );
    saveDb();

    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    db.run('DELETE FROM meal_records WHERE id = ? AND user_id = ?', [req.params.id, req.user!.id]);
    saveDb();

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
