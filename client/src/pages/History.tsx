import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const mockHistory = [
  {
    id: 1,
    dishes: ['宫保鸡丁', '米饭'],
    totalCalories: 419,
    imageUrl: '',
    createdAt: '2026-01-29 12:30',
  },
  {
    id: 2,
    dishes: ['番茄炒蛋', '红烧茄子', '米饭'],
    totalCalories: 562,
    imageUrl: '',
    createdAt: '2026-01-29 18:15',
  },
  {
    id: 3,
    dishes: ['蒸蛋', '炒青菜'],
    totalCalories: 234,
    imageUrl: '',
    createdAt: '2026-01-28 12:00',
  },
];

const History: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 mb-1">
            历史记录
          </h1>
          <p className="text-surface-500">
            查看和管理您的饮食识别历史
          </p>
        </div>
        <Link to="/upload" className="btn-primary">
          新建识别
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="搜索记录..."
            className="input-field pl-10"
          />
        </div>
        <Button variant="secondary" icon={<FunnelIcon className="w-5 h-5" />}>
          筛选
        </Button>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {mockHistory.map((record) => (
          <Card key={record.id} hover className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📷</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-surface-900 truncate">
                  {record.dishes.join(' + ')}
                </h3>
              </div>
              <div className="flex items-center gap-4 text-sm text-surface-500">
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {record.createdAt}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary-600">{record.totalCalories}</p>
              <p className="text-xs text-surface-500">kcal</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockHistory.length === 0 && (
        <Card className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 flex items-center justify-center">
            <ClockIcon className="w-8 h-8 text-surface-400" />
          </div>
          <h3 className="font-semibold text-surface-900 mb-2">暂无记录</h3>
          <p className="text-surface-500 mb-4">开始您的第一次菜品识别吧</p>
          <Link to="/upload" className="btn-primary">
            立即识别
          </Link>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button variant="secondary" size="sm" disabled>
          上一页
        </Button>
        <Button variant="secondary" size="sm">
          下一页
        </Button>
      </div>
    </div>
  );
};

export default History;
