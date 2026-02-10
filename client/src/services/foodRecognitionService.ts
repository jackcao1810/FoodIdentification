import api from './api';
import type { DishInfo, RecognitionResult, FoodRecognitionResult } from '../types/domain';

class FoodRecognitionService {
  async recognize(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<FoodRecognitionResult> {
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法获取 canvas 上下文');
    }
    ctx.drawImage(imageElement, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9);
    });

    if (!blob) {
      throw new Error('图片转换失败');
    }

    const formData = new FormData();
    formData.append('image', blob, 'image.jpg');

    const response = await api.post('/recognition/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.error?.message || '识别失败');
    }

    return response.data.data;
  }

  calculateCalories(dishId: number, weightInGrams: number): number {
    const dish = this.getDishById(dishId);
    if (!dish) return 0;
    return Math.round(dish.caloriesPer100g * weightInGrams / 100);
  }

  calculateNutrients(dishId: number, weightInGrams: number) {
    const dish = this.getDishById(dishId);
    if (!dish) return null;
    return {
      calories: Math.round(dish.caloriesPer100g * weightInGrams / 100),
      protein: parseFloat((dish.protein * weightInGrams / 100).toFixed(1)),
      carbohydrates: parseFloat((dish.carbohydrates * weightInGrams / 100).toFixed(1)),
      fat: parseFloat((dish.fat * weightInGrams / 100).toFixed(1))
    };
  }

  getDishById(id: number): DishInfo | undefined {
    return FOOD_DATABASE.find(dish => dish.id === id);
  }

  getAllDishes(): DishInfo[] {
    return FOOD_DATABASE;
  }

  searchDishes(query: string): DishInfo[] {
    const lowerQuery = query.toLowerCase();
    return FOOD_DATABASE.filter(dish =>
      dish.name.toLowerCase().includes(lowerQuery) ||
      dish.category.toLowerCase().includes(lowerQuery)
    );
  }
}

const FOOD_DATABASE: DishInfo[] = [
  { id: 1, name: '苹果派', category: '甜点', caloriesPer100g: 237, protein: 2.1, carbohydrates: 31.4, fat: 11.3, density: 0.75, standardPortion: 100, description: '酥皮包裹苹果肉桂馅料烤制' },
  { id: 2, name: '烤肋排', category: '肉类', caloriesPer100g: 295, protein: 22.5, carbohydrates: 13.2, fat: 16.8, density: 0.82, standardPortion: 150, description: '蜜汁烤猪肋排' },
  { id: 3, name: '巴克拉瓦', category: '甜点', caloriesPer100g: 533, protein: 10.2, carbohydrates: 53.6, fat: 32.3, density: 0.68, standardPortion: 50, description: '多层酥皮配坚果糖浆' },
  { id: 4, name: '生牛肉片', category: '肉类', caloriesPer100g: 159, protein: 20.5, carbohydrates: 1.2, fat: 8.1, density: 0.88, standardPortion: 80, description: '薄切生牛肉配奶酪' },
  { id: 5, name: '牛肉塔塔', category: '肉类', caloriesPer100g: 180, protein: 18.2, carbohydrates: 4.5, fat: 9.8, density: 0.85, standardPortion: 100, description: '生牛肉碎配蛋黄和酸黄瓜' },
  { id: 6, name: '甜菜沙拉', category: '素菜', caloriesPer100g: 143, protein: 3.5, carbohydrates: 12.8, fat: 8.5, density: 0.72, standardPortion: 150, description: '烤甜菜配芝麻菜和山羊奶酪' },
  { id: 7, name: '炸面团', category: '甜点', caloriesPer100g: 269, protein: 5.8, carbohydrates: 36.2, fat: 11.5, density: 0.70, standardPortion: 80, description: '法式方形炸面团配糖粉' },
  { id: 8, name: '石锅拌饭', category: '主食', caloriesPer100g: 189, protein: 6.2, carbohydrates: 28.5, fat: 6.2, density: 0.78, standardPortion: 400, description: '韩式石锅米饭配蔬菜和煎蛋' },
  { id: 9, name: '面包布丁', category: '甜点', caloriesPer100g: 184, protein: 5.2, carbohydrates: 26.8, fat: 6.5, density: 0.75, standardPortion: 120, description: '面包浸泡蛋奶烤制' },
  { id: 10, name: '早餐卷饼', category: '早餐', caloriesPer100g: 245, protein: 12.5, carbohydrates: 18.2, fat: 13.5, density: 0.80, standardPortion: 200, description: '墨西哥饼包蛋、培根和牛油果' },
  { id: 11, name: '凯撒沙拉', category: '素菜', caloriesPer100g: 190, protein: 6.2, carbohydrates: 8.5, fat: 14.8, density: 0.68, standardPortion: 150, description: '罗马生菜、面包丁、帕玛森奶酪、凯撒酱' },
  { id: 12, name: '奶油甜卷', category: '甜点', caloriesPer100g: 253, protein: 4.5, carbohydrates: 32.5, fat: 12.2, density: 0.65, standardPortion: 80, description: '意大利奶油馅料酥皮卷' },
  { id: 13, name: '番茄马苏里拉沙拉', category: '素菜', caloriesPer100g: 198, protein: 9.8, carbohydrates: 6.2, fat: 14.5, density: 0.72, standardPortion: 150, description: '新鲜番茄、马苏里拉、罗勒' },
  { id: 14, name: '胡萝卜蛋糕', category: '甜点', caloriesPer100g: 352, protein: 3.8, carbohydrates: 48.5, fat: 16.8, density: 0.70, standardPortion: 100, description: '胡萝卜蛋糕配奶油奶酪糖霜' },
  { id: 15, name: '酸橘汁腌鱼', category: '海鲜', caloriesPer100g: 126, protein: 20.5, carbohydrates: 5.2, fat: 2.8, density: 0.82, standardPortion: 100, description: '柠檬汁腌生鱼片' },
  { id: 16, name: '奶酪拼盘', category: '奶酪', caloriesPer100g: 342, protein: 18.5, carbohydrates: 6.2, fat: 26.8, density: 0.75, standardPortion: 100, description: '多种奶酪拼盘配水果和坚果' },
  { id: 17, name: '芝士蛋糕', category: '甜点', caloriesPer100g: 321, protein: 5.5, carbohydrates: 26.8, fat: 21.8, density: 0.72, standardPortion: 100, description: '奶油奶酪蛋糕底' },
  { id: 18, name: '咖喱鸡', category: '肉类', caloriesPer100g: 175, protein: 18.2, carbohydrates: 8.5, fat: 7.8, density: 0.80, standardPortion: 250, description: '印度咖喱配鸡肉' },
  { id: 19, name: '鸡肉墨西哥饼', category: '肉类', caloriesPer100g: 285, protein: 22.5, carbohydrates: 25.8, fat: 10.2, density: 0.78, standardPortion: 150, description: '玉米饼包鸡肉和奶酪' },
  { id: 20, name: '鸡翅', category: '肉类', caloriesPer100g: 326, protein: 24.5, carbohydrates: 8.5, fat: 21.2, density: 0.75, standardPortion: 100, description: '烤或炸鸡翅' },
  { id: 21, name: '巧克力蛋糕', category: '甜点', caloriesPer100g: 389, protein: 5.2, carbohydrates: 52.5, fat: 18.2, density: 0.72, standardPortion: 100, description: '巧克力海绵蛋糕' },
  { id: 22, name: '巧克力慕斯', category: '甜点', caloriesPer100g: 289, protein: 4.5, carbohydrates: 28.5, fat: 18.2, density: 0.68, standardPortion: 100, description: '轻盈巧克力奶油' },
  { id: 23, name: '西班牙油条', category: '甜点', caloriesPer100g: 436, protein: 6.2, carbohydrates: 48.5, fat: 23.2, density: 0.65, standardPortion: 80, description: '肉桂糖裹炸面团' },
  { id: 24, name: '蛤蜊浓汤', category: '汤', caloriesPer100g: 153, protein: 7.5, carbohydrates: 12.5, fat: 8.2, density: 0.85, standardPortion: 250, description: '奶油蛤蜊土豆汤' },
  { id: 25, name: '总汇三明治', category: '三明治', caloriesPer100g: 285, protein: 18.2, carbohydrates: 22.5, fat: 13.5, density: 0.78, standardPortion: 200, description: '多层三明治配鸡肉、培根和生菜' },
  { id: 26, name: '蟹饼', category: '海鲜', caloriesPer100g: 215, protein: 18.5, carbohydrates: 12.8, fat: 9.8, density: 0.80, standardPortion: 100, description: '蟹肉饼配面包糠' },
  { id: 27, name: '焦糖布丁', category: '甜点', caloriesPer100g: 265, protein: 5.2, carbohydrates: 28.5, fat: 14.2, density: 0.72, standardPortion: 100, description: '烤蛋奶焦糖布丁' },
  { id: 28, name: '法式火腿奶酪三明治', category: '三明治', caloriesPer100g: 328, protein: 16.2, carbohydrates: 25.5, fat: 18.5, density: 0.75, standardPortion: 150, description: '火腿奶酪吐司' },
  { id: 29, name: '纸杯蛋糕', category: '甜点', caloriesPer100g: 305, protein: 3.5, carbohydrates: 38.5, fat: 15.2, density: 0.68, standardPortion: 60, description: '小蛋糕配奶油糖霜' },
  { id: 30, name: '魔鬼蛋', category: '蛋类', caloriesPer100g: 135, protein: 9.8, carbohydrates: 2.5, fat: 9.8, density: 0.78, standardPortion: 50, description: '蛋黄酱填料水煮蛋' },
  { id: 31, name: '甜甜圈', category: '甜点', caloriesPer100g: 452, protein: 4.5, carbohydrates: 51.5, fat: 25.2, density: 0.65, standardPortion: 60, description: '油炸环形甜面圈' },
  { id: 32, name: '饺子', category: '主食', caloriesPer100g: 220, protein: 8.2, carbohydrates: 28.5, fat: 8.5, density: 0.72, standardPortion: 120, description: '蒸或煎的肉或蔬菜馅面食' },
  { id: 33, name: '毛豆', category: '素菜', caloriesPer100g: 121, protein: 11.2, carbohydrates: 10.2, fat: 5.2, density: 0.82, standardPortion: 100, description: '盐水煮毛豆' },
  { id: 34, name: '班尼迪克蛋', category: '早餐', caloriesPer100g: 265, protein: 12.5, carbohydrates: 18.2, fat: 15.8, density: 0.75, standardPortion: 200, description: '水煮蛋配英式玛芬和荷兰酱' },
  { id: 35, name: '焗蜗牛', category: '肉类', caloriesPer100g: 189, protein: 12.5, carbohydrates: 5.2, fat: 12.8, density: 0.78, standardPortion: 80, description: '蒜香黄油焗蜗牛' },
  { id: 36, name: '沙拉三明治', category: '素菜', caloriesPer100g: 333, protein: 10.2, carbohydrates: 32.5, fat: 18.5, density: 0.72, standardPortion: 150, description: '鹰嘴豆炸丸子配 tahini 酱' },
  { id: 37, name: '菲力牛排', category: '肉类', caloriesPer100g: 272, protein: 25.5, carbohydrates: 0, fat: 18.2, density: 0.85, standardPortion: 150, description: '嫩煎牛里脊' },
  { id: 38, name: '炸鱼薯条', category: '海鲜', caloriesPer100g: 228, protein: 15.2, carbohydrates: 18.5, fat: 10.2, density: 0.78, standardPortion: 250, description: '炸鱼片配薯条' },
  { id: 39, name: '鹅肝', category: '肉类', caloriesPer100g: 328, protein: 9.5, carbohydrates: 5.2, fat: 30.2, density: 0.72, standardPortion: 80, description: '煎鹅肝配果酱' },
  { id: 40, name: '薯条', category: '配菜', caloriesPer100g: 312, protein: 3.5, carbohydrates: 41.2, fat: 15.2, density: 0.68, standardPortion: 150, description: '炸土豆条' },
  { id: 41, name: '法式洋葱汤', category: '汤', caloriesPer100g: 182, protein: 8.2, carbohydrates: 16.5, fat: 8.5, density: 0.82, standardPortion: 300, description: '洋葱牛肉汤配奶酪面包' },
  { id: 42, name: '法式吐司', category: '早餐', caloriesPer100g: 263, protein: 8.5, carbohydrates: 28.5, fat: 12.8, density: 0.72, standardPortion: 120, description: '蛋奶浸泡吐司' },
  { id: 43, name: '炸鱿鱼圈', category: '海鲜', caloriesPer100g: 206, protein: 18.5, carbohydrates: 15.2, fat: 8.2, density: 0.75, standardPortion: 100, description: '炸鱿鱼圈配柠檬' },
  { id: 44, name: '炒饭', category: '主食', caloriesPer100g: 186, protein: 5.8, carbohydrates: 26.5, fat: 6.8, density: 0.72, standardPortion: 200, description: '中式蛋炒饭' },
  { id: 45, name: '冻酸奶', category: '甜点', caloriesPer100g: 127, protein: 4.5, carbohydrates: 18.5, fat: 3.5, density: 0.68, standardPortion: 150, description: '冷冻酸奶配配料' },
  { id: 46, name: '蒜香面包', category: '配菜', caloriesPer100g: 328, protein: 7.2, carbohydrates: 35.5, fat: 16.5, density: 0.65, standardPortion: 80, description: '黄油蒜蓉面包' },
  { id: 47, name: '土豆团子', category: '主食', caloriesPer100g: 157, protein: 5.2, carbohydrates: 22.5, fat: 5.2, density: 0.75, standardPortion: 200, description: '意大利土豆团子配酱汁' },
  { id: 48, name: '希腊沙拉', category: '素菜', caloriesPer100g: 142, protein: 5.2, carbohydrates: 8.5, fat: 9.8, density: 0.72, standardPortion: 200, description: '黄瓜、番茄、橄榄、羊奶酪' },
  { id: 49, name: '烤奶酪三明治', category: '三明治', caloriesPer100g: 285, protein: 12.5, carbohydrates: 25.5, fat: 14.8, density: 0.72, standardPortion: 150, description: '融化的奶酪三明治' },
  { id: 50, name: '烤三文鱼', category: '海鲜', caloriesPer100g: 208, protein: 22.5, carbohydrates: 0, fat: 12.2, density: 0.82, standardPortion: 150, description: '柠檬草烤三文鱼' },
  { id: 51, name: '牛油果酱', category: '配菜', caloriesPer100g: 150, protein: 2.1, carbohydrates: 9.8, fat: 12.5, density: 0.78, standardPortion: 100, description: '鳄梨酱配玉米片' },
  { id: 52, name: '日式饺子', category: '主食', caloriesPer100g: 215, protein: 8.5, carbohydrates: 25.5, fat: 9.2, density: 0.72, standardPortion: 100, description: '煎饺子配肉或蔬菜馅' },
  { id: 53, name: '汉堡', category: '三明治', caloriesPer100g: 295, protein: 17.5, carbohydrates: 24.5, fat: 14.2, density: 0.78, standardPortion: 250, description: '牛肉饼配生菜番茄奶酪' },
  { id: 54, name: '酸辣汤', category: '汤', caloriesPer100g: 58, protein: 2.5, carbohydrates: 6.5, fat: 2.2, density: 0.88, standardPortion: 250, description: '中国酸辣汤' },
  { id: 55, name: '热狗', category: '三明治', caloriesPer100g: 290, protein: 11.2, carbohydrates: 24.5, fat: 16.5, density: 0.72, standardPortion: 120, description: '香肠配面包和调料' },
  { id: 56, name: '牧场蛋', category: '早餐', caloriesPer100g: 186, protein: 12.5, carbohydrates: 8.5, fat: 11.2, density: 0.78, standardPortion: 200, description: '墨西哥辣味鸡蛋' },
  { id: 57, name: '鹰嘴豆泥', category: '配菜', caloriesPer100g: 177, protein: 7.8, carbohydrates: 18.5, fat: 9.2, density: 0.75, standardPortion: 100, description: '鹰嘴豆泥配皮塔饼' },
  { id: 58, name: '冰淇淋', category: '甜点', caloriesPer100g: 207, protein: 3.5, carbohydrates: 24.5, fat: 10.8, density: 0.65, standardPortion: 100, description: '奶油冰淇淋' },
  { id: 59, name: '千层面', category: '主食', caloriesPer100g: 135, protein: 8.5, carbohydrates: 12.5, fat: 6.2, density: 0.82, standardPortion: 300, description: '意大利肉酱千层面' },
  { id: 60, name: '龙虾浓汤', category: '汤', caloriesPer100g: 195, protein: 8.5, carbohydrates: 8.5, fat: 12.8, density: 0.82, standardPortion: 250, description: '奶油龙虾汤' },
  { id: 61, name: '龙虾卷', category: '三明治', caloriesPer100g: 245, protein: 15.2, carbohydrates: 22.5, fat: 10.2, density: 0.75, standardPortion: 150, description: '龙虾肉配蛋黄酱卷饼' },
  { id: 62, name: '通心粉奶酪', category: '主食', caloriesPer100g: 198, protein: 7.2, carbohydrates: 25.5, fat: 7.8, density: 0.75, standardPortion: 250, description: '通心粉配奶酪酱' },
  { id: 63, name: '马卡龙', category: '甜点', caloriesPer100g: 396, protein: 8.2, carbohydrates: 48.5, fat: 19.8, density: 0.55, standardPortion: 30, description: '杏仁蛋白饼夹奶油馅' },
  { id: 64, name: '味增汤', category: '汤', caloriesPer100g: 40, protein: 3.5, carbohydrates: 4.5, fat: 1.2, density: 0.92, standardPortion: 250, description: '日本味增豆腐汤' },
  { id: 65, name: '青口贝', category: '海鲜', caloriesPer100g: 86, protein: 11.5, carbohydrates: 3.5, fat: 2.2, density: 0.85, standardPortion: 150, description: '蒸或煮青口贝' },
  { id: 66, name: '玉米片', category: '小吃', caloriesPer100g: 306, protein: 8.5, carbohydrates: 32.5, fat: 15.2, density: 0.65, standardPortion: 150, description: '玉米片配奶酪酱和配料' },
  { id: 67, name: '煎蛋卷', category: '蛋类', caloriesPer100g: 154, protein: 10.5, carbohydrates: 2.5, fat: 11.5, density: 0.78, standardPortion: 100, description: '法式煎蛋卷' },
  { id: 68, name: '洋葱圈', category: '配菜', caloriesPer100g: 333, protein: 5.5, carbohydrates: 35.5, fat: 18.5, density: 0.62, standardPortion: 100, description: '炸洋葱圈' },
  { id: 69, name: '生蚝', category: '海鲜', caloriesPer100g: 68, protein: 7.5, carbohydrates: 4.2, fat: 2.5, density: 0.88, standardPortion: 100, description: '新鲜生蚝配柠檬' },
  { id: 70, name: '泰式炒河粉', category: '主食', caloriesPer100g: 175, protein: 12.5, carbohydrates: 18.5, fat: 6.2, density: 0.75, standardPortion: 250, description: '泰式炒河粉配虾和花生' },
  { id: 71, name: '西班牙海鲜饭', category: '主食', caloriesPer100g: 165, protein: 9.5, carbohydrates: 18.5, fat: 5.5, density: 0.80, standardPortion: 300, description: '西班牙海鲜饭配海鲜' },
  { id: 72, name: '松饼', category: '早餐', caloriesPer100g: 227, protein: 5.5, carbohydrates: 32.5, fat: 8.5, density: 0.68, standardPortion: 150, description: '美式松饼配枫糖浆' },
  { id: 73, name: '意式奶冻', category: '甜点', caloriesPer100g: 228, protein: 4.5, carbohydrates: 22.5, fat: 13.5, density: 0.70, standardPortion: 100, description: '吉利丁奶油甜点' },
  { id: 74, name: '北京烤鸭', category: '肉类', caloriesPer100g: 265, protein: 25.5, carbohydrates: 8.5, fat: 15.2, density: 0.75, standardPortion: 200, description: '传统北京烤鸭配薄饼和葱丝' },
  { id: 75, name: '越南河粉', category: '主食', caloriesPer100g: 215, protein: 15.2, carbohydrates: 22.5, fat: 5.5, density: 0.78, standardPortion: 500, description: '越南牛肉粉配香草' },
  { id: 76, name: '披萨', category: '主食', caloriesPer100g: 266, protein: 11.2, carbohydrates: 33.5, fat: 10.2, density: 0.72, standardPortion: 200, description: '意大利番茄奶酪饼' },
  { id: 77, name: '猪排', category: '肉类', caloriesPer100g: 231, protein: 24.5, carbohydrates: 0, fat: 14.2, density: 0.82, standardPortion: 150, description: '煎或烤猪排' },
  { id: 78, name: '肉汁奶酪薯条', category: '主食', caloriesPer100g: 156, protein: 6.5, carbohydrates: 18.5, fat: 6.2, density: 0.78, standardPortion: 300, description: '薯条配奶酪凝乳和肉汁' },
  { id: 79, name: '西冷牛排', category: '肉类', caloriesPer100g: 272, protein: 24.5, carbohydrates: 0, fat: 18.2, density: 0.85, standardPortion: 150, description: '煎西冷牛排' },
  { id: 80, name: '手撕猪肉三明治', category: '三明治', caloriesPer100g: 245, protein: 18.5, carbohydrates: 22.5, fat: 9.8, density: 0.78, standardPortion: 200, description: '慢烤手撕猪肉配卷饼' },
  { id: 81, name: '拉面', category: '主食', caloriesPer100g: 190, protein: 9.5, carbohydrates: 22.5, fat: 6.2, density: 0.80, standardPortion: 600, description: '日本豚骨拉面' },
  { id: 82, name: '意大利饺子', category: '主食', caloriesPer100g: 205, protein: 9.2, carbohydrates: 28.5, fat: 6.5, density: 0.75, standardPortion: 200, description: '馅料饺子配番茄酱' },
  { id: 83, name: '红丝绒蛋糕', category: '甜点', caloriesPer100g: 378, protein: 4.2, carbohydrates: 52.5, fat: 17.5, density: 0.70, standardPortion: 100, description: '红丝绒蛋糕配奶油奶酪糖霜' },
  { id: 84, name: '意大利烩饭', category: '主食', caloriesPer100g: 195, protein: 5.5, carbohydrates: 25.5, fat: 8.2, density: 0.75, standardPortion: 250, description: '奶油蘑菇烩饭' },
  { id: 85, name: '印度三角饼', category: '小吃', caloriesPer100g: 230, protein: 6.5, carbohydrates: 28.5, fat: 11.2, density: 0.68, standardPortion: 100, description: '咖喱馅油炸三角饼' },
  { id: 86, name: '刺身', category: '海鲜', caloriesPer100g: 145, protein: 22.5, carbohydrates: 0, fat: 5.2, density: 0.88, standardPortion: 100, description: '新鲜生鱼片' },
  { id: 87, name: '扇贝', category: '海鲜', caloriesPer100g: 88, protein: 15.5, carbohydrates: 2.5, fat: 1.8, density: 0.85, standardPortion: 100, description: '煎或蒸扇贝' },
  { id: 88, name: '海藻沙拉', category: '素菜', caloriesPer100g: 45, protein: 2.5, carbohydrates: 8.5, fat: 0.5, density: 0.82, standardPortion: 150, description: '海藻蔬菜沙拉' },
  { id: 89, name: '虾仁玉米糊', category: '主食', caloriesPer100g: 165, protein: 12.5, carbohydrates: 15.5, fat: 6.2, density: 0.78, standardPortion: 250, description: '美国南部虾仁配玉米糊' },
  { id: 90, name: '肉酱意面', category: '主食', caloriesPer100g: 131, protein: 6.5, carbohydrates: 18.5, fat: 3.8, density: 0.80, standardPortion: 250, description: '番茄肉酱意大利面' },
  { id: 91, name: '奶油培根意面', category: '主食', caloriesPer100g: 190, protein: 8.2, carbohydrates: 22.5, fat: 7.8, density: 0.75, standardPortion: 250, description: '培根蛋黄酱意大利面' },
  { id: 92, name: '春卷', category: '小吃', caloriesPer100g: 225, protein: 5.5, carbohydrates: 28.5, fat: 10.5, density: 0.65, standardPortion: 100, description: '蔬菜或肉馅春卷' },
  { id: 93, name: '牛排', category: '肉类', caloriesPer100g: 271, protein: 26.5, carbohydrates: 0, fat: 17.5, density: 0.85, standardPortion: 200, description: '煎牛排配蔬菜' },
  { id: 94, name: '草莓蛋糕', category: '甜点', caloriesPer100g: 198, protein: 3.5, carbohydrates: 28.5, fat: 8.2, density: 0.72, standardPortion: 120, description: '海绵蛋糕配草莓和奶油' },
  { id: 95, name: '寿司', category: '主食', caloriesPer100g: 150, protein: 5.5, carbohydrates: 22.5, fat: 3.5, density: 0.75, standardPortion: 200, description: '日本寿司卷配生鱼和蔬菜' },
  { id: 96, name: '塔可', category: '主食', caloriesPer100g: 226, protein: 9.5, carbohydrates: 18.5, fat: 11.5, density: 0.72, standardPortion: 150, description: '墨西哥玉米饼配肉和配料' },
  { id: 97, name: '章鱼烧', category: '小吃', caloriesPer100g: 195, protein: 10.5, carbohydrates: 18.5, fat: 8.5, density: 0.68, standardPortion: 150, description: '日本章鱼小丸子' },
  { id: 98, name: '提拉米苏', category: '甜点', caloriesPer100g: 285, protein: 5.5, carbohydrates: 28.5, fat: 16.5, density: 0.68, standardPortion: 100, description: '意大利咖啡手指饼干甜点' },
  { id: 99, name: '金枪鱼塔塔', category: '海鲜', caloriesPer100g: 145, protein: 20.5, carbohydrates: 5.5, fat: 5.2, density: 0.82, standardPortion: 100, description: '生金枪鱼配酱汁' },
  { id: 100, name: '华夫饼', category: '早餐', caloriesPer100g: 291, protein: 7.5, carbohydrates: 38.5, fat: 12.5, density: 0.62, standardPortion: 150, description: '比利时华夫饼配水果和奶油' },
];

export const foodRecognitionService = new FoodRecognitionService();
export type { DishInfo, RecognitionResult, FoodRecognitionResult };
