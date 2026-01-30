import React from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  UserCircleIcon,
  EnvelopeIcon,
  CameraIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const user = {
    username: '用户昵称',
    email: 'user@example.com',
    avatar: '',
    height: 170,
    weight: 65,
    targetCalories: 2000,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-surface-900 mb-1">
          个人中心
        </h1>
        <p className="text-surface-500">
          管理您的账户信息和个人资料
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-surface-50 transition-colors">
              <CameraIcon className="w-4 h-4 text-surface-600" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-surface-900">{user.username}</h2>
            <p className="text-surface-500">{user.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="badge">{user.targetCalories} kcal/天</span>
            </div>
          </div>
          <Button variant="ghost" icon={<PencilIcon className="w-5 h-5" />}>
            编辑
          </Button>
        </div>
      </Card>

      {/* Body Stats */}
      <Card>
        <h3 className="font-semibold text-surface-900 mb-4">身体数据</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-surface-50 rounded-xl">
            <p className="text-2xl font-bold text-surface-900">{user.height}</p>
            <p className="text-sm text-surface-500">身高 (cm)</p>
          </div>
          <div className="text-center p-4 bg-surface-50 rounded-xl">
            <p className="text-2xl font-bold text-surface-900">{user.weight}</p>
            <p className="text-sm text-surface-500">体重 (kg)</p>
          </div>
          <div className="text-center p-4 bg-surface-50 rounded-xl">
            <p className="text-2xl font-bold text-surface-900">22.5</p>
            <p className="text-sm text-surface-500">BMI</p>
          </div>
        </div>
      </Card>

      {/* Goals */}
      <Card>
        <h3 className="font-semibold text-surface-900 mb-4">饮食目标</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-surface-600">每日热量</span>
              <span className="font-medium text-surface-900">{user.targetCalories} kcal</span>
            </div>
            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
              <div className="h-full w-full bg-primary-500 rounded-full"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-surface-600">蛋白质</span>
              <span className="font-medium text-surface-900">80g</span>
            </div>
            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-primary-500 rounded-full"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-surface-600">碳水化合物</span>
              <span className="font-medium text-surface-900">300g</span>
            </div>
            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-accent-500 rounded-full"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-surface-600">脂肪</span>
              <span className="font-medium text-surface-900">65g</span>
            </div>
            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card>
        <h3 className="font-semibold text-surface-900 mb-4">成就徽章</h3>
        <div className="flex flex-wrap gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center text-2xl" title="连续打卡7天">
            🔥
          </div>
          <div className="w-16 h-16 rounded-xl bg-accent-100 flex items-center justify-center text-2xl" title="识别10道菜品">
            📸
          </div>
          <div className="w-16 h-16 rounded-xl bg-yellow-100 flex items-center justify-center text-2xl" title="热量达标5天">
            ✅
          </div>
          <div className="w-16 h-16 rounded-xl bg-surface-100 flex items-center justify-center text-2xl opacity-50">
            ?
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
