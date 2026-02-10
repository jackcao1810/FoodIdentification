# 食堂菜品热量识别系统

**一个智能的食堂菜品热量识别和营养建议系统，支持拍照识别菜品并估算热量，同时提供个性化的营养建议。**

## 功能特性

- 📸 **多种上传方式**：支持拍照、相册选择、拖拽上传
- 🤖 **AI菜品识别**：基于 PyTorch + Hugging Face nateraw/food 模型
- 📊 **热量计算**：自动估算菜品热量和营养成分（101 道菜品）
- 💡 **智能建议**：基于历史数据提供个性化营养建议
- 📈 **数据统计**：记录和分析饮食历史
- 🐳 **Docker 部署**：支持容器化部署

## 技术栈

### 前端

- React 18 + TypeScript
- Ant Design 5.x UI 组件库
- Redux Toolkit 状态管理
- React Router 路由管理
- Axios HTTP 客户端
- Heroicons 图标库

### 后端服务

- Node.js 20 + Express
- SQLite 轻量级数据库
- JWT 用户认证
- Multer 文件上传
- Axios + form-data 与 Python 服务通信

### AI 识别服务

- Python 3.11 + FastAPI
- PyTorch 深度学习框架
- Hugging Face Transformers
- nateraw/food 预训练模型（Food-101 数据集）

## 支持的菜品

系统支持 **101 种 Food-101 数据集菜品**的识别和营养计算：

| 类别 | 数量 | 示例菜品 |
|------|------|----------|
| 甜点 | 25 | 苹果派、芝士蛋糕、提拉米苏、马卡龙 |
| 肉类 | 15 | 烤肋排、菲力牛排、北京烤鸭、猪排 |
| 海鲜 | 12 | 炸鱼薯条、烤三文鱼、刺身、生蚝 |
| 素菜 | 8 | 凯撒沙拉、希腊沙拉、海藻沙拉 |
| 主食 | 28 | 石锅拌饭、披萨、汉堡、寿司 |
| 汤 | 5 | 蛤蜊浓汤、法式洋葱汤、味增汤 |
| 三明治/卷饼 | 8 | 总汇三明治、鸡肉墨西哥饼、热狗 |

## 快速开始

### 环境要求

- Node.js 18+
- Python 3.11+
- npm 或 yarn

### 本地开发

```bash
# 1. 安装 Python 依赖
cd python-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# 2. 启动 Python 服务（端口 8000）
python app.py

# 3. 安装 Node.js 依赖
cd server
npm install

# 4. 启动 Node.js 服务（端口 3001）
npm run dev

# 5. 安装前端依赖
cd ../client
npm install

# 6. 启动前端开发服务器（端口 5173）
npm run dev
```

访问 http://localhost:5173 即可使用。

### Docker 部署

```bash
# 构建并启动所有服务
docker compose build
docker compose up -d

# 验证服务
curl http://localhost/health      # Python 服务
curl http://localhost/api/health   # Node.js 服务
```

访问 http://localhost 即可使用。

## 项目结构

```
FoodIdentification/
├── client/                    # React 前端应用
│   ├── src/
│   │   ├── components/         # 公共组件
│   │   │   ├── common/        # 通用组件
│   │   │   ├── layout/        # 布局组件
│   │   │   └── upload/        # 上传组件
│   │   ├── pages/             # 页面组件
│   │   │   ├── auth/          # 认证页面
│   │   │   ├── Home.tsx       # 首页
│   │   │   ├── Upload.tsx     # 上传页面
│   │   │   ├── ResultEnhanced.tsx  # 识别结果
│   │   │   ├── History.tsx    # 历史记录
│   │   │   └── Statistics.tsx # 统计页面
│   │   ├── services/          # 服务层
│   │   ├── hooks/             # 自定义 Hooks
│   │   ├── store/             # Redux 状态管理
│   │   ├── types/             # 类型定义
│   │   └── utils/             # 工具函数
│   ├── Dockerfile             # Docker 构建文件
│   └── vite.config.ts         # Vite 配置
│
├── server/                    # Node.js 后端服务
│   ├── src/
│   │   ├── config/            # 配置文件
│   │   ├── middleware/        # 中间件
│   │   ├── routes/            # 路由
│   │   ├── types/             # 类型定义
│   │   └── server.ts          # 服务入口
│   ├── Dockerfile             # Docker 构建文件
│   └── package.json
│
├── python-service/            # Python AI 识别服务
│   ├── app.py                 # FastAPI 服务入口
│   ├── food_recognition.py    # 核心识别逻辑
│   ├── database.py            # SQLite 数据库操作
│   ├── requirements.txt        # Python 依赖
│   ├── Dockerfile             # Docker 构建文件
│   └── README.md              # Python 服务文档
│
├── docker/                     # Docker 配置
│   ├── nginx.conf             # Nginx 配置
│   └── ...
│
├── docs/                      # 项目文档
│   ├── ARCHITECTURE.md        # 系统架构设计
│   ├── PHASE1_DEVELOPMENT.md  # 第一阶段开发文档
│   ├── PHASE2_DEVELOPMENT.md  # 第二阶段开发文档
│   └── DOCKER_DEPLOYMENT.md   # Docker 部署指南
│
├── docker-compose.yml          # Docker Compose 配置
└── README.md                   # 本文档
```

## 核心功能

### 1. 图片上传与处理

- 支持多种上传方式（拍照、相册、拖拽）
- 摄像头实时预览和拍照
- 图片预览、旋转、缩放
- 自动图片压缩

### 2. 菜品识别

- 基于 Food-101 数据集的 AI 识别
- 置信度过滤（默认 > 50%）
- 多菜品同时识别
- 识别结果实时展示

### 3. 热量计算

- 自动计算卡路里
- 蛋白质、碳水、脂肪详细展示
- 分量调整滑块
- 实时更新营养数据

### 4. 饮食记录

- 记录饮食历史
- 按日期筛选
- 营养数据统计
- 记录删除功能

## API 接口

### Python AI 服务

| 端点 | 方法 | 描述 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/recognize` | POST | 菜品识别 |
| `/dishes` | GET | 获取所有菜品 |
| `/dishes/{id}` | GET | 获取单个菜品 |
| `/model/info` | GET | 模型信息 |
| `/model/status` | GET | 模型下载状态 |
| `/model/download` | GET | 手动下载模型 |

### Node.js 服务

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/recognition/recognize` | POST | 菜品识别 |
| `/api/recognition/history` | GET | 获取识别历史 |
| `/api/records` | GET/POST | 饮食记录 |
| `/api/statistics` | GET | 统计数据 |

## 本地模型缓存

Python 服务支持将模型缓存到本地磁盘：

1. **首次启动**：从 Hugging Face 下载模型
2. **后续启动**：直接从本地加载
3. **离线使用**：首次下载后无需网络

**模型缓存位置：** `python-service/models/food_nateraw_food/`

## 数据库

### 用户数据（Node.js）

- `users` - 用户信息
- `recognition_records` - 识别记录
- `meal_records` - 饮食记录
- `recommendations` - 营养建议
- `user_goals` - 用户目标

### 菜品数据（Python）

- `dishes` - 101 道菜品营养数据

## 开发文档

- [系统架构设计](docs/ARCHITECTURE.md)
- [第一阶段开发文档](docs/PHASE1_DEVELOPMENT.md)
- [第二阶段开发文档](docs/PHASE2_DEVELOPMENT.md)
- [Docker 部署指南](docs/DOCKER_DEPLOYMENT.md)
- [Python 服务文档](python-service/README.md)

## 许可证

MIT License
