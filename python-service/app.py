from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import io
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from food_recognition import get_recognizer
from database import init_database

app = FastAPI(
    title="Food Recognition API",
    description="菜品识别服务 - 基于 Food-101 模型的菜品识别",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recognizer = None


def get_recognizer_service():
    global recognizer
    if recognizer is None:
        recognizer = get_recognizer()
    return recognizer


@app.on_event("startup")
async def startup_event():
    """服务启动时初始化数据库和加载模型"""
    try:
        print("正在初始化菜品数据库...")
        init_database()
        get_recognizer_service()
        print("Food Recognition 服务已就绪")
    except Exception as e:
        print(f"初始化失败: {e}")


@app.get("/")
async def root():
    """健康检查"""
    return {"status": "ok", "service": "food-recognition", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "model_loaded": recognizer is not None}


@app.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    """
    识别上传的图片中的菜品

    - **file**: 图片文件 (JPEG, PNG)
    """
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="只支持图片文件")

        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        recognizer = get_recognizer_service()
        result = recognizer.recognize_from_image(image)

        return JSONResponse(content={
            "success": True,
            "data": result
        })

    except HTTPException:
        raise
    except Exception as e:
        print(f"识别错误: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "message": f"识别失败: {str(e)}"
                }
            }
        )


@app.post("/recognize/batch")
async def recognize_batch(files: list[UploadFile] = File(...)):
    """
    批量识别图片中的菜品

    - **files**: 图片文件列表 (最多 10 张)
    """
    results = []

    for file in files[:10]:
        try:
            if not file.content_type.startswith("image/"):
                results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": "只支持图片文件"
                })
                continue

            contents = await file.read()
            image = Image.open(io.BytesIO(contents)).convert("RGB")

            recognizer = get_recognizer_service()
            result = recognizer.recognize_from_image(image)

            results.append({
                "filename": file.filename,
                "success": True,
                "data": result
            })

        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e)
            })

    return JSONResponse(content={
        "success": True,
        "data": {"results": results}
    })


@app.get("/model/info")
async def model_info():
    """获取模型信息"""
    recognizer = get_recognizer_service()

    if not recognizer._model_loaded:
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "error": {"message": "模型尚未加载"}
            }
        )

    return JSONResponse(content={
        "success": True,
        "data": {
            "model_name": "nateraw/food",
            "num_classes": len(recognizer.model.config.id2label),
            "labels": list(recognizer.model.config.id2label.values())[:20],
            "supported_dishes": len(recognizer._get_dishes_cache())
        }
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
