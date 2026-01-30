import React, { useState, useCallback, useRef } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

export interface DragDropZoneProps {
  onFilesDrop: (files: File[]) => void;
  onFileSelect: (file: File) => void;
  accept?: string[];
  maxSize?: number;
  disabled?: boolean;
}

const DragDropZone: React.FC<DragDropZoneProps> = ({
  onFilesDrop,
  onFileSelect,
  accept = ['image/jpeg', 'image/png', 'image/webp'],
  maxSize = 10,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errors: string[] = [];

      for (const file of files) {
        if (!accept.includes(file.type)) {
          errors.push(`${file.name}: 不支持的文件格式`);
          continue;
        }

        if (file.size > maxSize * 1024 * 1024) {
          errors.push(`${file.name}: 文件大小超过 ${maxSize}MB 限制`);
          continue;
        }

        valid.push(file);
      }

      return { valid, errors };
    },
    [accept, maxSize]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setError(null);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      const { valid, errors } = validateFiles(files);
      if (errors.length > 0) {
        setError(errors.join('; '));
      }

      if (valid.length > 0) {
        onFilesDrop(valid);
      }
    },
    [disabled, validateFiles, onFilesDrop]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      if (disabled) return;

      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const { valid, errors } = validateFiles(files);
      if (errors.length > 0) {
        setError(errors.join('; '));
      }

      if (valid.length > 0) {
        onFileSelect(valid[0]);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [disabled, validateFiles, onFileSelect]
  );

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
          multiple
        />

        <div className="flex flex-col items-center justify-center text-center">
          <CloudArrowUpIcon
            className={`w-12 h-12 mb-4 ${
              isDragging ? 'text-blue-500' : 'text-gray-400'
            }`}
          />

          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragging ? '释放以上传图片' : '拖拽图片到此处，或点击选择'}
          </p>

          <p className="text-sm text-gray-500">
            支持 JPG、PNG、WebP 格式，单个文件不超过 {maxSize}MB
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default DragDropZone;
