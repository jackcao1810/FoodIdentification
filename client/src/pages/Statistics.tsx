import React from 'react';
import Card from '../components/common/Card';
import {
  FireIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

const Statistics: React.FC = () => {
  const weeklyData = [
    { day: '周一', calories: 1850, target: 2000 },
    { day: '周二', calories: 2100, target: 2000 },
    { day: '周三', calories: 1780, target: 2000 },
    { day: '周四', calories: 1950, target: 2000 },
    { day: '周五', calories: 2200, target: 2000 },
    { day: '周六', calories: 2400, target: 2000 },
    { day: '周日', calories: 1900, target: 2000 },
  ];

  const maxCalories = Math.max(...weeklyData.map((d) => d.calories));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-surface-900 mb-1">
          数据统计
        </h1>
        <p className="text-surface-500">
          分析您的饮食数据，了解营养摄入情况
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <FireIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-surface-500">今日摄入</p>
              <p className="text-2xl font-bold text-surface-900">1,850</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="text-sm text-surface-500">周均热量</p>
              <p className="text-2xl font-bold text-surface-900">2,026</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-surface-500">记录天数</p>
              <p className="text-2xl font-bold text-surface-900">14</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <TrophyIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-surface-500">连续打卡</p>
              <p className="text-2xl font-bold text-surface-900">7天</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card>
        <h3 className="font-semibold text-surface-900 mb-6">本周热量趋势</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {weeklyData.map((day) => {
            const height = (day.calories / maxCalories) * 100;
            const isOverTarget = day.calories > day.target;
            return (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full flex justify-center">
                  <div
                    className={`w-12 rounded-t-xl transition-all duration-500 ${
                      isOverTarget
                        ? 'bg-gradient-to-t from-orange-400 to-orange-500'
                        : 'bg-gradient-to-t from-primary-400 to-primary-500'
                    }`}
                    style={{ height: `${height}%`, minHeight: '8px' }}
                  ></div>
                  <span className="absolute -top-6 text-xs font-medium text-surface-600">
                    {day.calories}
                  </span>
                </div>
                <span className="text-xs text-surface-500">{day.day}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-surface-100 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-500"></div>
            <span className="text-sm text-surface-600">正常摄入</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm text-surface-600">超出目标</span>
          </div>
        </div>
      </Card>

      {/* Nutrition Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-surface-900 mb-4">营养分布</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-surface-600">蛋白质</span>
                <span className="font-medium text-surface-900">65g / 80g</span>
              </div>
              <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-primary-500 rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-surface-600">碳水化合物</span>
                <span className="font-medium text-surface-900">220g / 300g</span>
              </div>
              <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-accent-500 rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-surface-600">脂肪</span>
                <span className="font-medium text-surface-900">55g / 65g</span>
              </div>
              <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
                <div className="h-full w-5/6 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-surface-900 mb-4">周度对比</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
              <span className="text-surface-600">本周平均</span>
              <span className="font-semibold text-surface-900">2,026 kcal</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
              <span className="text-surface-600">上周平均</span>
              <span className="font-semibold text-surface-900">1,950 kcal</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <span className="text-green-700">变化</span>
              <span className="font-semibold text-green-600">+3.9%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
