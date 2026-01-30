import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

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

export interface DishRecord {
  id: number;
  imageUrl: string;
  recognizedDishes: DishRecognitionResult[];
  totalCalories: number;
  confidenceScore: number;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
}

interface DishState {
  recognitionResult: DishRecognitionResult[] | null;
  history: DishRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: DishState = {
  recognitionResult: null,
  history: [],
  loading: false,
  error: null,
};

const dishSlice = createSlice({
  name: 'dish',
  initialState,
  reducers: {
    setRecognitionResult: (state, action: PayloadAction<DishRecognitionResult[]>) => {
      state.recognitionResult = action.payload;
    },
    addToHistory: (state, action: PayloadAction<DishRecord>) => {
      state.history.unshift(action.payload);
    },
    setHistory: (state, action: PayloadAction<DishRecord[]>) => {
      state.history = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearRecognitionResult: (state) => {
      state.recognitionResult = null;
    },
  },
});

export const {
  setRecognitionResult,
  addToHistory,
  setHistory,
  setLoading,
  setError,
  clearRecognitionResult,
} = dishSlice.actions;
export default dishSlice.reducer;
