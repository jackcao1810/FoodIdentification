import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setUser } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import {
  UserCircleIcon,
  EnvelopeIcon,
  CameraIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

interface FormData {
  username: string;
  heightCm: number;
  weightKg: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbohydrates: number;
  targetFat: number;
}

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    heightCm: 170,
    weightKg: 65,
    targetCalories: 2000,
    targetProtein: 80,
    targetCarbohydrates: 300,
    targetFat: 65,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        heightCm: user.heightCm || 170,
        weightKg: user.weightKg || 65,
        targetCalories: user.targetCalories || 2000,
        targetProtein: user.targetProtein || 80,
        targetCarbohydrates: user.targetCarbohydrates || 300,
        targetFat: user.targetFat || 65,
      });
    }
  }, [user]);

  const handleEditClick = () => {
    if (user) {
      setFormData({
        username: user.username || '',
        heightCm: user.heightCm || 170,
        weightKg: user.weightKg || 65,
        targetCalories: user.targetCalories || 2000,
        targetProtein: user.targetProtein || 80,
        targetCarbohydrates: user.targetCarbohydrates || 300,
        targetFat: user.targetFat || 65,
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      message.error('请输入用户名');
      return;
    }
    if (formData.heightCm <= 0 || formData.heightCm > 300) {
      message.error('请输入有效的身高');
      return;
    }
    if (formData.weightKg <= 0 || formData.weightKg > 500) {
      message.error('请输入有效的体重');
      return;
    }
    if (formData.targetCalories <= 0 || formData.targetCalories > 10000) {
      message.error('请输入有效的目标热量');
      return;
    }
    if (formData.targetProtein <= 0 || formData.targetProtein > 500) {
      message.error('请输入有效的蛋白质目标');
      return;
    }
    if (formData.targetCarbohydrates <= 0 || formData.targetCarbohydrates > 1000) {
      message.error('请输入有效的碳水化合物目标');
      return;
    }
    if (formData.targetFat <= 0 || formData.targetFat > 500) {
      message.error('请输入有效的脂肪目标');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile({
        username: formData.username,
        heightCm: formData.heightCm,
        weightKg: formData.weightKg,
        targetCalories: formData.targetCalories,
        targetProtein: formData.targetProtein,
        targetCarbohydrates: formData.targetCarbohydrates,
        targetFat: formData.targetFat,
      });
      dispatch(setUser(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      message.success('个人信息更新成功');
      setIsEditing(false);
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || '更新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const calculateBMI = () => {
    if (!formData.heightCm || !formData.weightKg) return 0;
    const heightM = formData.heightCm / 100;
    return (formData.weightKg / (heightM * heightM)).toFixed(1);
  };

  const currentUser = user || {
    username: '用户昵称',
    email: 'user@example.com',
    avatarUrl: '',
    heightCm: 170,
    weightKg: 65,
    targetCalories: 2000,
    targetProtein: 80,
    targetCarbohydrates: 300,
    targetFat: 65,
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 mb-1">
            个人中心
          </h1>
          <p className="text-surface-500">
            请登录后查看您的个人资料
          </p>
        </div>
      </div>
    );
  }

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
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-surface-50 transition-colors">
              <CameraIcon className="w-4 h-4 text-surface-600" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-surface-900">{currentUser.username}</h2>
            <p className="text-surface-500">{currentUser.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="badge">{currentUser.targetCalories} kcal/天</span>
            </div>
          </div>
          <Button variant="ghost" icon={<PencilIcon className="w-5 h-5" />} onClick={handleEditClick}>
            编辑
          </Button>
        </div>
      </Card>

      {/* Body Stats */}
      <Card>
        <h3 className="font-semibold text-surface-900 mb-4">身体数据</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-surface-50 rounded-xl">
            <p className="text-2xl font-bold text-surface-900">{currentUser.heightCm}</p>
            <p className="text-sm text-surface-500">身高 (cm)</p>
          </div>
          <div className="text-center p-4 bg-surface-50 rounded-xl">
            <p className="text-2xl font-bold text-surface-900">{currentUser.weightKg}</p>
            <p className="text-sm text-surface-500">体重 (kg)</p>
          </div>
          <div className="text-center p-4 bg-surface-50 rounded-xl">
            <p className="text-2xl font-bold text-surface-900">{calculateBMI()}</p>
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
              <span className="font-medium text-surface-900">{currentUser.targetCalories} kcal</span>
            </div>
            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
              <div className="h-full w-full bg-primary-500 rounded-full"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-surface-600">蛋白质</span>
              <span className="font-medium text-surface-900">{currentUser.targetProtein || 80}g</span>
            </div>
            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-primary-500 rounded-full"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-surface-600">碳水化合物</span>
              <span className="font-medium text-surface-900">{currentUser.targetCarbohydrates || 300}g</span>
            </div>
            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-accent-500 rounded-full"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-surface-600">脂肪</span>
              <span className="font-medium text-surface-900">{currentUser.targetFat || 65}g</span>
            </div>
            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        title="编辑个人信息"
        open={isEditing}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" variant="secondary" onClick={handleCancel}>
            取消
          </Button>,
          <Button key="save" variant="primary" onClick={handleSave} loading={loading}>
            保存
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              用户名
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="请输入用户名"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                身高 (cm)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                min={1}
                max={300}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                体重 (kg)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                min={1}
                max={500}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              每日目标热量 (kcal)
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.targetCalories}
              onChange={(e) => setFormData({ ...formData, targetCalories: Number(e.target.value) })}
              min={1}
              max={10000}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                蛋白质目标 (g)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.targetProtein}
                onChange={(e) => setFormData({ ...formData, targetProtein: Number(e.target.value) })}
                min={1}
                max={500}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                碳水化合物目标 (g)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.targetCarbohydrates}
                onChange={(e) => setFormData({ ...formData, targetCarbohydrates: Number(e.target.value) })}
                min={1}
                max={1000}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                脂肪目标 (g)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.targetFat}
                onChange={(e) => setFormData({ ...formData, targetFat: Number(e.target.value) })}
                min={1}
                max={500}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
