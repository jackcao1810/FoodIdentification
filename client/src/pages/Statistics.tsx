import React, { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import {
  FireIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { useAppSelector } from '../store/hooks';
import { statisticsService } from '../services/statisticsService';

interface WeeklyData {
  day: string;
  calories: number;
  target: number;
}

interface OverviewData {
  todayCalories: number;
  weeklyAverage: number;
  streak: number;
  recordDays: number;
}

interface NutrientData {
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

const Statistics: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [overview, setOverview] = useState<OverviewData>({
    todayCalories: 0,
    weeklyAverage: 0,
    streak: 0,
    recordDays: 0,
  });
  const [nutrients, setNutrients] = useState<NutrientData>({
    averageProtein: 0,
    averageCarbs: 0,
    averageFat: 0,
    proteinGoal: 80,
    carbsGoal: 300,
    fatGoal: 65,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const [overviewData, trendData, nutrientsData] = await Promise.all([
          statisticsService.getOverview(),
          statisticsService.getTrend('week'),
          statisticsService.getNutrients('week'),
        ]);

        setOverview({
          todayCalories: overviewData.todayCalories,
          weeklyAverage: overviewData.weeklyAverage,
          streak: overviewData.streak,
          recordDays: overviewData.streak,
        });

        const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const formattedWeeklyData = trendData.dates.map((date, index) => {
          const d = new Date(date);
          return {
            day: dayNames[d.getDay()],
            calories: trendData.calories[index],
            target: 2000,
          };
        });
        setWeeklyData(formattedWeeklyData);

        setNutrients({
          averageProtein: nutrientsData.averageProtein,
          averageCarbs: nutrientsData.averageCarbs,
          averageFat: nutrientsData.averageFat,
          proteinGoal: nutrientsData.proteinGoal,
          carbsGoal: nutrientsData.carbsGoal,
          fatGoal: nutrientsData.fatGoal,
        });
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const maxCalories = weeklyData.length > 0
    ? Math.max(...weeklyData.map((d) => d.calories), 2000)
    : 2000;

  if (!isAuthenticated) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 mb-1">
            数据统计
          </h1>
          <p className="text-surface-500">
            请登录后查看您的饮食统计数据
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 mb-1">
            数据统计
          </h1>
          <p className="text-surface-500">
            加载中...
          </p>
        </div>
      </div>
    );
  }

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
              <p className="text-2xl font-bold text-surface-900">{overview.todayCalories.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-surface-900">{overview.weeklyAverage.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-surface-900">{overview.recordDays}</p>
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
              <p className="text-2xl font-bold text-surface-900">{overview.streak}天</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card>
        <h3 className="font-semibold text-surface-900 mb-6">本周热量趋势</h3>
        {weeklyData.length > 0 ? (
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
        ) : (
          <div className="h-64 flex items-center justify-center text-surface-400">
暂无数据
          </div>
        )}
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
                <span className="font-medium text-surface-900">{nutrients.averageProtein.toFixed(0)}g / {nutrients.proteinGoal}g</span>
              </div>
              <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((nutrients.averageProtein / nutrients.proteinGoal) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-surface-600">碳水化合物</span>
                <span className="font-medium text-surface-900">{nutrients.averageCarbs.toFixed(0)}g / {nutrients.carbsGoal}g</span>
              </div>
              <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((nutrients.averageCarbs / nutrients.carbsGoal) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-surface-600">脂肪</span>
                <span className="font-medium text-surface-900">{nutrients.averageFat.toFixed(0)}g / {nutrients.fatGoal}g</span>
              </div>
              <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((nutrients.averageFat / nutrients.fatGoal) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-surface-900 mb-4">周度对比</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
              <span className="text-surface-600">本周平均</span>
              <span className="font-semibold text-surface-900">{overview.weeklyAverage.toLocaleString()} kcal</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
              <span className="text-surface-600">上周平均</span>
              <span className="font-semibold text-surface-900">-- kcal</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <span className="text-green-700">变化</span>
              <span className="font-semibold text-green-600">--</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
