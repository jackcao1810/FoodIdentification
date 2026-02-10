# 导入必要的库
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch

# 1. 加载预训练的图片处理器和分类模型
# AutoImageProcessor：负责图片的预处理（缩放、归一化、张量转换等）
# AutoModelForImageClassification：图片分类模型本体
processor = AutoImageProcessor.from_pretrained("nateraw/food")
model = AutoModelForImageClassification.from_pretrained("nateraw/food")

# 2. 加载待识别的图片（替换为你的图片路径）
# 支持 jpg/png/jpeg 等常见格式，建议使用RGB格式
image_path = r"C:\Users\caoji\Desktop\photo-1513104890138-7c749659a591.jpg"  # 替换成实际的图片路径
try:
    image = Image.open(image_path).convert("RGB")  # 转为RGB避免通道数问题
except FileNotFoundError:
    print(f"错误：找不到图片文件 {image_path}")
    exit(1)

# 3. 图片预处理：转换为模型可接受的格式
# return_tensors="pt" 表示返回PyTorch张量（模型默认使用PyTorch）
inputs = processor(images=image, return_tensors="pt")

# 4. 模型推理（关闭梯度计算以提升效率）
# torch.no_grad()：推理阶段不需要训练，关闭梯度可节省内存、加快速度
with torch.no_grad():
    outputs = model(**inputs)  # 传入预处理后的图片数据

# 5. 解析推理结果
# outputs.logits：模型原始输出（未归一化的得分），形状为 [1, 类别数]
logits = outputs.logits
# 找到得分最高的类别索引
predicted_idx = logits.argmax(-1).item()
# 根据索引映射到具体的食物类别名称（模型配置中内置了映射关系）
predicted_label = model.config.id2label[predicted_idx]

# 基础结果输出
print("=== 核心识别结果 ===")
print(f"识别出的食物：{predicted_label}")
print(f"类别索引：{predicted_idx}")

# （可选）计算预测概率（将原始得分转为0-1的概率分布）
probabilities = torch.nn.functional.softmax(logits, dim=-1)
predicted_prob = probabilities[0, predicted_idx].item()
print(f"预测概率：{predicted_prob:.4f}（即 {predicted_prob*100:.2f}%）")

# （可选）获取概率最高的前3个候选类别
top3_probs, top3_idxs = torch.topk(probabilities, 3)
print("\n=== 概率最高的前3个候选 ===")
for i, (prob, idx) in enumerate(zip(top3_probs[0], top3_idxs[0])):
    label = model.config.id2label[idx.item()]
    print(f"{i+1}. {label}：{prob.item():.4f}")