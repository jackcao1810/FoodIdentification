import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { statisticsService } from '../services/statisticsService';
import {
  CameraIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface DailyStats {
  totalCalories: number;
  targetCalories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

const features = [
  {
    name: '拍照识别',
    description: '上传菜品照片，AI自动识别菜品并计算热量',
    icon: CameraIcon,
    href: '/upload',
    color: 'from-primary-500 to-primary-600',
  },
  {
    name: '热量追踪',
    description: '记录每日饮食，了解热量摄入情况',
    icon: FireIcon,
    href: '/statistics',
    color: 'from-orange-500 to-orange-600',
  },
  {
    name: '历史记录',
    description: '查看历史识别记录，管理饮食数据',
    icon: ClockIcon,
    href: '/history',
    color: 'from-blue-500 to-blue-600',
  },
  {
    name: '数据分析',
    description: '可视化分析营养摄入，提供健康建议',
    icon: ChartBarIcon,
    href: '/statistics',
    color: 'from-purple-500 to-purple-600',
  },
];

const Home: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    totalCalories: 0,
    targetCalories: 2000,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDailyStats = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const stats = await statisticsService.getDailyStats();
        setDailyStats({
          totalCalories: stats.totalCalories,
          targetCalories: stats.targetCalories,
          protein: stats.protein,
          carbohydrates: stats.carbohydrates,
          fat: stats.fat,
        });
      } catch (error) {
        console.error('Failed to load daily stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDailyStats();
  }, [isAuthenticated]);

  const todayCalories = dailyStats.totalCalories;
  const targetCalories = dailyStats.targetCalories;
  const calorieProgress = Math.min((todayCalories / targetCalories) * 100, 100);
  const remainingCalories = Math.max(targetCalories - todayCalories, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-display font-bold mb-2">
            欢迎使用菜品识别系统
          </h1>
          <p className="text-primary-100 text-lg mb-6 max-w-xl">
            智能识别食堂菜品，精准计算热量，帮助您科学饮食、健康生活
          </p>
          <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-colors">
            立即开始识别
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-accent-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-surface-900">今日热量</h2>
              <p className="text-sm text-surface-500">热量追踪</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-surface-900">{todayCalories}</div>
              <div className="text-sm text-surface-500">/ {targetCalories} kcal</div>
            </div>
          </div>
          <div className="relative h-4 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${calorieProgress}%` }}
            />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-surface-500">已摄入</span>
            <span className="font-semibold text-primary-600">{remainingCalories} kcal 剩余</span>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-surface-500 mb-4">营养分布</h3>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-2 bg-surface-100 rounded-full"></div>
              <div className="h-2 bg-surface-100 rounded-full"></div>
              <div className="h-2 bg-surface-100 rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-600">蛋白质</span>
                  <span className="font-medium text-surface-900">{dailyStats.protein}g</span>
                </div>
                <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((dailyStats.protein / 80) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-600">碳水化合物</span>
                  <span className="font-medium text-surface-900">{dailyStats.carbohydrates}g</span>
                </div>
                <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((dailyStats.carbohydrates / 300) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-600">脂肪</span>
                  <span className="font-medium text-surface-900">{dailyStats.fat}g</span>
                </div>
                <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((dailyStats.fat / 65) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-surface-900 mb-4">快速开始</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <Link key={feature.name} to={feature.href}>
              <Card hover className="h-full">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-surface-900 mb-1">{feature.name}</h3>
                <p className="text-sm text-surface-500">{feature.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {!isAuthenticated && (
        <Card className="bg-gradient-to-r from-surface-50 to-primary-50 border-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-surface-900 mb-1">登录后解锁更多功能</h3>
              <p className="text-sm text-surface-500">记录饮食历史，获取个性化营养建议</p>
            </div>
            <div className="flex gap-3">
              <Link to="/auth/login" className="btn-ghost">登录</Link>
              <Link to="/auth/register" className="btn-primary">注册</Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Home;
