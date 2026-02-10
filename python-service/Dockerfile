# Python 版本
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 先安装 PyTorch CPU 版本（必须使用官方 CPU 版本）
RUN pip3 install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# 复制依赖文件
COPY python-service/requirements.txt .

# 安装其他 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY python-service/ .

# 创建模型缓存目录
RUN mkdir -p /app/models

# 创建数据目录
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["python", "app.py"]
