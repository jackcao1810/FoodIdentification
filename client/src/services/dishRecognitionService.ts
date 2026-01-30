import { recognitionService, type RecognizedDish } from './recognitionService';

export interface DishRecognitionResult {
  dishes: RecognizedDish[];
  totalCalories: number;
  processingTime: number;
}

export interface DishInfo {
  id: number;
  name: string;
  category: string;
  caloriesPer100g: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

const DISH_DATABASE: DishInfo[] = [
  { id: 1, name: '宫保鸡丁', category: '肉类', caloriesPer100g: 198, protein: 16.2, carbohydrates: 8.4, fat: 12.1 },
  { id: 2, name: '红烧肉', category: '肉类', caloriesPer100g: 320, protein: 14.5, carbohydrates: 4.2, fat: 28.1 },
  { id: 3, name: '糖醋里脊', category: '肉类', caloriesPer100g: 245, protein: 18.3, carbohydrates: 12.5, fat: 14.2 },
  { id: 4, name: '番茄炒蛋', category: '素菜', caloriesPer100g: 156, protein: 9.8, carbohydrates: 8.6, fat: 10.5 },
  { id: 5, name: '麻婆豆腐', category: '豆制品', caloriesPer100g: 186, protein: 12.5, carbohydrates: 5.8, fat: 13.2 },
  { id: 6, name: '回锅肉', category: '肉类', caloriesPer100g: 298, protein: 15.8, carbohydrates: 3.5, fat: 25.6 },
  { id: 7, name: '水煮鱼', category: '水产', caloriesPer100g: 215, protein: 18.5, carbohydrates: 5.2, fat: 14.3 },
  { id: 8, name: '蒸蛋', category: '蛋类', caloriesPer100g: 138, protein: 11.2, carbohydrates: 2.4, fat: 9.8 },
  { id: 9, name: '炒青菜', category: '素菜', caloriesPer100g: 65, protein: 3.5, carbohydrates: 6.8, fat: 3.2 },
  { id: 10, name: '米饭', category: '主食', caloriesPer100g: 116, protein: 2.6, carbohydrates: 25.6, fat: 0.3 },
  { id: 11, name: '糖醋排骨', category: '肉类', caloriesPer100g: 285, protein: 16.8, carbohydrates: 15.2, fat: 19.5 },
  { id: 12, name: '酸辣土豆丝', category: '素菜', caloriesPer100g: 120, protein: 2.5, carbohydrates: 22.5, fat: 3.2 },
  { id: 13, name: '鱼香肉丝', category: '肉类', caloriesPer100g: 165, protein: 14.2, carbohydrates: 12.8, fat: 8.5 },
  { id: 14, name: '蒜蓉西兰花', category: '素菜', caloriesPer100g: 72, protein: 4.5, carbohydrates: 7.2, fat: 2.8 },
  { id: 15, name: '可乐鸡翅', category: '肉类', caloriesPer100g: 245, protein: 17.2, carbohydrates: 10.5, fat: 16.8 },
  { id: 16, name: '凉拌黄瓜', category: '素菜', caloriesPer100g: 45, protein: 1.2, carbohydrates: 5.8, fat: 2.1 },
  { id: 17, name: '红烧茄子', category: '素菜', caloriesPer100g: 98, protein: 3.2, carbohydrates: 12.5, fat: 4.8 },
  { id: 18, name: '清蒸鲈鱼', category: '水产', caloriesPer100g: 125, protein: 18.5, carbohydrates: 0, fat: 5.2 },
  { id: 19, name: '干锅花菜', category: '素菜', caloriesPer100g: 145, protein: 5.8, carbohydrates: 10.5, fat: 10.2 },
  { id: 20, name: '蛋炒饭', category: '主食', caloriesPer100g: 186, protein: 6.5, carbohydrates: 22.5, fat: 8.8 },
];

export const dishRecognitionService = {
  async recognize(imageData: string | File): Promise<DishRecognitionResult> {
    const startTime = Date.now();

    await new Promise(resolve => setTimeout(resolve, 1500));

    const recognizedDishes = mockRecognize(imageData);
    const totalCalories = recognizedDishes.reduce((sum, dish) => {
      return sum + (dish.nutrients ? dish.nutrients.protein * 4 + dish.nutrients.carbohydrates * 4 + dish.nutrients.fat * 9 : 0);
    }, 0);

    const processingTime = Date.now() - startTime;

    return {
      dishes: recognizedDishes,
      totalCalories: Math.round(totalCalories),
      processingTime,
    };
  },

  async loadModel(): Promise<void> {
    console.log('菜品识别模型加载中...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('菜品识别模型加载完成');
  },

  getDishInfo(dishId: number): DishInfo | undefined {
    return DISH_DATABASE.find(dish => dish.id === dishId);
  },

  getAllDishes(): DishInfo[] {
    return DISH_DATABASE;
  },

  searchDishes(query: string): DishInfo[] {
    const lowerQuery = query.toLowerCase();
    return DISH_DATABASE.filter(dish =>
      dish.name.toLowerCase().includes(lowerQuery) ||
      dish.category.toLowerCase().includes(lowerQuery)
    );
  },
};

function mockRecognize(imageData: string | File): RecognizedDish[] {
  const shuffled = [...DISH_DATABASE].sort(() => Math.random() - 0.5);
  const topDishes = shuffled.slice(0, 3);

  return topDishes.map((dish, index) => ({
    dishId: dish.id,
    dishName: dish.name,
    confidence: 0.95 - index * 0.15,
    calories: dish.caloriesPer100g,
    nutrients: {
      protein: dish.protein,
      carbohydrates: dish.carbohydrates,
      fat: dish.fat,
    },
  }));
}

export type { DishInfo };
