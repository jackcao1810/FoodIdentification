import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  CameraIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'camera' | 'upload'>('upload');

  const handleImageSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleImageSelect(file);
      }
    },
    [handleImageSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageSelect(file);
      }
    },
    [handleImageSelect]
  );

  const handleCameraCapture = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageSelect(file);
      }
    };
    input.click();
  }, [handleImageSelect]);

  const handleRecognize = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    
    // Simulate recognition process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Navigate to result page (in real app, pass the image and result)
    navigate('/result/demo');
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-display font-bold text-surface-900 mb-2">
          上传菜品图片
        </h1>
        <p className="text-surface-500">
          拍摄或选择菜品照片，AI将自动识别并计算热量
        </p>
      </div>

      {/* Upload Method Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex bg-surface-100 rounded-xl p-1">
          <button
            onClick={() => setUploadMethod('upload')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              uploadMethod === 'upload'
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            <PhotoIcon className="w-5 h-5 inline mr-2" />
            从相册选择
          </button>
          <button
            onClick={() => {
              setUploadMethod('camera');
              handleCameraCapture();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              uploadMethod === 'camera'
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            <CameraIcon className="w-5 h-5 inline mr-2" />
            拍照识别
          </button>
        </div>
      </div>

      {/* Drop Zone / Preview */}
      <Card className="min-h-[400px] flex flex-col">
        {!selectedImage ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-surface-200 hover:border-primary-300'
            }`}
          >
            <div className="text-center p-8">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isDragging ? 'bg-primary-100' : 'bg-surface-100'
              }`}>
                <ArrowUpTrayIcon className={`w-10 h-10 ${isDragging ? 'text-primary-600' : 'text-surface-400'}`} />
              </div>
              <h3 className="text-lg font-semibold text-surface-900 mb-2">
                拖拽图片到此处
              </h3>
              <p className="text-surface-500 mb-6">
                或点击下方按钮选择图片
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="image-input"
              />
              <label htmlFor="image-input">
                <Button variant="primary" as="span" className="cursor-pointer">
                  <PhotoIcon className="w-5 h-5 mr-2" />
                  选择图片
                </Button>
              </label>
              <p className="text-xs text-surface-400 mt-4">
                支持 JPG, PNG, WEBP 格式，最大 10MB
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="relative flex-1 min-h-[300px] bg-surface-50 rounded-xl overflow-hidden">
              <img
                src={selectedImage}
                alt="Selected dish"
                className="w-full h-full object-contain"
              />
              <button
                onClick={clearImage}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-surface-600" />
              </button>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <Button variant="secondary" onClick={clearImage}>
                重新选择
              </Button>
              <Button
                variant="primary"
                onClick={handleRecognize}
                loading={isProcessing}
                icon={<SparklesIcon className="w-5 h-5" />}
              >
                {isProcessing ? '识别中...' : '开始识别'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Tips */}
      <Card className="bg-primary-50 border-0">
        <h3 className="font-semibold text-primary-900 mb-3">识别技巧</h3>
        <ul className="space-y-2 text-sm text-primary-700">
          <li className="flex items-start gap-2">
            <span className="text-primary-500">•</span>
            确保光线充足，菜品清晰可见
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500">•</span>
            拍摄角度垂直于菜品，效果更佳
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500">•</span>
            避免背景过于复杂
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500">•</span>
            单张照片只包含一道菜品
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default Upload;
