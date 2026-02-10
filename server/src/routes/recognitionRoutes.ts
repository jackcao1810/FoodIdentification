import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { getDb, saveDb } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('只支持 JPEG, PNG, WEBP 格式的图片'));
    }
  },
});

router.post('/upload', authenticateToken, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: '请上传图片' } });
    }

    const recordId = uuidv4();
    const imageUrl = `/uploads/${req.file.filename}`;
    const db = await getDb();

    db.run(
      `INSERT INTO recognition_records (id, user_id, image_url, recognized_dishes, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', datetime('now'))`,
      [recordId, req.user!.id, imageUrl, '[]']
    );
    saveDb();

    res.json({
      success: true,
      data: { recordId, imageUrl },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/recognize', authenticateToken, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: '请上传图片' } });
    }

    const recordId = uuidv4();
    const imagePath = path.join(process.cwd(), 'uploads', req.file.filename);
    const imageUrl = `/uploads/${req.file.filename}`;

    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath), req.file.originalname);

    const pythonResponse = await axios.post(
      `${PYTHON_SERVICE_URL}/recognize`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        timeout: 60000,
      }
    );

    const pythonResult = pythonResponse.data;
    if (!pythonResult.success) {
      throw new Error(pythonResult.error?.message || '识别失败');
    }

    const { dishes, totalCalories, totalWeight, processingTime } = pythonResult.data;

    const avgConfidence = dishes.reduce((sum: number, dish: any) => sum + dish.confidence, 0) / dishes.length;

    const db = await getDb();
    db.run(
      `INSERT INTO recognition_records (id, user_id, image_url, recognized_dishes, total_calories, confidence_score, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'completed', datetime('now'))`,
      [recordId, req.user!.id, imageUrl, JSON.stringify(dishes), totalCalories, avgConfidence]
    );
    saveDb();

    res.json({
      success: true,
      data: {
        recordId,
        imageUrl,
        dishes,
        totalCalories,
        totalWeight,
        processingTime,
      },
    });
  } catch (error: any) {
    console.error('识别错误:', error);
    const errorMessage = error.response?.data?.error?.message || error.message || '识别失败';
    res.status(500).json({
      success: false,
      error: { message: errorMessage },
    });
  }
});

router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const result = db.exec(
      'SELECT * FROM recognition_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user!.id]
    );

    let records: any[] = [];
    if (result.length > 0) {
      const columns = result[0].columns;
      records = result[0].values.map((row) => {
        const record: any = {};
        columns.forEach((col, i) => { record[col] = row[i]; });
        record.dishes = JSON.parse(record.recognized_dishes || '[]');
        return record;
      });
    }

    res.json({
      success: true,
      data: records.map((record) => ({
        id: record.id,
        imageUrl: record.image_url,
        dishes: record.dishes,
        totalCalories: record.total_calories,
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
      'SELECT * FROM recognition_records WHERE id = ? AND user_id = ?',
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
        imageUrl: record.image_url,
        dishes: JSON.parse(record.recognized_dishes || '[]'),
        totalCalories: record.total_calories,
        confidenceScore: record.confidence_score,
        status: record.status,
        createdAt: record.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    db.run(
      'DELETE FROM recognition_records WHERE id = ? AND user_id = ?',
      [req.params.id, req.user!.id]
    );
    saveDb();

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
