import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { API_ENDPOINTS } from '../services/endpoints';

const PasswordSettings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async () => {
    if (!formData.currentPassword) {
      message.error('请输入当前密码');
      return;
    }
    if (!formData.newPassword) {
      message.error('请输入新密码');
      return;
    }
    if (formData.newPassword.length < 6) {
      message.error('新密码至少需要6个字符');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await api.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      message.success('密码修改成功');
      navigate('/settings');
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || '密码修改失败，请检查当前密码是否正确');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/settings')}
          className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-surface-600" />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 mb-1">
            修改密码
          </h1>
          <p className="text-surface-500">
            保护您的账户安全
          </p>
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              当前密码
            </label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              placeholder="请输入当前密码"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              新密码
            </label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="请输入新密码（至少6个字符）"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              确认新密码
            </label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="请再次输入新密码"
            />
          </div>
          <div className="pt-4">
            <Button variant="primary" className="w-full" onClick={handleSubmit} loading={loading}>
              保存修改
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PasswordSettings;
