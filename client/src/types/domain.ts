export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  heightCm?: number;
  weightKg?: number;
  targetCalories: number;
}

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

export interface RecognitionResult {
  dishId: number;
  dishName: string;
  category: string;
  confidence: number;
  caloriesPer100g: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  density: number;
  standardPortion: number;
}

export interface FoodRecognitionResult {
  dishes: RecognitionResult[];
  totalCalories: number;
  totalWeight: number;
  processingTime: number;
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

export interface MealRecord {
  id: number;
  userId: number;
  recordType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mealTime: string;
  dishes: Array<{
    dishId: number;
    dishName: string;
    portion: number;
    calories: number;
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
  createdAt: string;
}

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

export interface Recommendation {
  id: number;
  type: 'daily' | 'weekly' | 'alert';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
