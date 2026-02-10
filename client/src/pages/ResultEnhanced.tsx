import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { message, Modal, Select } from 'antd';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PortionSelector from '../components/common/PortionSelector';
import { foodRecognitionService, type FoodRecognitionResult, type RecognitionResult } from '../services/foodRecognitionService';
import { recordService, type MealDish } from '../services/recordService';
import {
  CheckCircleIcon,
  SparklesIcon,
  FireIcon,
  DocumentPlusIcon,
  ScaleIcon,
  CameraIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface DishPortion {
  dish: RecognitionResult;
  portion: number;
  nutrients: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  };
}

interface RecordTypeOption {
  value: string;
  label: string;
}

const recordTypeOptions: RecordTypeOption[] = [
  { value: 'breakfast', label: '[早餐]' },
  { value: 'lunch', label: '[午餐]' },
  { value: 'dinner', label: '[晚餐]' },
  { value: 'snack', label: '[加餐]' },
];

const ResultEnhanced: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const imageUrl = location.state?.imageUrl as string;
  const previewUrl = location.state?.previewUrl as string;

  const [recognizing, setRecognizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [result, setResult] = useState<FoodRecognitionResult | null>(null);
  const [dishPortions, setDishPortions] = useState<Map<number, DishPortion>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [recordType, setRecordType] = useState<string>('lunch');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (previewUrl && !result) {
      handleRecognize();
    }
  }, [previewUrl, result]);

  const handleRecognize = async () => {
    if (!previewUrl) {
      message.warning('没有图片数据，请重新上传');
      navigate('/upload');
      return;
    }

    setRecognizing(true);
    setProgress(0);
    setProgressStatus('加载图片...');
    setError(null);

    try {
      const image = new Image();
      image.src = previewUrl;
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      setProgress(20);
      setProgressStatus('图片加载完成');

      const recognitionResult = await foodRecognitionService.recognize(image);

      const portions = new Map<number, DishPortion>();
      recognitionResult.dishes.forEach(dish => {
        const portion = dish.standardPortion;
        const nutrients = {
          calories: Math.round(dish.caloriesPer100g * portion / 100),
          protein: parseFloat((dish.protein * portion / 100).toFixed(1)),
          carbohydrates: parseFloat((dish.carbohydrates * portion / 100).toFixed(1)),
          fat: parseFloat((dish.fat * portion / 100).toFixed(1))
        };
        portions.set(dish.dishId, {
          dish,
          portion,
          nutrients
        });
      });
      setDishPortions(portions);

      setResult(recognitionResult);
      setProgress(100);
      setProgressStatus('识别完成');
      message.success('识别完成');
    } catch (err: any) {
      console.error('识别失败:', err);
      setError(err.message || '识别失败，请重试');
      message.error('识别失败');
    } finally {
      setRecognizing(false);
    }
  };

  const calculateTotalNutrients = useCallback(() => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalWeight = 0;

    dishPortions.forEach(({ portion, nutrients }) => {
      totalCalories += nutrients.calories;
      totalProtein += nutrients.protein;
      totalCarbs += nutrients.carbohydrates;
      totalFat += nutrients.fat;
      totalWeight += portion;
    });

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbohydrates: totalCarbs,
      fat: totalFat,
      weight: totalWeight
    };
  }, [dishPortions]);

  const handleRetry = () => {
    setResult(null);
    setDishPortions(new Map());
    setProgress(0);
    navigate('/upload');
  };

  const handleSaveClick = () => {
    setSaveModalVisible(true);
  };

  const handleConfirmSave = async () => {
    const dishes: MealDish[] = Array.from(dishPortions.values()).map(({ dish, portion, nutrients }) => ({
      dishId: dish.dishId,
      dishName: dish.dishName,
      portion,
      confidence: dish.confidence,
      calories: nutrients.calories,
      nutrients: {
        protein: nutrients.protein,
        carbohydrates: nutrients.carbohydrates,
        fat: nutrients.fat
      }
    }));

    setSaving(true);
    try {
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

  const totalNutrients = calculateTotalNutrients();

  const renderContent = () => {
    if (!imageUrl && !previewUrl) {
      return (
        <div className="text-center py-12">
          <p className="text-surface-500 mb-4">暂无识别结果</p>
          <Button variant="primary" onClick={() => navigate('/upload')}>
            前往上传
          </Button>
        </div>
      );
    }

    if (recognizing) {
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
            菜品识别中...
          </h3>
          <p className="text-surface-500 mb-4">
            {progressStatus || '正在分析图片中的菜品'}
          </p>
          <div className="w-64 mx-auto bg-surface-100 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-surface-400 mt-2">{progress}%</p>
        </div>
      );
    }

    if (error && !result) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">X</span>
          </div>
          <h3 className="text-lg font-semibold text-surface-900 mb-2">识别失败</h3>
          <p className="text-surface-500 mb-4">{error}</p>
          <Button variant="primary" onClick={handleRetry}>
            重新拍照
          </Button>
        </div>
      );
    }

    if (result) {
      const { dishes, processingTime } = result;
      const avgConfidence = dishes.reduce((sum, dish) => sum + dish.confidence, 0) / dishes.length;

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
                <p className="text-4xl font-bold">{totalNutrients.calories}</p>
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
            {dishes.map((dish) => {
              const dishPortion = dishPortions.get(dish.dishId);
              const portion = dishPortion?.portion || dish.standardPortion;
              const nutrients = dishPortion?.nutrients || {
                calories: Math.round(dish.caloriesPer100g * portion / 100),
                protein: parseFloat((dish.protein * portion / 100).toFixed(1)),
                carbohydrates: parseFloat((dish.carbohydrates * portion / 100).toFixed(1)),
                fat: parseFloat((dish.fat * portion / 100).toFixed(1))
              };

              return (
                <Card key={dish.dishId}>
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">*</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-surface-900">
                            {dish.dishName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="badge bg-primary-100 text-primary-700">
                              {(dish.confidence * 100).toFixed(0)}%
                            </span>
                            <span className="text-xs text-surface-500">
                              {dish.category}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary-600">
                            {nutrients.calories}
                          </p>
                          <p className="text-xs text-surface-500">kcal</p>
                        </div>
                      </div>

                      <div className="border-t border-surface-100 pt-3 mt-3">
                        <PortionSelector
                          dishName={dish.dishName}
                          caloriesPer100g={dish.caloriesPer100g}
                          proteinPer100g={dish.protein}
                          carbsPer100g={dish.carbohydrates}
                          fatPer100g={dish.fat}
                          density={dish.density}
                          standardPortion={dish.standardPortion}
                          onChange={(grams, nut) => {
                            const newMap = new Map(dishPortions);
                            newMap.set(dish.dishId, { dish, portion: grams, nutrients: nut });
                            setDishPortions(newMap);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="bg-surface-50 border-0">
            <div className="flex items-center gap-2 mb-4">
              <ScaleIcon className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-surface-900">总计</h3>
            </div>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <ScaleIcon className="w-5 h-5 mx-auto text-surface-400 mb-1" />
                <p className="text-lg font-bold text-surface-900">
                  {totalNutrients.weight}
                </p>
                <p className="text-xs text-surface-500">总重量(g)</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <FireIcon className="w-5 h-5 mx-auto text-primary-500 mb-1" />
                <p className="text-lg font-bold text-surface-900">
                  {totalNutrients.calories}
                </p>
                <p className="text-xs text-surface-500">热量(kcal)</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="w-5 h-5 mx-auto rounded-full bg-primary-500 mb-1"></div>
                <p className="text-lg font-bold text-surface-900">
                  {totalNutrients.protein.toFixed(1)}
                </p>
                <p className="text-xs text-surface-500">蛋白质(g)</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="w-5 h-5 mx-auto rounded-full bg-accent-500 mb-1"></div>
                <p className="text-lg font-bold text-surface-900">
                  {totalNutrients.carbohydrates.toFixed(1)}
                </p>
                <p className="text-xs text-surface-500">碳水(g)</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="w-5 h-5 mx-auto rounded-full bg-yellow-500 mb-1"></div>
                <p className="text-lg font-bold text-surface-900">
                  {totalNutrients.fat.toFixed(1)}
                </p>
                <p className="text-xs text-surface-500">脂肪(g)</p>
              </div>
            </div>
          </Card>

          <div className="flex justify-center gap-4">
            <Button
              variant="secondary"
              icon={<CameraIcon className="w-5 h-5" />}
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
                {Array.from(dishPortions.values()).map((d) => `${d.dish.dishName} (${d.portion}g)`).join(' + ')}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-lg font-bold text-primary-600">
                  {totalNutrients.calories} kcal
                </p>
                <p className="text-sm text-surface-500">
                  共 {totalNutrients.weight}g
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ResultEnhanced;
