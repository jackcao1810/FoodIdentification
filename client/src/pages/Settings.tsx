import React from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  UserCircleIcon,
  BellIcon,
  LockClosedIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const Settings: React.FC = () => {
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

      {/* Profile Settings */}
      <Card>
        <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <UserCircleIcon className="w-5 h-5 text-primary-500" />
          账户设置
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl cursor-pointer hover:bg-surface-100 transition-colors">
            <div>
              <p className="font-medium text-surface-900">修改个人信息</p>
              <p className="text-sm text-surface-500">更新您的昵称、头像等</p>
            </div>
            <span className="text-surface-400">›</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl cursor-pointer hover:bg-surface-100 transition-colors">
            <div>
              <p className="font-medium text-surface-900">修改密码</p>
              <p className="text-sm text-surface-500">保护您的账户安全</p>
            </div>
            <span className="text-surface-400">›</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl cursor-pointer hover:bg-surface-100 transition-colors">
            <div>
              <p className="font-medium text-surface-900">绑定手机</p>
              <p className="text-sm text-surface-500">用于登录验证和找回密码</p>
            </div>
            <span className="text-primary-600 text-sm font-medium">去绑定</span>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <BellIcon className="w-5 h-5 text-primary-500" />
          通知设置
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-surface-900">饮食提醒</p>
              <p className="text-sm text-surface-500">定时提醒您记录饮食</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-surface-900">热量摄入提醒</p>
              <p className="text-sm text-surface-500">超过每日目标时提醒</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-surface-900">健康建议推送</p>
              <p className="text-sm text-surface-500">获取个性化营养建议</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <PaintBrushIcon className="w-5 h-5 text-primary-500" />
          外观设置
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-surface-900">深色模式</p>
              <p className="text-sm text-surface-500">切换深色/浅色主题</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Data Management */}
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

      {/* Logout */}
      <Button variant="secondary" className="w-full">
        退出登录
      </Button>

      {/* Version Info */}
      <p className="text-center text-sm text-surface-400">
        食堂菜品识别系统 v1.0.0
      </p>
    </div>
  );
};

export default Settings;
