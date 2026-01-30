import { Router } from 'express';
import { getDb, saveDb } from '../config/database.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

function mapDish(row: any[], columns: string[]) {
  const dish: any = {};
  columns.forEach((col, i) => {
    let value = row[i];
    if (col === 'calories_per_100g') col = 'caloriesPer100g';
    if (col === 'image_url') col = 'imageUrl';
    if (col === 'carbohydrates') col = 'carbohydrates';
    dish[col] = value;
  });
  return dish;
}

router.get('/', async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const db = await getDb();
    
    let query = 'SELECT * FROM dishes WHERE is_active = 1';
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const offset = (Number(page) - 1) * Number(limit);
    query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const result = db.exec(query, params);
    
    let dishes: any[] = [];
    if (result.length > 0) {
      const columns = result[0].columns;
      dishes = result[0].values.map((row) => mapDish(row, columns));
    }

    const countResult = db.exec('SELECT COUNT(*) as total FROM dishes WHERE is_active = 1');
    const total = countResult.length > 0 ? countResult[0].values[0][0] : 0;

    res.json({
      success: true,
      data: dishes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT DISTINCT category FROM dishes WHERE is_active = 1 ORDER BY category');
    
    const categories = result.length > 0 
      ? result[0].values.map((row: any[]) => row[0])
      : [];
      
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    const db = await getDb();
    
    if (!q || (q as string).length < 1) {
      return res.json({ success: true, data: [] });
    }

    const result = db.exec('SELECT * FROM dishes WHERE is_active = 1 AND name LIKE ? LIMIT 10', [`%${q}%`]);
    
    let dishes: any[] = [];
    if (result.length > 0) {
      const columns = result[0].columns;
      dishes = result[0].values.map((row) => mapDish(row, columns));
    }

    res.json({ success: true, data: dishes });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT * FROM dishes WHERE id = ? AND is_active = 1', [req.params.id]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ success: false, error: { message: '菜品不存在' } });
    }

    const columns = result[0].columns;
    const values = result[0].values[0];
    const dish = mapDish(values, columns);

    res.json({ success: true, data: dish });
  } catch (error) {
    next(error);
  }
});

export default router;
