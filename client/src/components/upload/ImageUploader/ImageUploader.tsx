import React, { useState, useCallback, useRef } from 'react';
import { ArrowUpTrayIcon, CameraIcon, XMarkIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { message } from 'antd';
import DragDropZone from '../DragDropZone';
import CameraCapture from '../CameraCapture';
import ImagePreview from '../ImagePreview';

export interface ImageUploaderProps {
  onImageSelect: (file: File, previewUrl: string) => void;
  maxSize?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  maxSize = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  disabled = false,
  className = '',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (disabled) return;

      const isValidType = acceptedTypes.includes(file.type);
      if (!isValidType) {
        message.error('仅支持 JPG、PNG、WebP 格式的图片');
        return;
      }

      const isValidSize = file.size <= maxSize * 1024 * 1024;
      if (!isValidSize) {
        message.error(`图片大小不能超过 ${maxSize}MB`);
        return;
      }

      setIsProcessing(true);
      try {
        const previewUrl = await readFileAsDataURL(file);
        setSelectedFile(file);
        setPreviewUrl(previewUrl);
        onImageSelect(file, previewUrl);
        message.success('图片上传成功');
      } catch {
        message.error('图片处理失败，请重试');
      } finally {
        setIsProcessing(false);
      }
    },
    [disabled, acceptedTypes, maxSize, onImageSelect]
  );

  const handleFilesDrop = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleCameraCapture = useCallback(
    (file: File, previewUrl: string) => {
      setSelectedFile(file);
      setPreviewUrl(previewUrl);
      setShowCamera(false);
      onImageSelect(file, previewUrl);
      message.success('拍照成功');
    },
    [onImageSelect]
  );

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClickSelect = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  if (showCamera) {
    return (
      <div className="relative">
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      </div>
    );
  }

  if (selectedFile && previewUrl) {
    return (
      <div className={`relative ${className}`}>
        <ImagePreview
          src={previewUrl}
          alt="上传预览"
          onRemove={handleRemove}
          removable
          rotatable
          zoomable
        />
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <ArrowPathIcon className="w-8 h-8 animate-spin text-white" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <DragDropZone
        onFilesDrop={handleFilesDrop}
        onFileSelect={handleFileSelect}
        accept={acceptedTypes}
        maxSize={maxSize}
        disabled={disabled}
      />

      <div className="flex items-center justify-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileSelect(file);
            }
          }}
          className="hidden"
          disabled={disabled}
        />

        <button
          type="button"
          onClick={handleClickSelect}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PhotoIcon className="w-5 h-5" />
          从相册选择
        </button>

        <button
          type="button"
          onClick={() => setShowCamera(true)}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <CameraIcon className="w-5 h-5" />
          拍照上传
        </button>
      </div>

      <p className="text-sm text-gray-500 text-center">
        支持 JPG、PNG、WebP 格式，大小不超过 {maxSize}MB
      </p>
    </div>
  );
};

export default ImageUploader;
