import api from './api';
import type { DishInfo, RecognitionResult, FoodRecognitionResult } from '../types/domain';

let FOOD_DATABASE_CACHE: DishInfo[] | null = null;

async function getDishesFromAPI(): Promise<DishInfo[]> {
  if (FOOD_DATABASE_CACHE) {
    return FOOD_DATABASE_CACHE;
  }

  try {
    const response = await api.get('/dishes');
    if (response.data.success) {
      const dishes = response.data.data.map((dish: any) => ({
        id: dish.id,
        name: dish.name,
        category: dish.category,
        caloriesPer100g: dish.calories_per_100g,
        protein: dish.protein,
        carbohydrates: dish.carbohydrates,
        fat: dish.fat,
        density: dish.density,
        standardPortion: dish.standard_portion,
        description: dish.description
      }));
      FOOD_DATABASE_CACHE = dishes;
      return dishes;
    }
  } catch (error) {
    console.error('获取菜品列表失败:', error);
  }

  return [];
}

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
    const dish = this.getDishByIdSync(dishId);
    if (!dish) return 0;
    return Math.round(dish.caloriesPer100g * weightInGrams / 100);
  }

  calculateNutrients(dishId: number, weightInGrams: number) {
    const dish = this.getDishByIdSync(dishId);
    if (!dish) return null;
    return {
      calories: Math.round(dish.caloriesPer100g * weightInGrams / 100),
      protein: parseFloat((dish.protein * weightInGrams / 100).toFixed(1)),
      carbohydrates: parseFloat((dish.carbohydrates * weightInGrams / 100).toFixed(1)),
      fat: parseFloat((dish.fat * weightInGrams / 100).toFixed(1))
    };
  }

  async getDishById(id: number): Promise<DishInfo | undefined> {
    const dishes = await getDishesFromAPI();
    return dishes.find(dish => dish.id === id);
  }

  getDishByIdSync(id: number): DishInfo | undefined {
    return FOOD_DATABASE_CACHE?.find(dish => dish.id === id);
  }

  async getAllDishes(): Promise<DishInfo[]> {
    return getDishesFromAPI();
  }

  async searchDishes(query: string): Promise<DishInfo[]> {
    const dishes = await getDishesFromAPI();
    const lowerQuery = query.toLowerCase();
    return dishes.filter(dish =>
      dish.name.toLowerCase().includes(lowerQuery) ||
      dish.category.toLowerCase().includes(lowerQuery)
    );
  }
}

export const foodRecognitionService = new FoodRecognitionService();
export type { DishInfo, RecognitionResult, FoodRecognitionResult };
