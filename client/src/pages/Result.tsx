import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { message, Modal, Select } from 'antd';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useDishRecognition from '../hooks/useDishRecognition';
import { recordService, type MealDish } from '../services/recordService';
import {
  CheckCircleIcon,
  SparklesIcon,
  FireIcon,
  ArrowPathIcon,
  DocumentPlusIcon,
} from '@heroicons/react/24/outline';

interface NutrientInfo {
  protein: number;
  carbohydrates: number;
  fat: number;
}

const recordTypeOptions = [
  { value: 'breakfast', label: '🌅 早餐' },
  { value: 'lunch', label: '☀️ 午餐' },
  { value: 'dinner', label: '🌙 晚餐' },
  { value: 'snack', label: '🍪 加餐' },
];

const Result: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const imageUrl = location.state?.imageUrl as string;
  const previewUrl = location.state?.previewUrl as string;

  const {
    status,
    result,
    error,
    processingProgress,
    recognize,
    reset,
  } = useDishRecognition();

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [recordType, setRecordType] = useState<string>('lunch');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (previewUrl && status === 'idle') {
      handleRecognize();
    }
  }, [previewUrl]);

  const handleRecognize = async () => {
    if (!previewUrl) {
      message.warning('没有图片数据，请重新上传');
      navigate('/upload');
      return;
    }

    const recognitionResult = await recognize(previewUrl);
    if (recognitionResult) {
      message.success('识别完成');
    } else if (error) {
      message.error(error);
    }
  };

  const handleRetry = () => {
    reset();
    navigate('/upload');
  };

  const handleSaveClick = () => {
    setSaveModalVisible(true);
  };

  const handleConfirmSave = async () => {
    if (!result) {
      message.warning('没有识别结果');
      return;
    }

    setSaving(true);
    try {
      const dishes: MealDish[] = result.dishes.map((dish) => ({
        dishId: dish.dishId,
        dishName: dish.dishName,
        confidence: dish.confidence,
        nutrients: dish.nutrients,
      }));

      await recordService.create({
        recordType: recordType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        dishes,
      });

      message.success('已保存到饮食记录');
      setSaveModalVisible(false);
      navigate('/history');
    } catch (err: any) {
      console.error('保存失败:', err);
      message.error(err.response?.data?.error?.message || '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    if (!imageUrl && status === 'idle') {
      return (
        <div className="text-center py-12">
          <p className="text-surface-500 mb-4">暂无识别结果</p>
          <Button variant="primary" onClick={() => navigate('/upload')}>
            前往上传
          </Button>
        </div>
      );
    }

    if (status === 'loading' || status === 'recognizing') {
      return (
        <div className="text-center py-16">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
            <div
              className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"
              style={{ animationDuration: '1s' }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <SparklesIcon className="w-10 h-10 text-primary-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-surface-900 mb-2">
            {status === 'loading' ? '加载识别模型...' : '菜品识别中...'}
          </h3>
          <p className="text-surface-500 mb-4">
            {status === 'loading' ? '正在初始化AI模型' : '正在分析图片中的菜品'}
          </p>
          <div className="w-64 mx-auto bg-surface-100 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-surface-400 mt-2">{processingProgress}%</p>
        </div>
      );
    }

    if (error && status === 'error') {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h3 className="text-lg font-semibold text-surface-900 mb-2">识别失败</h3>
          <p className="text-surface-500 mb-4">{error}</p>
          <Button variant="primary" onClick={handleRecognize}>
            重试
          </Button>
        </div>
      );
    }

    if (result) {
      const { dishes, totalCalories, processingTime } = result;

      const totalProtein = dishes.reduce(
        (sum, dish) => sum + (dish.nutrients?.protein || 0),
        0
      );
      const totalCarbs = dishes.reduce(
        (sum, dish) => sum + (dish.nutrients?.carbohydrates || 0),
        0
      );
      const totalFat = dishes.reduce(
        (sum, dish) => sum + (dish.nutrients?.fat || 0),
        0
      );

      const avgConfidence =
        dishes.reduce((sum, dish) => sum + dish.confidence, 0) / dishes.length;

      return (
        <>
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
              <CheckCircleIcon className="w-5 h-5" />
              识别完成
            </div>
            <h1 className="text-2xl font-display font-bold text-surface-900 mb-2">
              识别结果
            </h1>
            <p className="text-surface-500">
              共识别出 {dishes.length} 道菜品，耗时 {processingTime}ms
            </p>
          </div>

          {previewUrl && (
            <div className="mb-6">
              <img
                src={previewUrl}
                alt="上传的菜品"
                className="w-full max-h-64 object-contain rounded-xl bg-surface-50"
              />
            </div>
          )}

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
                  <span>AI智能识别</span>
                </div>
                <p className="text-sm text-primary-200 mt-1">
                  平均置信度 {(avgConfidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {dishes.map((dish) => (
              <Card key={dish.dishId} hover>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-surface-900">
                          {dish.dishName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="badge bg-primary-100 text-primary-700">
                            {(dish.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary-600">
                          {dish.nutrients
                            ? (
                                dish.nutrients.protein * 4 +
                                dish.nutrients.carbohydrates * 4 +
                                dish.nutrients.fat * 9
                              ).toFixed(0)
                            : '-'}
                        </p>
                        <p className="text-xs text-surface-500">kcal</p>
                      </div>
                    </div>
                    {dish.nutrients && (
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-surface-500">蛋白质</p>
                          <p className="font-semibold text-surface-900">
                            {dish.nutrients.protein.toFixed(1)}g
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-surface-500">碳水</p>
                          <p className="font-semibold text-surface-900">
                            {dish.nutrients.carbohydrates.toFixed(1)}g
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-surface-500">脂肪</p>
                          <p className="font-semibold text-surface-900">
                            {dish.nutrients.fat.toFixed(1)}g
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <h3 className="font-semibold text-surface-900 mb-4">营养成分总计</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-surface-50 rounded-xl">
                <FireIcon className="w-6 h-6 mx-auto text-primary-500 mb-2" />
                <p className="text-2xl font-bold text-surface-900">
                  {totalCalories}
                </p>
                <p className="text-xs text-surface-500">热量(kcal)</p>
              </div>
              <div className="text-center p-4 bg-surface-50 rounded-xl">
                <div className="w-6 h-6 mx-auto rounded-full bg-primary-500 mb-2"></div>
                <p className="text-2xl font-bold text-surface-900">
                  {totalProtein.toFixed(1)}
                </p>
                <p className="text-xs text-surface-500">蛋白质(g)</p>
              </div>
              <div className="text-center p-4 bg-surface-50 rounded-xl">
                <div className="w-6 h-6 mx-auto rounded-full bg-accent-500 mb-2"></div>
                <p className="text-2xl font-bold text-surface-900">
                  {totalCarbs.toFixed(1)}
                </p>
                <p className="text-xs text-surface-500">碳水(g)</p>
              </div>
              <div className="text-center p-4 bg-surface-50 rounded-xl">
                <div className="w-6 h-6 mx-auto rounded-full bg-yellow-500 mb-2"></div>
                <p className="text-2xl font-bold text-surface-900">
                  {totalFat.toFixed(1)}
                </p>
                <p className="text-xs text-surface-500">脂肪(g)</p>
              </div>
            </div>
          </Card>

          <div className="flex justify-center gap-4">
            <Button
              variant="secondary"
              icon={<ArrowPathIcon className="w-5 h-5" />}
              onClick={handleRetry}
            >
              重新拍照
            </Button>
            <Button
              variant="primary"
              icon={<DocumentPlusIcon className="w-5 h-5" />}
              onClick={handleSaveClick}
            >
              保存到记录
            </Button>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {renderContent()}
      </div>

      <Modal
        title="保存到饮食记录"
        open={saveModalVisible}
        onCancel={() => setSaveModalVisible(false)}
        onOk={handleConfirmSave}
        confirmLoading={saving}
        okText="确认保存"
        cancelText="取消"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              餐饮类型
            </label>
            <Select
              value={recordType}
              onChange={setRecordType}
              options={recordTypeOptions}
              className="w-full"
            />
          </div>
          {result && (
            <div className="bg-surface-50 rounded-lg p-4">
              <h4 className="font-medium text-surface-900 mb-2">识别结果摘要</h4>
              <p className="text-sm text-surface-600">
                {result.dishes.map((d) => d.dishName).join(' + ')}
              </p>
              <p className="text-lg font-bold text-primary-600 mt-2">
                {result.totalCalories} kcal
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Result;
