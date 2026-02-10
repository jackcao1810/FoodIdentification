# 食堂菜品热量识别系统 - 系统架构设计

**文档版本：** 2.0  
**更新日期：** 2026-02-10

## 1. 系统整体架构

本系统采用前后端分离的微服务架构设计，前端基于React构建单页应用，后端采用Node.js + Express提供RESTful API服务，AI推理功能由Python后端（FastAPI + PyTorch）独立完成。

**系统架构图：**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           用户终端层                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Web浏览器 (Chrome/Edge/Firefox)              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │   │
│  │  │  拍照上传   │  │  相册选择   │  │     拖拽上传区域        │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │   │
│  │         │                │                      │               │   │
│  │         └────────────────┼──────────────────────┘               │   │
│  │                          ▼                                      │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │              React SPA 前端应用                          │   │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────────┐  │   │   │
│  │  │  │图片处理 │ │状态管理 │ │路由导航 │ │API服务调用   │  │   │   │
│  │  │  │组件     │ │(Redux)  │ │(React   │ │             │  │   │   │
│  │  │  │         │ │         │ │ Router) │ │             │  │   │   │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └───────────────┘  │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼ (HTTPS)                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       负载均衡层 (Nginx)                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
┌─────────────────────────────────────────────────┐  ┌─────────────────────────────────────────────────┐
│               Node.js 后端服务                     │  │              Python AI 识别服务                   │
│                                                 │  │                                                 │
│  ┌─────────────────────────────────────────┐   │  │  ┌─────────────────────────────────────────┐   │
│  │  Express Server + API Routes             │   │  │  │  FastAPI Server + AI Model             │   │
│  │  - /api/v1/* REST API                 │   │  │  │  - /recognize 菜品识别                 │   │
│  │  - 认证授权 (JWT)                      │   │  │  │  - /dishes 菜品数据库 API             │   │
│  │  - 图片上传处理                         │   │  │  │  - /health 健康检查                   │   │
│  └─────────────────────────────────────────┘   │  │  └─────────────────────────────────────────┘   │
│                    │                            │  │                    │                            │
│                    ▼                            │  │                    ▼                            │
│  ┌─────────────────────────────────────────┐   │  │  ┌─────────────────────────────────────────┐   │
│  │            数据存储层                     │   │  │  │            数据存储层                     │   │
│  │  - SQLite (用户、记录)                   │   │  │  │  - SQLite (菜品数据库 dishes.db)      │   │
│  │  - 文件系统 (上传图片)                    │   │  │  │  - Hugging Face Model (nateraw/food)  │   │
│  └─────────────────────────────────────────┘   │  │  └─────────────────────────────────────────┘   │
│                                                 │  │                                                 │
└─────────────────────────────────────────────────┘  └─────────────────────────────────────────────────┘
```

**技术选型说明：**

前端技术栈选择React + TypeScript是为了获得良好的开发体验和类型安全保障。Ant Design作为UI组件库提供了丰富的企业级组件，能够快速构建美观且功能完善的界面。React Camera Pro专门用于处理移动端的摄像头拍照功能，支持相机预览、拍照、录制等操作。Redux Toolkit作为状态管理方案，能够集中管理应用的全局状态，包括用户信息、识别历史、营养数据等。

后端技术栈选择Node.js + Express是因为JavaScript/TypeScript全栈开发可以提高开发效率，Express框架简洁灵活，适合构建RESTful API。SQLite作为轻量级嵌入式数据库，适合本项目的用户规模，无需额外部署数据库服务。Sharp是Node.js生态中性能优异的图片处理库，用于图片压缩、格式转换等操作。JWT用于用户认证，简洁安全且支持分布式部署。

**Python AI 服务技术栈：**
- **FastAPI**：高性能Python Web框架，异步支持优秀
- **PyTorch**：深度学习框架，用于加载和运行神经网络模型
- **Transformers (Hugging Face)**：预训练模型库，提供 `nateraw/food` 模型
- **SQLite**：轻量级嵌入式数据库，存储菜品营养信息

**服务通信架构：**
```
前端 (React) ──▶ Node.js后端 ──▶ Python AI服务
     │              │              │
     │              │              │
     ▼              ▼              ▼
  localhost:5173  localhost:3001  localhost:8000
     │              │              │
     └──────────────┼──────────────┘
                    │
              Vite Proxy 配置
            (/api/* → localhost:3001)
            (/dishes/* → localhost:8000)
```

## 2. 前端架构设计

**前端目录结构：**

```
client/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── assets/                    # 静态资源
│   │   ├── images/               # 图片资源
│   │   ├── icons/                # 图标资源
│   │   └── styles/               # 全局样式
│   ├── components/               # 公共组件
│   │   ├── common/              # 通用组件
│   │   │   ├── Button/          # 按钮组件
│   │   │   ├── Card/            # 卡片组件
│   │   │   ├── Modal/           # 弹窗组件
│   │   │   ├── Loading/         # 加载组件
│   │   │   └── ErrorBoundary/   # 错误边界
│   │   ├── layout/              # 布局组件
│   │   │   ├── Header/          # 顶部导航
│   │   │   ├── Sidebar/         # 侧边栏
│   │   │   ├── MainLayout/      # 主布局
│   │   │   └── PageLayout/      # 页面布局
│   │   └── upload/              # 上传相关组件
│   │       ├── ImageUploader/   # 图片上传器
│   │       ├── CameraCapture/   # 拍照组件
│   │       ├── DragDropZone/    # 拖拽区域
│   │       └── ImagePreview/    # 图片预览
│   ├── features/                # 功能模块
│   │   ├── recognition/         # 菜品识别模块
│   │   │   ├── components/      # 识别模块组件
│   │   │   │   ├── DishSelector/     # 菜品选择器
│   │   │   │   ├── ConfidenceMeter/  # 置信度仪表
│   │   │   │   └── MultiDishView/    # 多菜品视图
│   │   │   ├── hooks/           # 识别模块钩子
│   │   │   │   ├── useDishRecognition.ts
│   │   │   │   └── useImagePreprocessing.ts
│   │   │   ├── services/        # 识别模块服务
│   │   │   │   └── dishRecognition.ts
│   │   │   ├── types/           # 识别模块类型
│   │   │   │   └── index.ts
│   │   │   └── index.tsx        # 识别模块入口
│   │   ├── calories/            # 热量计算模块
│   │   │   ├── components/      # 热量模块组件
│   │   │   │   ├── CalorieDisplay/   # 热量展示
│   │   │   │   ├── NutritionPanel/   # 营养成分面板
│   │   │   │   └── PortionEstimator/ # 分量估算器
│   │   │   ├── hooks/           # 热量模块钩子
│   │   │   │   └── useCalorieCalculation.ts
│   │   │   ├── services/        # 热量计算服务
│   │   │   │   └── calorieService.ts
│   │   │   ├── types/           # 热量模块类型
│   │   │   └── index.tsx        # 热量模块入口
│   │   ├── statistics/          # 数据统计模块
│   │   │   ├── components/      # 统计模块组件
│   │   │   │   ├── TrendChart/      # 趋势图表
│   │   │   │   ├── DailySummary/    # 日汇总
│   │   │   │   └── NutrientPieChart/# 营养饼图
│   │   │   ├── hooks/           # 统计模块钩子
│   │   │   │   └── useStatistics.ts
│   │   │   ├── services/        # 统计服务
│   │   │   │   └── statisticsService.ts
│   │   │   ├── types/           # 统计模块类型
│   │   │   └── index.tsx        # 统计模块入口
│   │   ├── recommendations/     # 营养建议模块
│   │   │   ├── components/      # 建议模块组件
│   │   │   │   ├── RecommendationCard/ # 建议卡片
│   │   │   │   ├── HealthAlert/        # 健康提醒
│   │   │   │   └── SuggestionList/     # 建议列表
│   │   │   ├── hooks/           # 建议模块钩子
│   │   │   │   └── useRecommendations.ts
│   │   │   ├── services/        # 建议服务
│   │   │   │   └── recommendationService.ts
│   │   │   ├── types/           # 建议模块类型
│   │   │   └── index.tsx        # 建议模块入口
│   │   └── auth/                # 认证模块
│   │       ├── components/      # 认证组件
│   │       │   ├── LoginForm/       # 登录表单
│   │       │   ├── RegisterForm/    # 注册表单
│   │       │   └── Profile/         # 用户资料
│   │       ├── hooks/           # 认证钩子
│   │       │   └── useAuth.ts
│   │       ├── services/        # 认证服务
│   │       │   └── authService.ts
│   │       ├── types/           # 认证模块类型
│   │       └── index.tsx        # 认证模块入口
│   ├── pages/                   # 页面组件
│   │   ├── Home/               # 首页
│   │   │   └── index.tsx
│   │   ├── Upload/             # 上传页
│   │   │   └── index.tsx
│   │   ├── Result/             # 结果页
│   │   │   └── index.tsx
│   │   ├── History/            # 历史记录页
│   │   │   └── index.tsx
│   │   ├── Statistics/         # 统计页
│   │   │   └── index.tsx
│   │   ├── Profile/            # 个人中心页
│   │   │   └── index.tsx
│   │   └── Settings/           # 设置页
│   │       └── index.tsx
│   ├── services/               # API服务层
│   │   ├── api.ts              # Axios实例配置
│   │   ├── endpoints.ts        # API端点定义
│   │   ├── authService.ts      # 认证API
│   │   ├── dishService.ts      # 菜品API
│   │   ├── calorieService.ts   # 热量API
│   │   ├── recordService.ts    # 记录API
│   │   └── recommendationService.ts # 建议API
│   ├── store/                  # Redux状态管理
│   │   ├── index.ts            # Store配置
│   │   ├── slices/             # Redux Slice
│   │   │   ├── authSlice.ts    # 认证状态
│   │   │   ├── dishSlice.ts    # 菜品状态
│   │   │   ├── calorieSlice.ts # 热量状态
│   │   │   ├── recordSlice.ts  # 记录状态
│   │   │   └── uiSlice.ts      # UI状态
│   │   ├── hooks.ts            # Typed hooks
│   │   └── middleware/         # 自定义中间件
│   │       └── logger.ts
│   ├── hooks/                  # 公共Hooks
│   │   ├── useDebounce.ts      # 防抖Hook
│   │   ├── useLocalStorage.ts  # 本地存储Hook
│   │   └── useMediaQuery.ts    # 媒体查询Hook
│   ├── utils/                  # 工具函数
│   │   ├── format.ts           # 格式化工具
│   │   ├── validation.ts       # 验证工具
│   │   ├── constants.ts        # 常量定义
│   │   └── helpers.ts          # 辅助函数
│   ├── types/                  # 全局类型定义
│   │   ├── api.ts              # API类型
│   │   ├── domain.ts           # 领域类型
│   │   └── common.ts           # 公共类型
│   ├── routes/                 # 路由配置
│   │   ├── index.tsx           # 路由入口
│   │   ├── routes.ts           # 路由定义
│   │   ├── PrivateRoute.tsx    # 私有路由
│   │   └── Guard.tsx           # 路由守卫
│   ├── App.tsx                 # 应用根组件
│   └── index.tsx               # 应用入口
├── .env                        # 环境变量
├── .env.development            # 开发环境变量
├── .env.production             # 生产环境变量
├── package.json
├── tsconfig.json
├── tailwind.config.js          # Tailwind配置
├── vite.config.ts              # Vite配置
└── README.md
```

**状态管理设计（Redux Toolkit）：**

```typescript
// store/slices/authSlice.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

// store/slices/dishSlice.ts
interface DishState {
  recognitionResult: RecognitionResult | null;
  history: DishRecord[];
  loading: boolean;
  confidence: number;
}

const dishSlice = createSlice({
  name: 'dish',
  initialState,
  reducers: {
    setRecognitionResult: (state, action: PayloadAction<RecognitionResult>) => {
      state.recognitionResult = action.payload;
      state.confidence = action.payload.confidence;
    },
    addToHistory: (state, action: PayloadAction<DishRecord>) => {
      state.history.unshift(action.payload);
    },
  },
});
```

**路由配置设计：**

```typescript
// routes/routes.ts
interface RouteConfig {
  path: string;
  element: React.ComponentType;
  children?: RouteConfig[];
  meta?: {
    title: string;
    requiresAuth?: boolean;
    allowedRoles?: UserRole[];
  };
}

const routes: RouteConfig[] = [
  {
    path: '/',
    element: MainLayout,
    children: [
      { path: '', element: Home, meta: { title: '首页' } },
      { path: 'upload', element: Upload, meta: { title: '上传菜品' } },
      { path: 'result/:id', element: Result, meta: { title: '识别结果' } },
      { path: 'history', element: History, meta: { title: '历史记录', requiresAuth: true } },
      { path: 'statistics', element: Statistics, meta: { title: '数据统计', requiresAuth: true } },
      { path: 'profile', element: Profile, meta: { title: '个人中心', requiresAuth: true } },
      { path: 'settings', element: Settings, meta: { title: '设置' } },
    ],
  },
  {
    path: '/auth',
    element: AuthLayout,
    children: [
      { path: 'login', element: Login, meta: { title: '登录' } },
      { path: 'register', element: Register, meta: { title: '注册' } },
    ],
  },
];
```

## 3. 后端架构设计

**后端目录结构：**

```
server/
├── src/
│   ├── config/                  # 配置文件
│   │   ├── index.ts            # 配置导出
│   │   ├── database.ts         # 数据库配置
│   │   ├── jwt.ts              # JWT配置
│   │   ├── server.ts           # 服务器配置
│   │   └── cors.ts             # CORS配置
│   ├── middleware/             # 中间件
│   │   ├── auth.ts             # JWT认证中间件
│   │   ├── errorHandler.ts     # 错误处理中间件
│   │   ├── requestLogger.ts    # 请求日志中间件
│   │   ├── rateLimiter.ts      # 限流中间件
│   │   ├── validator.ts        # 参数验证中间件
│   │   └── uploadMiddleware.ts # 上传处理中间件
│   ├── controllers/            # 控制器层
│   │   ├── authController.ts   # 认证控制器
│   │   ├── dishController.ts   # 菜品控制器
│   │   ├── calorieController.ts# 热量控制器
│   │   ├── recordController.ts # 记录控制器
│   │   └── recommendationController.ts # 建议控制器
│   ├── services/               # 业务逻辑层
│   │   ├── authService.ts      # 认证服务
│   │   ├── dishRecognitionService.ts   # 菜品识别服务
│   │   ├── calorieCalculationService.ts# 热量计算服务
│   │   ├── nutritionService.ts # 营养服务
│   │   ├── recommendationService.ts    # 建议服务
│   │   └── statisticsService.ts        # 统计服务
│   ├── repositories/           # 数据访问层
│   │   ├── UserRepository.ts   # 用户仓储
│   │   ├── DishRepository.ts   # 菜品仓储
│   │   ├── RecordRepository.ts # 记录仓储
│   │   └── NutritionRepository.ts      # 营养数据仓储
│   ├── models/                 # 数据模型
│   │   ├── User.ts             # 用户模型
│   │   ├── Dish.ts             # 菜品模型
│   │   ├── Record.ts           # 记录模型
│   │   └── Nutrition.ts        # 营养数据模型
│   ├── types/                  # 类型定义
│   │   ├── express.d.ts        # Express扩展类型
│   │   ├── api.ts              # API类型
│   │   └── domain.ts           # 领域类型
│   ├── utils/                  # 工具函数
│   │   ├── dateUtils.ts        # 日期工具
│   │   ├── validation.ts       # 验证工具
│   │   ├── passwordUtils.ts    # 密码工具
│   │   └── imageUtils.ts       # 图片工具
│   ├── routes/                 # 路由定义
│   │   ├── index.ts            # 路由入口
│   │   ├── authRoutes.ts       # 认证路由
│   │   ├── dishRoutes.ts       # 菜品路由
│   │   ├── calorieRoutes.ts    # 热量路由
│   │   ├── recordRoutes.ts     # 记录路由
│   │   └── recommendationRoutes.ts     # 建议路由
│   ├── app.ts                  # Express应用
│   └── server.ts               # 服务器入口
├── uploads/                    # 上传文件目录
├── data/                       # 数据文件目录
│   ├── food_database.json      # 食物营养数据库
│   └── initial_dishes.json     # 初始菜品数据
├── .env                        # 环境变量
├── package.json
├── tsconfig.json
└── README.md
```

**API接口设计：**

```
API Base URL: /api/v1

┌─────────────────────────────────────────────────────────────────────────┐
│                          认证模块 /auth                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  POST   /auth/register          注册新用户                               │
│  POST   /auth/login             用户登录                                │
│  POST   /auth/logout            用户登出                                │
│  POST   /auth/refresh           刷新Token                               │
│  GET    /auth/profile           获取用户信息                            │
│  PUT    /auth/profile           更新用户信息                            │
│  PUT    /auth/password          修改密码                                │
│  POST   /auth/forgot-password   忘记密码                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          菜品模块 /dishes                                │
├─────────────────────────────────────────────────────────────────────────┤
│  GET    /dishes                 获取菜品列表                            │
│  GET    /dishes/:id             获取菜品详情                            │
│  POST   /dishes                 创建菜品                                │
│  PUT    /dishes/:id             更新菜品                                │
│  DELETE /dishes/:id             删除菜品                                │
│  GET    /dishes/categories      获取菜品分类                            │
│  GET    /dishes/search          搜索菜品                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        识别模块 /recognition                             │
├─────────────────────────────────────────────────────────────────────────┤
│  POST   /recognition/upload     上传图片进行识别                         │
│  POST   /recognition/analyze    深度分析菜品                            │
│  GET    /recognition/history    获取识别历史                            │
│  GET    /recognition/:id        获取识别记录详情                        │
│  DELETE /recognition/:id        删除识别记录                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          热量模块 /calories                              │
├─────────────────────────────────────────────────────────────────────────┤
│  GET    /calories/dish/:dishId  获取菜品热量信息                        │
│  POST   /calories/calculate     计算自定义食物热量                      │
│  GET    /calories/today         获取今日热量摄入                        │
│  GET    /calories/history       获取热量历史记录                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          记录模块 /records                               │
├─────────────────────────────────────────────────────────────────────────┤
│  GET    /records                获取饮食记录列表                        │
│  GET    /records/:id            获取记录详情                            │
│  POST   /records                创建饮食记录                            │
│  PUT    /records/:id            更新饮食记录                            │
│  DELETE /records/:id            删除饮食记录                            │
│  GET    /records/date/:date     获取指定日期记录                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        建议模块 /recommendations                         │
├─────────────────────────────────────────────────────────────────────────┤
│  GET    /recommendations/daily  获取每日营养建议                        │
│  GET    /recommendations/weekly 获取周度建议                            │
│  GET    /recommendations/analysis 获取深度分析                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        统计模块 /statistics                              │
├─────────────────────────────────────────────────────────────────────────┤
│  GET    /statistics/overview    获取统计概览                            │
│  GET    /statistics/trend       获取趋势数据                            │
│  GET    /statistics/nutrients   获取营养成分统计                        │
│  GET    /statistics/daily       获取每日统计                            │
│  GET    /statistics/weekly      获取周度统计                            │
│  GET    /statistics/monthly     获取月度统计                            │
└─────────────────────────────────────────────────────────────────────────┘
```

**中间件设计：**

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../types/express';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '认证失败，请先登录' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token已过期' });
  }
};

// middleware/errorHandler.ts
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';
  
  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
```

## 4. 数据架构设计

**数据库模型设计（SQLite）：**

```sql
-- 用户表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    target_calories INTEGER DEFAULT 2000,
    dietary_preferences TEXT, -- JSON格式存储饮食偏好
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 菜品表
CREATE TABLE dishes (
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

-- 识别记录表
CREATE TABLE recognition_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    recognized_dishes TEXT NOT NULL, -- JSON格式存储识别出的菜品列表
    total_calories DECIMAL(8,2),
    confidence_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, rejected
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 饮食记录表
CREATE TABLE meal_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    record_type VARCHAR(20) NOT NULL, -- breakfast, lunch, dinner, snack
    meal_time DATETIME NOT NULL,
    dishes TEXT NOT NULL, -- JSON格式存储摄入的菜品
    total_calories DECIMAL(8,2),
    total_protein DECIMAL(8,2),
    total_carbohydrates DECIMAL(8,2),
    total_fat DECIMAL(8,2),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 营养建议表
CREATE TABLE recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    recommendation_type VARCHAR(20) NOT NULL, -- daily, weekly, alert
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    related_dishes TEXT, -- JSON格式相关菜品
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 用户目标表
CREATE TABLE user_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    goal_type VARCHAR(50) NOT NULL, -- calorie, protein, weight
    target_value DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建索引
CREATE INDEX idx_recognition_records_user_id ON recognition_records(user_id);
CREATE INDEX idx_meal_records_user_id ON meal_records(user_id);
CREATE INDEX idx_meal_records_meal_time ON meal_records(meal_time);
CREATE INDEX idx_dishes_category ON dishes(category);
CREATE INDEX idx_dishes_name ON dishes(name);
```

**数据流设计：**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           数据流架构                                     │
└─────────────────────────────────────────────────────────────────────────┘

                          用户上传图片
                              │
                              ▼
┌───────────────────────────────────────────────────────────────────────┐
│                         前端数据流                                      │
│                                                                        │
│   ImageUploader ──▶ ImagePreview ──▶ foodRecognitionService         │
│        │                   │                        │                   │
│        ▼                   ▼                        ▼                   │
│   本地预览          Base64格式            调用 Node.js 后端 API         │
│                                                  │                    │
│                                                  ▼                    │
│                                          /recognition/recognize         │
│                                                  │                    │
│                                                  ▼                    │
│                                          Node.js 后端转发               │
│                                                  │                    │
│                                                  ▼                    │
│                                          Python AI 服务 (/recognize)   │
│                                                  │                    │
│                                                  ▼                    │
│                                          返回识别结果 + 营养数据          │
│                                                  │                    │
│                                                  ▼                    │
│                                          ResultEnhanced 页面展示        │
│                                                                        │
│   ─────────────────────────────────────────────────────────────────   │
│   菜品数据获取流程：                                                   │
│                                                                        │
│   foodRecognitionService ──▶ getDishesFromAPI()                        │
│          │                        │                                    │
│          │                        ▼                                    │
│          │              调用 /dishes API (通过 Node.js 代理)            │
│          │                        │                                    │
│          │                        ▼                                    │
│          │              Python 服务返回 101 道菜品数据                   │
│          │                        │                                    │
│          ▼                        ▼                                    │
│   缓存到 FOOD_DATABASE_CACHE                                           │
└───────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (HTTPS POST)
┌───────────────────────────────────────────────────────────────────────┐
│                         后端数据流                                      │
│                                                                        │
│   Express Server ──▶ Middleware ──▶ Controller                        │
│        │               │   (认证/限流)    │                            │
│        ▼               ▼                  ▼                            │
│   Request      Request Object      Service Layer                       │
│   Response                               │                            │
│        ▲                               ▼                            │
│        │                       Business Logic                          │
│        │                               │                               │
│        │                               ▼                               │
│        │                       Repository Layer                        │
│        │                               │                               │
│        ▼                               ▼                               │
│   HTTP Response              Database (SQLite)                         │
│                                                                        │
│   ─────────────────────────────────────────────────────────────────   │
│   Python AI 服务通信：                                                 │
│                                                                        │
│   Express Server ──▶ multer 处理 ──▶ axios (form-data)                │
│        │                      │                    │                     │
│        ▼                      ▼                    ▼                     │
│   文件上传         图片缓存              Python 服务 (/recognize)       │
│                                                  │                     │
│                                                  ▼                     │
│                                          返回 JSON 识别结果              │
└───────────────────────────────────────────────────────────────────────┘
```

**Python AI 服务菜品数据库：**

```
┌───────────────────────────────────────────────────────────────────────┐
│                    Python AI 服务 - 菜品数据库架构                       │
└───────────────────────────────────────────────────────────────────────┘

                    Python Service (FastAPI)
                            │
                            ├── /recognize ───────────▶ nateraw/food 模型
                            │         │                      │
                            │         ▼                      │
                            │    匹配 Food-101 标签          │
                            │         │                      │
                            │         ▼                      │
                            │    SQLite (dishes.db)          │
                            │         │                      │
                            │    101 道菜品营养数据          │
                            │         │                      │
                            ▼         ▼                      │
                    ┌──────────────────────┐
                    │     dishes 表结构     │
                    │  - id (1-101)        │
                    │  - name (中文名)      │
                    │  - category           │
                    │  - calories_per_100g  │
                    │  - protein            │
                    │  - carbohydrates      │
                    │  - fat                │
                    │  - density            │
                    │  - standard_portion   │
                    │  - food101_class      │
                    └──────────────────────┘
                            │
                            │ /dishes API
                            ▼
                    Node.js 后端 (代理)
                            │
                            │ /dishes (Vite Proxy)
                            ▼
                    React 前端 (获取菜品列表)
```

**缓存策略：**

```typescript
// utils/cache.ts - 简单内存缓存实现
class Cache {
  private cache: Map<string, { value: any; expiry: number }> = new Map();
  
  set(key: string, value: any, ttlSeconds: number = 300) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value as T;
  }
  
  delete(key: string) {
    this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
}

export const cache = new Cache();

// 使用示例
const cachedDishes = cache.get<Dish[]>('all_dishes');
if (cachedDishes) {
  return cachedDishes;
}
const dishes = await dishRepository.findAll();
cache.set('all_dishes', dishes, 600); // 缓存10分钟
```

## 5. AI模型集成架构

**TensorFlow.js 模型集成：**

```typescript
// services/AI/dishRecognitionService.ts
import * as tf from '@tensorflow/tfjs';
import { DishRecognitionResult } from '../types/domain';

class DishRecognitionService {
  private model: tf.GraphModel | null = null;
  private readonly MODEL_URL = '/models/dish_model';
  private readonly LABELS = [
    '宫保鸡丁', '红烧肉', '糖醋里脊', '番茄炒蛋', '麻婆豆腐',
    '回锅肉', '水煮鱼', '蒸蛋', '炒青菜', '米饭',
    // ... 更多菜品类别
  ];

  async loadModel(): Promise<void> {
    if (this.model) return;
    
    await tf.ready();
    this.model = await tf.loadGraphModel(`${this.MODEL_URL}/model.json`);
    console.log('菜品识别模型加载完成');
  }

  async recognize(imageData: ImageData): Promise<DishRecognitionResult[]> {
    if (!this.model) {
      await this.loadModel();
    }

    const tensor = this.preprocessImage(imageData);
    const predictions = await this.model.predict(tensor) as tf.Tensor;
    const results = await this.processPredictions(predictions);
    
    tensor.dispose();
    predictions.dispose();

    return results;
  }

  private preprocessImage(imageData: ImageData): tf.Tensor {
    const tensor = tf.browser.fromPixels(imageData)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .expandDims();
    
    return tensor.div(255.0);
  }

  private async processPredictions(predictions: tf.Tensor): Promise<DishRecognitionResult[]> {
    const probabilities = await predictions.data();
    const results: DishRecognitionResult[] = [];

    // 取概率最高的5个结果
    const topIndices = Array.from(probabilities)
      .map((prob, index) => ({ prob, index }))
      .sort((a, b) => b.prob - a.prob)
      .slice(0, 5);

    for (const { prob, index } of topIndices) {
      if (prob > 0.05) { // 置信度阈值5%
        results.push({
          dishId: index,
          dishName: this.LABELS[index],
          confidence: prob,
          calories: await this.getCaloriesForDish(index),
          nutrients: await this.getNutrientsForDish(index),
        });
      }
    }

    return results;
  }

  async getCaloriesForDish(dishIndex: number): Promise<number> {
    // 从本地数据库获取菜品热量信息
    return 0;
  }

  async getNutrientsForDish(dishIndex: number): Promise<NutrientInfo> {
    // 从本地数据库获取营养成分
    return { protein: 0, carbs: 0, fat: 0 };
  }
}

export const dishRecognitionService = new DishRecognitionService();
```

**前端AI集成架构：**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      前端AI推理架构                                      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────────┐     ┌─────────────────────────┐
│  图片输入    │────▶│ 图片预处理模块   │────▶│ TensorFlow.js 模型推理  │
│  Camera/     │     │ - 尺寸调整      │     │ - 模型加载              │
│  File Input  │     │ - 格式转换      │     │ - 前向传播              │
│             │     │ - 归一化处理    │     │ - 结果解码              │
└─────────────┘     └─────────────────┘     └─────────────────────────┘
                                                    │
                                                    ▼
                      ┌─────────────────────────────────────────────────┐
                      │              识别结果处理                        │
                      │  ┌─────────────┐  ┌─────────────┐              │
                      │  │ 置信度排序  │  │ 结果筛选    │              │
                      │  └─────────────┘  └─────────────┘              │
                      │         │                 │                     │
                      │         ▼                 ▼                     │
                      │  ┌─────────────────────────────────┐           │
                      │  │  结果展示与用户确认流程          │           │
                      │  └─────────────────────────────────┘           │
                      └─────────────────────────────────────────────────┘
                                                    │
                                                    ▼
                      ┌─────────────────────────────────────────────────┐
                      │              热量估算                            │
                      │  ┌─────────────┐  ┌─────────────┐              │
                      │  │ 菜品热量表  │  │ 分量估算    │              │
                      │  │ 查询        │  │ 交互        │              │
                      │  └─────────────┘  └─────────────┘              │
                      └─────────────────────────────────────────────────┘
```

**后端AI任务队列（可选扩展）：**

```typescript
// services/AI/asyncRecognitionService.ts
import Bull, { Queue } from 'bull';
import { recognitionService } from './dishRecognitionService';

interface RecognitionJob {
  imageUrl: string;
  userId: number;
  recordId: number;
}

class AsyncRecognitionService {
  private recognitionQueue: Queue<RecognitionJob>;

  constructor() {
    this.recognitionQueue = new Bull('recognition', {
      redis: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    
    this.recognitionQueue.process(async (job) => {
      return this.processRecognition(job.data);
    });
  }

  async enqueueRecognition(imageUrl: string, userId: number, recordId: number): Promise<void> {
    await this.recognitionQueue.add({
      imageUrl,
      userId,
      recordId,
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  private async processRecognition(data: RecognitionJob): Promise<void> {
    // 处理识别任务
    const result = await recognitionService.recognizeFromUrl(data.imageUrl);
    // 更新数据库
    // 发送WebSocket通知
  }
}
```

## 6. 项目开发路线图

基于上述架构设计，建议按以下顺序进行开发：

**第一阶段：基础架构搭建（1-2周）**
- 初始化前后端项目，配置开发环境
- 实现用户认证模块（注册、登录、JWT认证）
- 设计并创建SQLite数据库表结构
- 实现基础的API路由和中间件

**第二阶段：核心功能开发（2-3周）**
- 实现图片上传和处理功能
- 集成TensorFlow.js菜品识别模型
- 开发热量计算和营养成分展示功能
- 实现饮食记录管理功能

**第三阶段：数据统计和智能建议（1-2周）**
- 开发数据统计和可视化功能
- 实现个性化营养建议算法
- 添加历史数据分析功能

**第四阶段：优化和测试（1周）**
- 性能优化（缓存、懒加载）
- 错误处理和边界情况处理
- 整体测试和Bug修复
