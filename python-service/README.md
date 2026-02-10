# Food Recognition Service

基于 PyTorch 和 Hugging Face Transformers 的菜品识别服务，使用 `nateraw/food` 模型（Food-101 数据集）。

## 功能特性

- 菜品图片识别
- 营养信息计算
- 支持单张图片和批量识别
- 自动匹配中文菜品名称和营养数据
- 统一菜品数据库 API
- **本地模型缓存** - 支持离线使用

## 安装依赖

```bash
pip install -r requirements.txt
```

## 启动服务

```bash
# 开发模式
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# 生产模式
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

## API 接口

### 健康检查

```http
GET /health
```

响应:
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### 识别菜品

```http
POST /recognize
Content-Type: multipart/form-data

Request: image file
```

示例请求（cURL）:
```bash
curl -X POST "http://localhost:8000/recognize" \
  -F "file=@/path/to/food.jpg"
```

响应示例:
```json
{
  "success": true,
  "data": {
    "dishes": [
      {
        "dishId": 1,
        "dishName": "苹果派",
        "category": "甜点",
        "confidence": 0.95,
        "caloriesPer100g": 237,
        "protein": 2.1,
        "carbohydrates": 31.4,
        "fat": 11.3,
        "density": 0.75,
        "standardPortion": 100
      }
    ],
    "totalCalories": 237,
    "totalWeight": 100,
    "processingTime": 150
  }
}
```

### 批量识别

```http
POST /recognize/batch
Content-Type: multipart/form-data

Request: multiple image files (max 10)
```

### 模型信息

```http
GET /model/info
```

响应示例:
```json
{
  "success": true,
  "data": {
    "model_name": "nateraw/food",
    "num_classes": 101,
    "labels": ["apple_pie", "baby_back_ribs", ...],
    "supported_dishes": 101
  }
}
```

### 模型状态

```http
GET /model/status
```

检查模型是否已下载到本地。

响应示例:
```json
{
  "success": true,
  "data": {
    "model_name": "nateraw/food",
    "local_path": "models/food_nateraw_food",
    "is_cached": true,
    "cache_exists": true
  }
}
```

### 下载模型

```http
GET /model/download
```

手动触发模型下载到本地（首次启动时会自动下载）。

### 获取菜品列表

```http
GET /dishes
```

响应示例:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "苹果派",
      "category": "甜点",
      "description": "酥皮包裹苹果肉桂馅料烤制",
      "calories_per_100g": 237,
      "protein": 2.1,
      "carbohydrates": 31.4,
      "fat": 11.3,
      "density": 0.75,
      "standard_portion": 100,
      "food101_class": "apple_pie"
    },
    ...
  ]
}
```

### 获取单个菜品

```http
GET /dishes/{dish_id}
```

响应示例:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "苹果派",
    "category": "甜点",
    "calories_per_100g": 237,
    "protein": 2.1,
    "carbohydrates": 31.4,
    "fat": 11.3,
    ...
  }
}
```

## 支持的菜品

当前系统支持 **101 种 Food-101 数据集菜品**的识别和营养计算：

| 类别 | 菜品数量 | 示例 |
|------|----------|------|
| 甜点 | 25 | 苹果派、芝士蛋糕、提拉米苏、马卡龙 |
| 肉类 | 15 | 烤肋排、菲力牛排、北京烤鸭、猪排 |
| 海鲜 | 12 | 炸鱼薯条、烤三文鱼、刺身、生蚝 |
| 素菜 | 8 | 凯撒沙拉、希腊沙拉、海藻沙拉 |
| 主食 | 28 | 石锅拌饭、披萨、汉堡、寿司 |
| 汤 | 5 | 蛤蜊浓汤、法式洋葱汤、味增汤 |
| 三明治/卷饼 | 8 | 总汇三明治、鸡肉墨西哥饼、热狗 |

完整菜品列表请调用 `GET /dishes` API 获取。

## 数据库

### SQLite 数据库

菜品数据存储在 `data/dishes.db` 文件中，包含 101 道菜品的完整营养信息。

数据库结构:
```sql
CREATE TABLE dishes (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    calories_per_100g REAL NOT NULL,
    protein REAL,
    carbohydrates REAL,
    fat REAL,
    density REAL,
    standard_portion INTEGER,
    food101_class TEXT
);
```

## 与前端集成

前端（React）通过 Node.js 后端代理调用此服务获取菜品数据：

```
前端 → Node.js后端(/api/dishes) → Python服务(/dishes) → SQLite数据库
```

### 前端获取菜品列表

```typescript
// 前端调用 Node.js 后端
const response = await api.get('/dishes');
// Node.js 后端代理请求到 Python 服务
// 返回格式化后的菜品数据
```

## 模型说明

使用 `nateraw/food` 模型，该模型基于 Food-101 数据集训练，可识别 101 种菜品。

参考: https://huggingface.co/nateraw/food

### 本地模型缓存

服务支持将模型缓存到本地磁盘，首次启动时会自动从 Hugging Face 下载模型，后续启动直接从本地加载，支持离线使用。

**模型缓存位置：**
```
python-service/
├── models/
│   └── food_nateraw_food/
│       ├── config.json
│       ├── pytorch_model.bin
│       └── preprocessor_config.json
```

**加载逻辑：**
1. 检查本地是否有缓存模型
2. 如有 → 从本地加载
3. 如无 → 从 Hugging Face 下载到本地，然后加载

## 项目结构

```
python-service/
├── app.py                    # FastAPI 服务入口
├── food_recognition.py       # 核心识别逻辑
├── database.py               # SQLite 数据库操作
├── requirements.txt         # Python 依赖
├── data/
│   └── dishes.db             # 菜品数据库
├── models/                   # 本地模型缓存
│   └── food_nateraw_food/    # Hugging Face 模型
└── README.md                 # 本文档
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| MODEL_NAME | 模型名称 | nateraw/food |
| DATABASE_PATH | 数据库路径 | data/dishes.db |

## 更新日志

### 2026-02-10
- 扩展菜品数据库至 101 道 Food-101 菜品
- 新增 `/dishes` 和 `/dishes/{id}` API 端点
- 前端改为通过 API 获取菜品数据，统一数据源
- **新增本地模型缓存功能**
  - 首次启动自动从 Hugging Face 下载模型到本地
  - 后续启动直接从本地加载，支持离线使用
  - 新增 `/model/status` 和 `/model/download` API 端点
