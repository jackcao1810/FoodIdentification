# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 设置环境变量
NODE_ENV=production

# 安装依赖
COPY client/package*.json ./
RUN npm ci

# 复制应用代码
COPY client/ .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
