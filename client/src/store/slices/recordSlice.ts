import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface MealRecord {
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

interface RecordState {
  mealRecords: MealRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: RecordState = {
  mealRecords: [],
  loading: false,
  error: null,
};

const recordSlice = createSlice({
  name: 'record',
  initialState,
  reducers: {
    setMealRecords: (state, action: PayloadAction<MealRecord[]>) => {
      state.mealRecords = action.payload;
    },
    addMealRecord: (state, action: PayloadAction<MealRecord>) => {
      state.mealRecords.unshift(action.payload);
    },
    updateMealRecord: (state, action: PayloadAction<MealRecord>) => {
      const index = state.mealRecords.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.mealRecords[index] = action.payload;
      }
    },
    deleteMealRecord: (state, action: PayloadAction<number>) => {
      state.mealRecords = state.mealRecords.filter(r => r.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setMealRecords,
  addMealRecord,
  updateMealRecord,
  deleteMealRecord,
  setLoading,
  setError,
} = recordSlice.actions;
export default recordSlice.reducer;
