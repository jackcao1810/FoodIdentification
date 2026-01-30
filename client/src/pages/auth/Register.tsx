import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';
import Button from '../../components/common/Button';
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      dispatch(setCredentials({
        user: response.user,
        token: response.token,
      }));

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-surface-900 mb-6">创建账号</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-surface-700 mb-2">
            用户名
          </label>
          <div className="relative">
            <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="input-field pl-10"
              placeholder="请输入用户名"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-2">
            邮箱地址
          </label>
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field pl-10"
              placeholder="请输入邮箱"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-2">
            密码
          </label>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field pl-10"
              placeholder="请输入密码（至少6位）"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-700 mb-2">
            确认密码
          </label>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="input-field pl-10"
              placeholder="请再次输入密码"
              required
            />
          </div>
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            className="w-4 h-4 mt-0.5 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            required
          />
          <label htmlFor="terms" className="text-sm text-surface-600">
            我已阅读并同意
            <a href="#" className="text-primary-600 hover:text-primary-700">《用户协议》</a>
            和
            <a href="#" className="text-primary-600 hover:text-primary-700">《隐私政策》</a>
          </label>
        </div>

        <Button type="submit" variant="primary" className="w-full" loading={loading}>
          注册
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-500">
        已有账号？
        <Link to="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
          立即登录
        </Link>
      </p>
    </div>
  );
};

export default Register;
