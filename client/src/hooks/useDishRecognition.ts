import { useState, useCallback } from 'react';
import { dishRecognitionService, type DishRecognitionResult } from '../services/dishRecognitionService';

export type RecognitionStatus = 'idle' | 'loading' | 'recognizing' | 'completed' | 'error';

interface UseDishRecognitionReturn {
  status: RecognitionStatus;
  result: DishRecognitionResult | null;
  error: string | null;
  processingProgress: number;
  recognize: (imageData: string | File) => Promise<DishRecognitionResult | null>;
  reset: () => void;
}

export const useDishRecognition = (): UseDishRecognitionReturn => {
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [result, setResult] = useState<DishRecognitionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);

  const recognize = useCallback(async (imageData: string | File): Promise<DishRecognitionResult | null> => {
    setStatus('loading');
    setError(null);
    setProcessingProgress(0);

    try {
      setProcessingProgress(30);

      await dishRecognitionService.loadModel();

      setStatus('recognizing');
      setProcessingProgress(60);

      const recognitionResult = await dishRecognitionService.recognize(imageData);

      setProcessingProgress(100);
      setResult(recognitionResult);
      setStatus('completed');

      return recognitionResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '识别失败，请重试';
      setError(errorMessage);
      setStatus('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
    setProcessingProgress(0);
  }, []);

  return {
    status,
    result,
    error,
    processingProgress,
    recognize,
    reset,
  };
};

export default useDishRecognition;
