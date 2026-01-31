import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb } from '../config/database.js';
import { AuthRequest, authenticateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 2, max: 50 }).withMessage('用户名需要2-50个字符'),
    body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱地址'),
    body('password').isLength({ min: 6 }).withMessage('密码至少需要6个字符'),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
      }

      const { username, email, password } = req.body;
      const db = await getDb();

      const existingUser = db.exec('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser.length > 0 && existingUser[0].values.length > 0) {
        throw new AppError('该邮箱已被注册', 400);
      }

      const existingUsername = db.exec('SELECT id FROM users WHERE username = ?', [username]);
      if (existingUsername.length > 0 && existingUsername[0].values.length > 0) {
        throw new AppError('用户名已被使用', 400);
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const userId = uuidv4();

      db.run(
        `INSERT INTO users (id, username, email, password_hash, target_calories, created_at, updated_at)
         VALUES (?, ?, ?, ?, 2000, datetime('now'), datetime('now'))`,
        [userId, username, email, hashedPassword]
      );
      saveDb();

      const token = jwt.sign(
        { id: userId, email, username },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        data: {
          user: { id: userId, username, email, targetCalories: 2000 },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱地址'),
    body('password').notEmpty().withMessage('请输入密码'),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
      }

      const { email, password } = req.body;
      const db = await getDb();

      const result = db.exec('SELECT * FROM users WHERE email = ?', [email]);
      if (result.length === 0 || result[0].values.length === 0) {
        throw new AppError('邮箱或密码错误', 401);
      }

      const columns = result[0].columns;
      const values = result[0].values[0];
      const user: any = {};
      columns.forEach((col, i) => { user[col] = values[i]; });

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new AppError('邮箱或密码错误', 401);
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            targetCalories: user.target_calories,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/logout', authenticateToken, (req: AuthRequest, res) => {
  res.json({ success: true, message: '退出成功' });
});

router.get('/profile', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT id, username, email, height_cm, weight_kg, target_calories, target_protein, target_carbohydrates, target_fat FROM users WHERE id = ?', [req.user!.id]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      throw new AppError('用户不存在', 404);
    }

    const columns = result[0].columns;
    const values = result[0].values[0];
    const user: any = {};
    columns.forEach((col, i) => { user[col] = values[i]; });

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        heightCm: user.height_cm,
        weightKg: user.weight_kg,
        targetCalories: user.target_calories,
        targetProtein: user.target_protein || 80,
        targetCarbohydrates: user.target_carbohydrates || 300,
        targetFat: user.target_fat || 65,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { username, heightCm, weightKg, targetCalories, targetProtein, targetCarbohydrates, targetFat } = req.body;
    const db = await getDb();

    const updates: string[] = [];
    const values: any[] = [];

    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    if (heightCm !== undefined) {
      updates.push('height_cm = ?');
      values.push(heightCm);
    }
    if (weightKg !== undefined) {
      updates.push('weight_kg = ?');
      values.push(weightKg);
    }
    if (targetCalories !== undefined) {
      updates.push('target_calories = ?');
      values.push(targetCalories);
    }
    if (targetProtein !== undefined) {
      updates.push('target_protein = ?');
      values.push(targetProtein);
    }
    if (targetCarbohydrates !== undefined) {
      updates.push('target_carbohydrates = ?');
      values.push(targetCarbohydrates);
    }
    if (targetFat !== undefined) {
      updates.push('target_fat = ?');
      values.push(targetFat);
    }

    if (updates.length === 0) {
      throw new AppError('没有要更新的字段', 400);
    }

    updates.push('updated_at = datetime("now")');
    values.push(req.user!.id);

    db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    saveDb();

    const result = db.exec('SELECT id, username, email, height_cm, weight_kg, target_calories, target_protein, target_carbohydrates, target_fat FROM users WHERE id = ?', [req.user!.id]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      throw new AppError('用户不存在', 404);
    }

    const columns = result[0].columns;
    const userRow = result[0].values[0];
    const user: any = {};
    columns.forEach((col, i) => { user[col] = userRow[i]; });

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        heightCm: user.height_cm,
        weightKg: user.weight_kg,
        targetCalories: user.target_calories,
        targetProtein: user.target_protein || 80,
        targetCarbohydrates: user.target_carbohydrates || 300,
        targetFat: user.target_fat || 65,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/password', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('请提供当前密码和新密码', 400);
    }

    if (newPassword.length < 6) {
      throw new AppError('新密码至少需要6个字符', 400);
    }

    const db = await getDb();
    const result = db.exec('SELECT * FROM users WHERE id = ?', [req.user!.id]);

    if (result.length === 0 || result[0].values.length === 0) {
      throw new AppError('用户不存在', 404);
    }

    const columns = result[0].columns;
    const values = result[0].values[0];
    const user: any = {};
    columns.forEach((col, i) => { user[col] = values[i]; });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('当前密码错误', 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    db.run('UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?', [hashedPassword, req.user!.id]);
    saveDb();

    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
