# Food Recognition Service

基于 PyTorch 和 Hugging Face Transformers 的菜品识别服务，使用 `nateraw/food` 模型（Food-101 数据集）。

## 功能特性

- 菜品图片识别
- 营养信息计算
- 支持单张图片和批量识别
- 自动匹配中文菜品名称和营养数据

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
        "dishName": "宫保鸡丁",
        "category": "肉类",
        "confidence": 0.95,
        "caloriesPer100g": 198,
        "protein": 16.2,
        "carbohydrates": 8.4,
        "fat": 12.1,
        "density": 0.85,
        "standardPortion": 120
      }
    ],
    "totalCalories": 238,
    "totalWeight": 120,
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

## 支持的菜品

当前系统支持 20 种中式菜品的识别和营养计算，包括：

| 类别 | 菜品示例 |
|------|----------|
| 肉类 | 宫保鸡丁、红烧肉、糖醋里脊、回锅肉 |
| 素菜 | 番茄炒蛋、炒青菜、蒜蓉西兰花、酸辣土豆丝 |
| 水产 | 水煮鱼、清蒸鲈鱼 |
| 蛋类 | 蒸蛋 |
| 主食 | 米饭、蛋炒饭 |
| 豆制品 | 麻婆豆腐 |

## 配置

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| MODEL_NAME | 模型名称 | nateraw/food |

## 项目结构

```
python-service/
├── app.py                    # FastAPI 服务入口
├── food_recognition.py       # 核心识别逻辑
├── requirements.txt           # Python 依赖
└── README.md                 # 本文档
```

## 模型说明

使用 `nateraw/food` 模型，该模型基于 Food-101 数据集训练，可识别 101 种菜品。

参考: https://huggingface.co/nateraw/food

## 与后端集成

Node.js 后端可通过 HTTP 请求调用此服务:

```typescript
const response = await axios.post('http://localhost:8000/recognize', {
  formData: {
    image: fs.createReadStream(imagePath)
  }
});
```
