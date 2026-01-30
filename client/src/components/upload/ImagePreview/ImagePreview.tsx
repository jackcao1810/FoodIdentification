import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  TrashIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowPathIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';

export interface ImagePreviewProps {
  src: string;
  alt?: string;
  onRemove: () => void;
  onRotate?: (direction: 'left' | 'right') => void;
  onZoom?: (scale: number) => void;
  removable?: boolean;
  rotatable?: boolean;
  zoomable?: boolean;
  className?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = '预览图片',
  onRemove,
  onRotate,
  onZoom,
  removable = true,
  rotatable = true,
  zoomable = true,
  className = '',
}) => {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRotateLeft = useCallback(() => {
    const newRotation = rotation - 90;
    setRotation(newRotation);
    onRotate?.('left');
  }, [rotation, onRotate]);

  const handleRotateRight = useCallback(() => {
    const newRotation = rotation + 90;
    setRotation(newRotation);
    onRotate?.('right');
  }, [rotation, onRotate]);

  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(scale + 0.25, 3);
    setScale(newScale);
    onZoom?.(newScale);
  }, [scale, onZoom]);

  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(scale - 0.25, 0.5);
    setScale(newScale);
    onZoom?.(newScale);
  }, [scale, onZoom]);

  const handleReset = useCallback(() => {
    setRotation(0);
    setScale(1);
    onZoom?.(1);
  }, [onZoom]);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen();
      }
      if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      }
      if (e.key === '-') {
        handleZoomOut();
      }
      if (e.key === 'r') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleZoomIn, handleZoomOut, handleReset, isFullscreen]);

  return (
    <div
      ref={containerRef}
      className={`relative bg-gray-100 rounded-xl overflow-hidden ${className}`}
    >
      <div
        className="relative flex items-center justify-center min-h-[300px] p-4"
        style={{
          overflow: 'hidden',
        }}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[500px] object-contain transition-transform duration-200"
          style={{
            transform: `rotate(${rotation}deg) scale(${scale})`,
          }}
        />
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {removable && (
          <button
            onClick={onRemove}
            className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600/80 transition-colors"
            title="删除图片"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}

        {zoomable && (
          <button
            onClick={handleFullscreen}
            className="p-2 bg-gray-500/80 text-white rounded-lg hover:bg-gray-600/80 transition-colors"
            title="全屏查看"
          >
            <ArrowsPointingOutIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {(rotatable || zoomable) && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-lg p-2">
          {rotatable && (
            <>
              <button
                onClick={handleRotateLeft}
                className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                title="向左旋转 (R)"
              >
                <ArrowPathIcon className="w-5 h-5 rotate-180" />
              </button>
              <button
                onClick={handleRotateRight}
                className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                title="向右旋转"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            </>
          )}

          {zoomable && (
            <>
              <div className="w-px h-6 bg-white/30" />
              <button
                onClick={handleZoomOut}
                className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                title="缩小 (-)"
              >
                <MagnifyingGlassMinusIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                title="重置 (R)"
              >
                <span className="text-sm font-medium">100%</span>
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                title="放大 (+)"
              >
                <MagnifyingGlassPlusIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      )}

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `rotate(${rotation}deg) scale(${scale})`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
