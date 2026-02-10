# Node.js 版本
FROM node:20-alpine

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p /app/uploads

EXPOSE 3000

CMD ["node", "dist/server.js"]
