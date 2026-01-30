import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ImageUploader } from '../components/upload';
import { SparklesIcon, CameraIcon } from '@heroicons/react/24/outline';
import { recognitionService } from '../services/recognitionService';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);

  const handleImageSelect = useCallback((file: File, previewUrl: string) => {
    setSelectedFile(file);
    setSelectedImage(previewUrl);
    setRecordId(null);
  }, []);

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setSelectedImage(null);
    setRecordId(null);
  }, []);

  const handleRecognize = async () => {
    if (!selectedFile || !selectedImage) {
      message.warning('请先选择一张图片');
      return;
    }

    setIsProcessing(true);

    try {
      const uploadResult = await recognitionService.upload(selectedFile);
      setRecordId(uploadResult.recordId);

      message.success('图片上传成功，开始识别...');

      navigate(`/result/${uploadResult.recordId}`, {
        state: {
          imageUrl: uploadResult.imageUrl,
          previewUrl: selectedImage,
        },
      });
    } catch (error: any) {
      console.error('识别失败:', error);
      message.error(error.response?.data?.error?.message || '识别失败，请重试');
    } finally {
      setIsProcessing(false);
    }
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

      <Card className="min-h-[400px] flex flex-col">
        {!selectedImage ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <ImageUploader
              onImageSelect={handleImageSelect}
              maxSize={10}
              acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="relative flex-1 min-h-[300px] bg-surface-50 rounded-xl overflow-hidden">
              <img
                src={selectedImage}
                alt="Selected dish"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <Button variant="secondary" onClick={handleRemove}>
                重新选择
              </Button>
              <Button
                variant="primary"
                onClick={handleRecognize}
                loading={isProcessing}
                icon={<SparklesIcon className="w-5 h-5" />}
              >
                {isProcessing ? '上传并识别中...' : '开始识别'}
              </Button>
            </div>
          </div>
        )}
      </Card>

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
