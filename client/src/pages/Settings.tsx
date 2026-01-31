import React from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  UserCircleIcon,
  LockClosedIcon,
  GlobeAltIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.success('已退出登录');
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-surface-900 mb-1">
          设置
        </h1>
        <p className="text-surface-500">
          自定义您的应用体验
        </p>
      </div>

      {isLoggedIn && (
        <Card>
          <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <UserCircleIcon className="w-5 h-5 text-primary-500" />
            账户设置
          </h3>
          <div className="space-y-4">
            <div 
              className="flex items-center justify-between p-4 bg-surface-50 rounded-xl cursor-pointer hover:bg-surface-100 transition-colors"
              onClick={() => navigate('/profile')}
            >
              <div>
                <p className="font-medium text-surface-900">修改个人信息</p>
                <p className="text-sm text-surface-500">更新您的昵称、头像等</p>
              </div>
              <span className="text-surface-400">›</span>
            </div>
            <div 
              className="flex items-center justify-between p-4 bg-surface-50 rounded-xl cursor-pointer hover:bg-surface-100 transition-colors"
              onClick={() => navigate('/settings/password')}
            >
              <div>
                <p className="font-medium text-surface-900">修改密码</p>
                <p className="text-sm text-surface-500">保护您的账户安全</p>
              </div>
              <span className="text-surface-400">›</span>
            </div>
          </div>
        </Card>
      )}

      {isLoggedIn && (
        <Card>
          <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <GlobeAltIcon className="w-5 h-5 text-primary-500" />
            数据管理
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl cursor-pointer hover:bg-surface-100 transition-colors">
              <div>
                <p className="font-medium text-surface-900">导出数据</p>
                <p className="text-sm text-surface-500">导出您的饮食记录数据</p>
              </div>
              <span className="text-surface-400">›</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-colors">
              <div>
                <p className="font-medium text-red-600">删除账户</p>
                <p className="text-sm text-red-500">永久删除您的账户和所有数据</p>
              </div>
              <TrashIcon className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </Card>
      )}

      {isLoggedIn ? (
        <Button variant="secondary" className="w-full" onClick={handleLogout}>
          <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
          退出登录
        </Button>
      ) : (
        <Card className="bg-primary-50 border-primary-200">
          <div className="text-center py-4">
            <p className="text-surface-600 mb-4">登录后解锁更多设置</p>
            <Button onClick={() => navigate('/auth/login')}>
              立即登录
            </Button>
          </div>
        </Card>
      )}

      {/* Version Info */}
      <p className="text-center text-sm text-surface-400">
        食堂菜品识别系统 v1.0.0
      </p>
    </div>
  );
};

export default Settings;
