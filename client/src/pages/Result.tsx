import React from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  CheckCircleIcon,
  AdjustmentIcon,
  SparklesIcon,
  FireIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const mockResults = [
  {
    dishId: 1,
    dishName: '宫保鸡丁',
    confidence: 0.92,
    calories: 245,
    portion: 150,
    nutrients: { protein: 18.5, carbs: 12.3, fat: 14.2 },
  },
  {
    dishId: 2,
    dishName: '米饭',
    confidence: 0.88,
    calories: 174,
    portion: 100,
    nutrients: { protein: 2.6, carbs: 38.0, fat: 0.3 },
  },
];

const Result: React.FC = () => {
  const { id } = useParams();

  const totalCalories = mockResults.reduce((sum, dish) => sum + dish.calories, 0);
  const totalProtein = mockResults.reduce((sum, dish) => sum + dish.nutrients.protein, 0);
  const totalCarbs = mockResults.reduce((sum, dish) => sum + dish.nutrients.carbs, 0);
  const totalFat = mockResults.reduce((sum, dish) => sum + dish.nutrients.fat, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
          <CheckCircleIcon className="w-5 h-5" />
          识别完成
        </div>
        <h1 className="text-2xl font-display font-bold text-surface-900 mb-2">
          识别结果
        </h1>
        <p className="text-surface-500">
          共识别出 {mockResults.length} 道菜品
        </p>
      </div>

      {/* Total Calories */}
      <Card className="bg-gradient-to-r from-primary-500 to-accent-500 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm">总热量</p>
            <p className="text-4xl font-bold">{totalCalories}</p>
            <p className="text-primary-100 text-sm">kcal</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-primary-100">
              <SparklesIcon className="w-5 h-5" />
              <span>智能识别</span>
            </div>
            <p className="text-sm text-primary-200 mt-1">
              置信度 90%
            </p>
          </div>
        </div>
      </Card>

      {/* Dish List */}
      <div className="space-y-4">
        {mockResults.map((dish) => (
          <Card key={dish.dishId} hover>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🍽️</span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-surface-900">{dish.dishName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-surface-500">
                        约 {dish.portion}g
                      </span>
                      <span className="badge bg-primary-100 text-primary-700">
                        {(dish.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary-600">{dish.calories}</p>
                    <p className="text-xs text-surface-500">kcal</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-surface-500">蛋白质</p>
                    <p className="font-semibold text-surface-900">{dish.nutrients.protein}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">碳水</p>
                    <p className="font-semibold text-surface-900">{dish.nutrients.carbs}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">脂肪</p>
                    <p className="font-semibold text-surface-900">{dish.nutrients.fat}g</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Nutrition Summary */}
      <Card>
        <h3 className="font-semibold text-surface-900 mb-4">营养成分总计</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-surface-50 rounded-xl">
            <FireIcon className="w-6 h-6 mx-auto text-primary-500 mb-2" />
            <p className="text-2xl font-bold text-surface-900">{totalCalories}</p>
            <p className="text-xs text-surface-500">热量(kcal)</p>
          </div>
          <div className="text-center p-4 bg-surface-50 rounded-xl">
            <div className="w-6 h-6 mx-auto rounded-full bg-primary-500 mb-2"></div>
            <p className="text-2xl font-bold text-surface-900">{totalProtein}</p>
            <p className="text-xs text-surface-500">蛋白质(g)</p>
          </div>
          <div className="text-center p-4 bg-surface-50 rounded-xl">
            <div className="w-6 h-6 mx-auto rounded-full bg-accent-500 mb-2"></div>
            <p className="text-2xl font-bold text-surface-900">{totalCarbs}</p>
            <p className="text-xs text-surface-500">碳水(g)</p>
          </div>
          <div className="text-center p-4 bg-surface-50 rounded-xl">
            <div className="w-6 h-6 mx-auto rounded-full bg-yellow-500 mb-2"></div>
            <p className="text-2xl font-bold text-surface-900">{totalFat}</p>
            <p className="text-xs text-surface-500">脂肪(g)</p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="secondary" icon={<ArrowPathIcon className="w-5 h-5" />}>
          重新拍照
        </Button>
        <Button variant="primary">
          保存到记录
        </Button>
      </div>
    </div>
  );
};

export default Result;
