import api from './api';
import { API_ENDPOINTS } from './endpoints';

export interface DailySummary {
  date: string;
  totalCalories: number;
  targetCalories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  meals: Array<{
    type: string;
    calories: number;
  }>;
}

export interface TrendData {
  dates: string[];
  calories: number[];
  protein: number[];
  carbohydrates: number[];
  fat: number[];
}

export interface NutrientStats {
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

export const statisticsService = {
  async getOverview(): Promise<{
    todayCalories: number;
    weeklyAverage: number;
    streak: number;
    achievements: string[];
  }> {
    const response = await api.get(API_ENDPOINTS.STATISTICS.OVERVIEW);
    return response.data;
  },

  async getTrend(period: 'week' | 'month' = 'week'): Promise<TrendData> {
    const response = await api.get(API_ENDPOINTS.STATISTICS.TREND, { params: { period } });
    return response.data;
  },

  async getNutrients(period: 'week' | 'month' = 'week'): Promise<NutrientStats> {
    const response = await api.get(API_ENDPOINTS.STATISTICS.NUTRIENTS, { params: { period } });
    return response.data;
  },

  async getDailyStats(date?: string): Promise<DailySummary> {
    const response = await api.get(API_ENDPOINTS.STATISTICS.DAILY, { params: { date } });
    return response.data;
  },

  async getWeeklyStats(): Promise<DailySummary[]> {
    const response = await api.get(API_ENDPOINTS.STATISTICS.WEEKLY);
    return response.data;
  },

  async getMonthlyStats(): Promise<DailySummary[]> {
    const response = await api.get(API_ENDPOINTS.STATISTICS.MONTHLY);
    return response.data;
  },
};
