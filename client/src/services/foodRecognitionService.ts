import api from './api';
import type { DishInfo, RecognitionResult, FoodRecognitionResult } from '../types/domain';

class FoodRecognitionService {
  async recognize(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<FoodRecognitionResult> {
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法获取 canvas 上下文');
    }
    ctx.drawImage(imageElement, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9);
    });

    if (!blob) {
      throw new Error('图片转换失败');
    }

    const formData = new FormData();
    formData.append('image', blob, 'image.jpg');

    const response = await api.post('/recognition/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.error?.message || '识别失败');
    }

    return response.data.data;
  }

  calculateCalories(dishId: number, weightInGrams: number): number {
    const dish = this.getDishById(dishId);
    if (!dish) return 0;
    return Math.round(dish.caloriesPer100g * weightInGrams / 100);
  }

  calculateNutrients(dishId: number, weightInGrams: number) {
    const dish = this.getDishById(dishId);
    if (!dish) return null;
    return {
      calories: Math.round(dish.caloriesPer100g * weightInGrams / 100),
      protein: parseFloat((dish.protein * weightInGrams / 100).toFixed(1)),
      carbohydrates: parseFloat((dish.carbohydrates * weightInGrams / 100).toFixed(1)),
      fat: parseFloat((dish.fat * weightInGrams / 100).toFixed(1))
    };
  }

  getDishById(id: number): DishInfo | undefined {
    return FOOD_DATABASE.find(dish => dish.id === id);
  }

  getAllDishes(): DishInfo[] {
    return FOOD_DATABASE;
  }

  searchDishes(query: string): DishInfo[] {
    const lowerQuery = query.toLowerCase();
    return FOOD_DATABASE.filter(dish =>
      dish.name.toLowerCase().includes(lowerQuery) ||
      dish.category.toLowerCase().includes(lowerQuery)
    );
  }
}

const FOOD_DATABASE: DishInfo[] = [
  { id: 1, name: '宫保鸡丁', category: '肉类', caloriesPer100g: 198, protein: 16.2, carbohydrates: 8.4, fat: 12.1, density: 0.85, standardPortion: 120, description: '经典川菜，鸡肉配花生' },
  { id: 2, name: '红烧肉', category: '肉类', caloriesPer100g: 320, protein: 14.5, carbohydrates: 4.2, fat: 28.1, density: 0.9, standardPortion: 100, description: '五花肉红烧，肥而不腻' },
  { id: 3, name: '糖醋里脊', category: '肉类', caloriesPer100g: 245, protein: 18.3, carbohydrates: 12.5, fat: 14.2, density: 0.85, standardPortion: 100, description: '酸甜口味，里脊肉' },
  { id: 4, name: '番茄炒蛋', category: '素菜', caloriesPer100g: 156, protein: 9.8, carbohydrates: 8.6, fat: 10.5, density: 0.8, standardPortion: 150, description: '番茄配鸡蛋，营养美味' },
  { id: 5, name: '麻婆豆腐', category: '豆制品', caloriesPer100g: 186, protein: 12.5, carbohydrates: 5.8, fat: 13.2, density: 0.75, standardPortion: 150, description: '麻辣豆腐，川菜经典' },
  { id: 6, name: '回锅肉', category: '肉类', caloriesPer100g: 298, protein: 15.8, carbohydrates: 3.5, fat: 25.6, density: 0.88, standardPortion: 100, description: '四川传统名菜' },
  { id: 7, name: '水煮鱼', category: '水产', caloriesPer100g: 215, protein: 18.5, carbohydrates: 5.2, fat: 14.3, density: 0.82, standardPortion: 150, description: '麻辣鲜香，鱼片嫩滑' },
  { id: 8, name: '蒸蛋', category: '蛋类', caloriesPer100g: 138, protein: 11.2, carbohydrates: 2.4, fat: 9.8, density: 0.9, standardPortion: 120, description: '嫩滑蒸蛋，营养丰富' },
  { id: 9, name: '炒青菜', category: '素菜', caloriesPer100g: 65, protein: 3.5, carbohydrates: 6.8, fat: 3.2, density: 0.6, standardPortion: 150, description: '清爽解腻，维生素丰富' },
  { id: 10, name: '米饭', category: '主食', caloriesPer100g: 116, protein: 2.6, carbohydrates: 25.6, fat: 0.3, density: 0.7, standardPortion: 150, description: '主食必备，能量来源' },
  { id: 11, name: '糖醋排骨', category: '肉类', caloriesPer100g: 285, protein: 16.8, carbohydrates: 15.2, fat: 19.5, density: 0.88, standardPortion: 100, description: '酸甜可口，排骨酥脆' },
  { id: 12, name: '酸辣土豆丝', category: '素菜', caloriesPer100g: 120, protein: 2.5, carbohydrates: 22.5, fat: 3.2, density: 0.7, standardPortion: 150, description: '开胃下饭，土豆丝脆爽' },
  { id: 13, name: '鱼香肉丝', category: '肉类', caloriesPer100g: 165, protein: 14.2, carbohydrates: 12.8, fat: 8.5, density: 0.82, standardPortion: 120, description: '四川风味，肉丝嫩滑' },
  { id: 14, name: '蒜蓉西兰花', category: '素菜', caloriesPer100g: 72, protein: 4.5, carbohydrates: 7.2, fat: 2.8, density: 0.65, standardPortion: 150, description: '抗癌蔬菜，营养丰富' },
  { id: 15, name: '可乐鸡翅', category: '肉类', caloriesPer100g: 245, protein: 17.2, carbohydrates: 10.5, fat: 16.8, density: 0.85, standardPortion: 120, description: '甜香可口，鸡翅嫩滑' },
  { id: 16, name: '凉拌黄瓜', category: '素菜', caloriesPer100g: 45, protein: 1.2, carbohydrates: 5.8, fat: 2.1, density: 0.55, standardPortion: 100, description: '清爽可口，夏日必备' },
  { id: 17, name: '红烧茄子', category: '素菜', caloriesPer100g: 98, protein: 3.2, carbohydrates: 12.5, fat: 4.8, density: 0.7, standardPortion: 150, description: '茄子软糯，酱香浓郁' },
  { id: 18, name: '清蒸鲈鱼', category: '水产', caloriesPer100g: 125, protein: 18.5, carbohydrates: 0, fat: 5.2, density: 0.8, standardPortion: 150, description: '清淡鲜嫩，保留原味' },
  { id: 19, name: '干锅花菜', category: '素菜', caloriesPer100g: 145, protein: 5.8, carbohydrates: 10.5, fat: 10.2, density: 0.68, standardPortion: 150, description: '香辣可口，花菜脆爽' },
  { id: 20, name: '蛋炒饭', category: '主食', caloriesPer100g: 186, protein: 6.5, carbohydrates: 22.5, fat: 8.8, density: 0.72, standardPortion: 200, description: '经典主食，蛋香饭粒分明' },
];

export const foodRecognitionService = new FoodRecognitionService();
export type { DishInfo, RecognitionResult, FoodRecognitionResult };
