import React from 'react';

const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary-100"></div>
          <div className="w-16 h-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-surface-500 text-sm font-medium">加载中...</p>
      </div>
    </div>
  );
};

export default PageLoader;
