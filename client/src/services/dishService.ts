import api from './api';
import { API_ENDPOINTS } from './endpoints';

export interface Dish {
  id: number;
  name: string;
  category: string;
  description?: string;
  imageUrl?: string;
  caloriesPer100g: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sodium: number;
  isActive: boolean;
}

export interface DishRecognitionResult {
  dishId: number;
  dishName: string;
  confidence: number;
  calories: number;
  nutrients: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const dishService = {
  async getDishes(): Promise<Dish[]> {
    const response = await api.get<Dish[]>(API_ENDPOINTS.DISHES.LIST);
    return response.data;
  },

  async getDishById(id: number): Promise<Dish> {
    const response = await api.get<Dish>(API_ENDPOINTS.DISHES.DETAIL(id));
    return response.data;
  },

  async searchDishes(query: string): Promise<Dish[]> {
    const response = await api.get<Dish[]>(API_ENDPOINTS.DISHES.SEARCH, { params: { q: query } });
    return response.data;
  },

  async getCategories(): Promise<string[]> {
    const response = await api.get<string[]>(API_ENDPOINTS.DISHES.CATEGORIES);
    return response.data;
  },

  async uploadForRecognition(file: File): Promise<{ recordId: number; imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post<{ recordId: number; imageUrl: string }>(
      API_ENDPOINTS.RECOGNITION.UPLOAD,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async getRecognitionResult(recordId: number): Promise<DishRecognitionResult[]> {
    const response = await api.get<DishRecognitionResult[]>(API_ENDPOINTS.RECOGNITION.DETAIL(recordId));
    return response.data;
  },

  async getRecognitionHistory(): Promise<Array<{
    id: number;
    imageUrl: string;
    dishes: DishRecognitionResult[];
    totalCalories: number;
    createdAt: string;
  }>> {
    const response = await api.get(API_ENDPOINTS.RECOGNITION.HISTORY);
    return response.data;
  },
};
