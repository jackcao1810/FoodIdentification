# Node.js 版本
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

# 安装依赖
COPY server/package*.json ./
RUN npm ci --only=production

# 复制应用代码
COPY server/ .

# 创建上传目录
RUN mkdir -p /app/uploads

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["node", "dist/server.js"]
