# Docker 部署指南

**文档版本：** 1.0  
**更新日期：** 2026-02-10

## 概述

本项目支持通过 Docker 容器化部署，包含三个服务：
- **Python AI 服务**：菜品识别（FastAPI + PyTorch）
- **Node.js 后端服务**：API 服务（Express + SQLite）
- **Nginx 前端服务**：静态资源服务（React 构建产物）

## 前置要求

- Docker Engine 20.10+
- Docker Compose V2+
- 至少 4GB 可用内存
- 至少 10GB 磁盘空间

## 快速开始

### 1. 克隆并进入项目目录

```bash
git clone <your-repo-url>
cd FoodIdentification
```

### 2. 配置环境变量（可选）

```bash
# 创建环境变量文件
cp .env.example .env

# 编辑环境变量
vim .env
```

### 3. 构建并启动服务

```bash
# 构建所有服务（首次会下载基础镜像）
docker compose build

# 启动所有服务
docker compose up -d

# 查看日志
docker compose logs -f
```

### 4. 验证服务

```bash
# 检查前端（返回 HTML）
curl http://localhost

# 检查 Python 服务健康
curl http://localhost/health

# 检查 Node.js 服务健康
curl http://localhost/api/health
```

## 服务架构

```
                         ┌─────────────────────────────────────────┐
                         │              用户浏览器                   │
                         └─────────────────┬───────────────────────┘
                                           │
                                           ▼
                         ┌─────────────────────────────────────────┐
                         │            Nginx (端口 80)               │
                         │  - 静态资源服务                          │
                         │  - API 代理 (/api/* → server:3001)      │
                         │  - 菜品数据代理 (/dishes/* → python:8000) │
                         └─────────────────┬───────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    ▼                      ▼                      ▼
    ┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
    │  Python (端口 8000)    │  │   Server (端口 3001)   │  │   Nginx 缓存          │
    │  - FastAPI 服务        │  │   - Express 服务       │  │                       │
    │  - PyTorch 模型推理    │  │   - SQLite 数据库      │  │                       │
    │  - 菜品数据库          │  │   - 上传文件存储       │  │                       │
    └───────────────────────┘  └───────────────────────┘  └───────────────────────┘
```

## 服务配置

### 环境变量

| 服务 | 变量 | 说明 | 默认值 |
|------|------|------|--------|
| Server | `JWT_SECRET` | JWT 密钥 | `your-secret-key-change-in-production` |
| Server | `JWT_EXPIRES_IN` | JWT 过期时间 | `7d` |
| Python | `PYTHON_SERVICE_URL` | Python 服务地址 | `http://localhost:8000` |

### 端口映射

| 服务 | 容器端口 | 主机端口 |
|------|----------|----------|
| Nginx | 80 | 80 |
| Python | 8000 | 8000 |
| Server | 3001 | 3001 |

## 常用命令

### 启动服务

```bash
# 前台启动（查看日志）
docker compose up

# 后台启动
docker compose up -d

# 带日志启动
docker compose up -d && docker compose logs -f
```

### 停止服务

```bash
# 停止所有服务
docker compose down

# 停止并删除数据卷
docker compose down -v
```

### 重启服务

```bash
# 重启单个服务
docker compose restart python
docker compose restart server
docker compose restart nginx

# 重启所有服务
docker compose restart
```

### 查看日志

```bash
# 查看所有日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f python
docker compose logs -f server
docker compose logs -f nginx

# 查看最近 100 行日志
docker compose logs --tail 100 -f
```

### 进入容器

```bash
# 进入 Python 容器
docker exec -it food-id-python /bin/bash

# 进入 Server 容器
docker exec -it food-id-server /bin/sh

# 进入 Nginx 容器
docker exec -it food-id-nginx /bin/sh
```

## 数据持久化

| 数据类型 | 存储位置 | 说明 |
|----------|----------|------|
| Python 模型 | `python-models` volume | 首次启动会从 Hugging Face 下载 |
| Python 数据 | `python-data` volume | SQLite 数据库文件 |
| 上传文件 | `server-uploads` volume | 用户上传的图片文件 |
| Nginx 缓存 | `nginx-cache` volume | HTTP 缓存 |

## 首次启动流程

### 1. 首次启动

```bash
docker compose up -d
```

**执行步骤：**
1. 拉取基础镜像（Python 3.11, Node.js 20, Nginx Alpine）
2. 构建 Python 服务镜像
3. 首次启动自动从 Hugging Face 下载 `nateraw/food` 模型
4. 构建 Node.js 服务镜像
5. 构建 Nginx 服务镜像
6. 启动所有服务

### 2. 验证模型下载

```bash
# 检查 Python 服务日志
docker compose logs python

# 首次启动会看到类似输出：
# 正在下载模型: nateraw/food
# 保存路径: models/food_nateraw_food
# 模型保存完成
# 正在从本地加载...
# 模型加载完成
```

### 3. 测试识别接口

```bash
# 上传图片测试识别
curl -X POST http://localhost/api/recognition/recognize \
  -F "file=@/path/to/food.jpg" \
  -H "Authorization: Bearer <your-token>"
```

## 生产环境部署

### 1. 修改默认密钥

```bash
# 编辑 .env 文件
vim .env

# 设置强密码（至少 32 位）
JWT_SECRET=your-very-long-and-secure-secret-key-here
```

### 2. 配置 HTTPS（推荐）

使用 Let's Encrypt 或其他证书：

```nginx
# nginx.conf
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    # ... 其他配置
}
```

### 3. 使用负载均衡

```yaml
# docker-compose.prod.yml
services:
  server:
    deploy:
      replicas: 3
```

### 4. 资源限制

```yaml
services:
  python:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## 故障排查

### 问题 1：Python 服务启动失败

**症状：** `docker compose logs python` 显示模型下载失败

**解决方案：**
```bash
# 检查网络连接
docker exec -it food-id-python ping huggingface.co

# 手动下载模型
docker exec -it food-id-python python -c "
from food_recognition import FoodRecognition
fr = FoodRecognition()
fr.load_model()
"
```

### 问题 2：识别结果为空

**症状：** 识别 API 返回成功但没有菜品

**解决方案：**
```bash
# 检查菜品数据库
docker exec -it food-id-python python -c "
from database import get_all_dishes
dishes = get_all_dishes()
print(f'菜品数量: {len(dishes)}')
"
```

### 问题 3：上传文件失败

**症状：** 上传 API 返回 500 错误

**解决方案：**
```bash
# 检查上传目录权限
docker exec -it food-id-server ls -la /app/uploads

# 重新创建目录
docker exec -it food-id-server mkdir -p /app/uploads
docker exec -it food-id-server chmod 777 /app/uploads
```

### 问题 4：CORS 错误

**症状：** 浏览器控制台显示 CORS 错误

**解决方案：** 检查 Nginx 配置中的 `proxy_set_header` 是否正确传递。

## 监控

### 健康检查

```bash
# 检查所有服务状态
docker compose ps

# 检查健康状态
curl http://localhost/health
curl http://localhost/api/health
```

### 资源使用

```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
df -h
docker system df
```

## 备份与恢复

### 备份数据

```bash
# 备份上传文件
docker cp food-id-server:/app/uploads ./back/uploads

# 备份 Python 数据库
docker cp food-id-python:/app/data/dishes.db ./back/dishes.db
```

### 恢复数据

```bash
# 恢复上传文件
docker cp ./back/uploads food-id-server:/app/uploads

# 恢复 Python 数据库
docker cp ./back/dishes.db food-id-python:/app/data/dishes.db
```

## 更新部署

### 1. 更新代码

```bash
git pull origin main
```

### 2. 重新构建

```bash
# 重新构建并启动
docker compose down
docker compose build --no-cache
docker compose up -d
```

### 3. 清理旧镜像

```bash
# 删除未使用的镜像
docker image prune -a
```

## 卸载

```bash
# 停止并删除所有服务
docker compose down -v

# 删除所有镜像
docker rmi $(docker images -q)

# 删除所有数据卷
docker volume prune -f
```
