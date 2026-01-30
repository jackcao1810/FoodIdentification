import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface NutrientInfo {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

interface CalorieState {
  todayCalories: number;
  targetCalories: number;
  nutrients: NutrientInfo;
  recentMeals: Array<{
    id: number;
    type: string;
    calories: number;
    time: string;
  }>;
  loading: boolean;
}

const initialState: CalorieState = {
  todayCalories: 0,
  targetCalories: 2000,
  nutrients: { protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 },
  recentMeals: [],
  loading: false,
};

const calorieSlice = createSlice({
  name: 'calorie',
  initialState,
  reducers: {
    setTodayCalories: (state, action: PayloadAction<number>) => {
      state.todayCalories = action.payload;
    },
    setTargetCalories: (state, action: PayloadAction<number>) => {
      state.targetCalories = action.payload;
    },
    setNutrients: (state, action: PayloadAction<NutrientInfo>) => {
      state.nutrients = action.payload;
    },
    addMeal: (state, action: PayloadAction<{ type: string; calories: number }>) => {
      state.recentMeals.unshift({
        id: Date.now(),
        type: action.payload.type,
        calories: action.payload.calories,
        time: new Date().toISOString(),
      });
    },
    setRecentMeals: (state, action: PayloadAction<CalorieState['recentMeals']>) => {
      state.recentMeals = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setTodayCalories,
  setTargetCalories,
  setNutrients,
  addMeal,
  setRecentMeals,
  setLoading,
} = calorieSlice.actions;
export default calorieSlice.reducer;
