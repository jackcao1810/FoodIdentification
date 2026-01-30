import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/food_identification.db');
const db = new Database(dbPath);

console.log('正在初始化数据库...');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    target_calories INTEGER DEFAULT 2000,
    dietary_preferences TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS dishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    image_url VARCHAR(500),
    calories_per_100g DECIMAL(8,2) NOT NULL,
    protein DECIMAL(8,2),
    carbohydrates DECIMAL(8,2),
    fat DECIMAL(8,2),
    fiber DECIMAL(8,2),
    sodium DECIMAL(8,2),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS recognition_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    recognized_dishes TEXT,
    total_calories DECIMAL(8,2),
    confidence_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS meal_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    record_type VARCHAR(20) NOT NULL,
    meal_time DATETIME NOT NULL,
    dishes TEXT NOT NULL,
    total_calories DECIMAL(8,2),
    total_protein DECIMAL(8,2),
    total_carbohydrates DECIMAL(8,2),
    total_fat DECIMAL(8,2),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS recommendations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    recommendation_type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    related_dishes TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_recognition_records_user_id ON recognition_records(user_id);
  CREATE INDEX IF NOT EXISTS idx_meal_records_user_id ON meal_records(user_id);
  CREATE INDEX IF NOT EXISTS idx_meal_records_meal_time ON meal_records(meal_time);
  CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category);
  CREATE INDEX IF NOT EXISTS idx_dishes_name ON dishes(name);
`);

const existingDishes = db.prepare('SELECT COUNT(*) as count FROM dishes').get() as any;
if (existingDishes.count === 0) {
  console.log('正在插入初始菜品数据...');
  
  const insertDish = db.prepare(`
    INSERT INTO dishes (name, category, description, calories_per_100g, protein, carbohydrates, fat, fiber, sodium)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const dishes = [
    ['宫保鸡丁', '荤菜', '经典川菜，鸡肉配花生', 245, 18.5, 12.3, 14.2, 1.5, 580],
    ['红烧肉', '荤菜', '五花肉红烧，肥而不腻', 320, 12.1, 8.2, 26.8, 0.2, 420],
    ['糖醋里脊', '荤菜', '酸甜口味，里脊肉', 260, 20.3, 18.5, 12.1, 0.5, 380],
    ['番茄炒蛋', '素菜', '番茄配鸡蛋', 120, 8.2, 6.8, 7.5, 1.2, 320],
    ['麻婆豆腐', '素菜', '麻辣豆腐，川菜经典', 180, 12.5, 8.3, 11.2, 2.1, 480],
    ['回锅肉', '荤菜', '五花肉炒制', 280, 15.2, 5.8, 22.1, 0.3, 520],
    ['水煮鱼', '荤菜', '麻辣水煮鱼片', 220, 18.5, 5.2, 14.8, 1.0, 680],
    ['蒸蛋', '素菜', '嫩滑蒸蛋', 80, 7.8, 1.5, 5.2, 0.1, 180],
    ['炒青菜', '素菜', '清炒时蔬', 45, 2.5, 5.8, 1.8, 2.5, 220],
    ['米饭', '主食', '白米饭', 116, 2.6, 25.6, 0.3, 0.4, 2],
    ['馒头', '主食', '白面馒头', 223, 7.0, 47.0, 1.1, 1.0, 5],
    ['面条', '主食', '煮面条', 138, 4.5, 28.4, 0.8, 1.2, 4],
    ['炒饭', '主食', '蛋炒饭', 186, 5.8, 26.4, 6.2, 0.8, 420],
    ['酸辣土豆丝', '素菜', '土豆丝酸辣口味', 120, 2.5, 22.5, 3.2, 1.8, 380],
    ['红烧茄子', '素菜', '红烧茄子', 98, 4.2, 8.5, 5.8, 2.1, 420],
    ['糖醋排骨', '荤菜', '糖醋口味排骨', 295, 18.2, 15.8, 18.5, 0.2, 450],
    ['清蒸鱼', '荤菜', '清淡蒸鱼', 120, 16.5, 0.5, 5.8, 0.1, 280],
    ['蒜蓉西兰花', '素菜', '蒜蓉炒西兰花', 55, 4.5, 6.2, 1.8, 2.8, 180],
    ['宫保虾球', '海鲜', '虾球配花生', 180, 16.8, 8.5, 8.2, 1.2, 520],
    ['干煸豆角', '素菜', '干煸四季豆', 145, 5.2, 12.5, 8.8, 3.2, 380],
  ];

  for (const dish of dishes) {
    insertDish.run(...dish);
  }

  console.log(`已插入 ${dishes.length} 道菜品`);
}

console.log('数据库初始化完成！');
console.log(`数据库路径: ${dbPath}`);
