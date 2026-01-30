import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dishReducer from './slices/dishSlice';
import calorieReducer from './slices/calorieSlice';
import recordReducer from './slices/recordSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dish: dishReducer,
    calorie: calorieReducer,
    record: recordReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
