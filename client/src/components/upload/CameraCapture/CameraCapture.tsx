import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CameraIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export interface CameraCaptureProps {
  onCapture: (file: File, previewUrl: string) => void;
  onClose: () => void;
  facingMode?: 'user' | 'environment';
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onClose,
  facingMode = 'environment',
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFacingMode, setCurrentFacingMode] = useState<'user' | 'environment'>(facingMode);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: currentFacingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('摄像头访问失败:', err);
      setError('无法访问摄像头，请确保已授予摄像头权限');
    } finally {
      setIsLoading(false);
    }
  }, [currentFacingMode]);

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleSwitchCamera = async () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    setCurrentFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (currentFacingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('拍照失败，请重试');
          return;
        }

        const file = new File([blob], `photo_${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });

        const previewUrl = URL.createObjectURL(blob);
        onCapture(file, previewUrl);
      },
      'image/jpeg',
      0.9
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-white text-center">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>正在启动摄像头...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
            <div className="text-center text-white">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                重试
              </button>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`max-w-full max-h-full object-contain ${
            currentFacingMode === 'user' ? 'scale-x-[-1]' : ''
          }`}
        />
      </div>

      <div className="bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handleSwitchCamera}
            className="p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            title="切换摄像头"
          >
            <ArrowPathIcon className="w-6 h-6" />
          </button>

          <button
            onClick={handleCapture}
            disabled={isLoading || !!error}
            className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CameraIcon className="w-8 h-8 text-gray-700 mx-auto" />
          </button>

          <div className="w-12" />
        </div>

        <p className="text-white text-center mt-4 text-sm opacity-80">
          点击拍照按钮拍摄菜品照片
        </p>
      </div>
    </div>
  );
};

export default CameraCapture;
