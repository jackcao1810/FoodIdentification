import api from './api';
import { API_ENDPOINTS } from './endpoints';

export interface RecognitionRecord {
  id: string;
  imageUrl: string;
  dishes: RecognizedDish[];
  totalCalories?: number;
  confidenceScore?: number;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
}

export interface RecognizedDish {
  dishId: number;
  dishName: string;
  confidence: number;
  calories?: number;
  nutrients?: {
    protein: number;
    carbohydrates: number;
    fat: number;
  };
}

export interface UploadResponse {
  recordId: string;
  imageUrl: string;
}

export interface UploadParams {
  image: File;
}

export const recognitionService = {
  async upload(image: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', image);

    const response = await api.post<{
      success: boolean;
      data: UploadResponse;
    }>(API_ENDPOINTS.RECOGNITION.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  async getHistory(): Promise<RecognitionRecord[]> {
    const response = await api.get<{
      success: boolean;
      data: RecognitionRecord[];
    }>(API_ENDPOINTS.RECOGNITION.HISTORY);

    return response.data.data;
  },

  async getDetail(id: string): Promise<RecognitionRecord> {
    const response = await api.get<{
      success: boolean;
      data: RecognitionRecord;
    }>(API_ENDPOINTS.RECOGNITION.DETAIL(Number(id)));

    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/recognition/${id}`);
  },

  async analyze(recordId: string): Promise<{
    dishes: RecognizedDish[];
    totalCalories: number;
  }> {
    const response = await api.post<{
      success: boolean;
      data: {
        dishes: RecognizedDish[];
        totalCalories: number;
      };
    }>(API_ENDPOINTS.RECOGNITION.ANALYZE, { recordId });

    return response.data.data;
  },
};
