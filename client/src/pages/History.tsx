import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { message, DatePicker } from 'antd';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { recordService, type MealRecord } from '../services/recordService';
import {
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

const History: React.FC = () => {
  const [records, setRecords] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params: { date?: string } = {};
      if (selectedDate) {
        params.date = selectedDate.format('YYYY-MM-DD');
      }

      const { data } = await recordService.getRecords(params);
      setRecords(data);
    } catch (error: any) {
      console.error('获取记录失败:', error);
      message.error(error.response?.data?.error?.message || '获取记录失败');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = async (id: string) => {
    try {
      await recordService.delete(id);
      message.success('删除成功');
      fetchRecords();
    } catch (error: any) {
      console.error('删除失败:', error);
      message.error(error.response?.data?.error?.message || '删除失败');
    }
  };

  const getRecordTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
      snack: '加餐',
    };
    return labels[type] || type;
  };

  const getRecordTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍪',
    };
    return icons[type] || '🍽️';
  };

  const filteredRecords = records.filter((record) => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      record.dishes.some((dish) => dish.dishName.toLowerCase().includes(keyword)) ||
      record.totalCalories.toString().includes(keyword)
    );
  });

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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="搜索记录..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          placeholder="选择日期筛选"
          allowClear
          className="!w-full sm:!w-48"
        />
      </div>

      {/* Records List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-surface-500 mt-4">加载中...</p>
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <Card key={record.id} hover className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">{getRecordTypeIcon(record.recordType)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-surface-900 truncate">
                    {record.dishes.map((d) => d.dishName).join(' + ')}
                  </h3>
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs">
                    {getRecordTypeLabel(record.recordType)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-surface-500">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {dayjs(record.mealTime).format('YYYY-MM-DD HH:mm')}
                  </span>
                  <span className="flex items-center gap-1">
                    📊
                    蛋白质 {record.totalProtein}g · 碳水 {record.totalCarbs}g · 脂肪 {record.totalFat}g
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary-600">{record.totalCalories}</p>
                <p className="text-xs text-surface-500">kcal</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(record.id)}
                  className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除记录"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
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
      {filteredRecords.length > 0 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" size="sm" disabled>
            上一页
          </Button>
          <Button variant="secondary" size="sm">
            下一页
          </Button>
        </div>
      )}
    </div>
  );
};

export default History;
