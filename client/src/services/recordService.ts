import api from './api';
import { API_ENDPOINTS } from './endpoints';

export interface MealRecord {
  id: string;
  userId: number;
  recordType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mealTime: string;
  dishes: MealDish[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MealDish {
  dishId: number;
  dishName: string;
  portion?: number;
  confidence?: number;
  calories?: number;
  nutrients?: {
    protein: number;
    carbohydrates: number;
    fat: number;
  };
}

export interface CreateRecordParams {
  recordType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mealTime?: string;
  dishes: MealDish[];
  notes?: string;
}

export interface UpdateRecordParams {
  recordType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mealTime?: string;
  dishes?: MealDish[];
  notes?: string;
}

export const recordService = {
  async getRecords(params?: {
    page?: number;
    limit?: number;
    date?: string;
  }): Promise<{
    data: MealRecord[];
    total: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.date) queryParams.set('date', params.date);

    const query = queryParams.toString();
    const url = `${API_ENDPOINTS.RECORDS.LIST}${query ? `?${query}` : ''}`;

    const response = await api.get<{
      success: boolean;
      data: MealRecord[];
    }>(url);

    return {
      data: response.data.data,
      total: response.data.data.length,
    };
  },

  async getDetail(id: string): Promise<MealRecord> {
    const response = await api.get<{
      success: boolean;
      data: MealRecord;
    }>(API_ENDPOINTS.RECORDS.DETAIL(id));

    return response.data.data;
  },

  async create(data: CreateRecordParams): Promise<MealRecord> {
    const response = await api.post<{
      success: boolean;
      data: MealRecord;
    }>(API_ENDPOINTS.RECORDS.LIST, data);

    return response.data.data;
  },

  async update(id: string, data: UpdateRecordParams): Promise<void> {
    await api.put(API_ENDOINTS.RECORDS.DETAIL(id), data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.RECORDS.DETAIL(id));
  },

  async getByDate(date: string): Promise<MealRecord[]> {
    const response = await api.get<{
      success: boolean;
      data: MealRecord[];
    }>(API_ENDPOINTS.RECORDS.BY_DATE(date));

    return response.data.data;
  },
};
