from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch
import torch.nn.functional as F
from typing import List, Dict, Optional
from database import get_all_dishes, get_dish_by_food101_class
import os


class FoodRecognition:
    DEFAULT_MODEL_NAME = "nateraw/food"
    LOCAL_MODEL_DIR = os.path.join(os.path.dirname(__file__), "models", "food")

    FOOD101_LABELS = [
        'apple_pie', 'baby_back_ribs', 'baklava', 'beef_carpaccio', 'beef_tartare',
        'beet_salad', 'beignets', 'bibimbap', 'bread_pudding', 'breakfast_burrito',
        'caesar_salad', 'cannoli', 'caprese_salad', 'carrot_cake', 'ceviche',
        'cheese_plate', 'cheesecake', 'chicken_curry', 'chicken_quesadilla', 'chicken_wings',
        'chocolate_cake', 'chocolate_mousse', 'churros', 'clam_chowder', 'club_sandwich',
        'crab_cakes', 'creme_brulee', 'croque_madame', 'cup_cakes', 'deviled_eggs',
        'donuts', 'dumplings', 'edamame', 'eggs_benedict', 'escargots',
        'falafel', 'filet_mignon', 'fish_and_chips', 'foie_gras', 'french_fries',
        'french_onion_soup', 'french_toast', 'fried_calamari', 'fried_rice', 'frozen_yogurt',
        'garlic_bread', 'gnocchi', 'greek_salad', 'grilled_cheese_sandwich', 'grilled_salmon',
        'guacamole', 'gyoza', 'hamburger', 'hot_and_sour_soup', 'hot_dog',
        'huevos_rancheros', 'hummus', 'ice_cream', 'lasagna', 'lobster_bisque',
        'lobster_roll_sandwich', 'macaroni_and_cheese', 'macarons', 'miso_soup', 'mussels',
        'nachos', 'omelette', 'onion_rings', 'oysters', 'pad_thai',
        'paella', 'pancakes', 'panna_cotta', 'peking_duck', 'pho',
        'pizza', 'pork_chop', 'poutine', 'prime_rib', 'pulled_pork_sandwich',
        'ramen', 'ravioli', 'red_velvet_cake', 'risotto', 'samosa',
        'sashimi', 'scallops', 'seaweed_salad', 'shrimp_and_grits', 'spaghetti_bolognese',
        'spaghetti_carbonara', 'spring_rolls', 'steak', 'strawberry_shortcake', 'sushi',
        'tacos', 'takoyaki', 'tiramisu', 'tuna_tartare', 'waffles'
    ]

    CHINESE_NAME_MAP = {
        'apple_pie': '苹果派', 'baby_back_ribs': '烤肋排', 'baklava': '巴克拉瓦',
        'beef_carpaccio': '生牛肉片', 'beef_tartare': '牛肉塔塔', 'beet_salad': '甜菜沙拉',
        'beignets': '炸面团', 'bibimbap': '石锅拌饭', 'bread_pudding': '面包布丁',
        'breakfast_burrito': '早餐卷饼', 'caesar_salad': '凯撒沙拉', 'cannoli': '奶油甜卷',
        'caprese_salad': '番茄马苏里拉沙拉', 'carrot_cake': '胡萝卜蛋糕', 'ceviche': '酸橘汁腌鱼',
        'cheese_plate': '奶酪拼盘', 'cheesecake': '芝士蛋糕', 'chicken_curry': '咖喱鸡',
        'chicken_quesadilla': '鸡肉墨西哥饼', 'chicken_wings': '鸡翅', 'chocolate_cake': '巧克力蛋糕',
        'chocolate_mousse': '巧克力慕斯', 'churros': '西班牙油条', 'clam_chowder': '蛤蜊浓汤',
        'club_sandwich': '总汇三明治', 'crab_cakes': '蟹饼', 'creme_brulee': '焦糖布丁',
        'croque_madame': '法式火腿奶酪三明治', 'cup_cakes': '纸杯蛋糕', 'deviled_eggs': '魔鬼蛋',
        'donuts': '甜甜圈', 'dumplings': '饺子', 'edamame': '毛豆', 'eggs_benedict': '班尼迪克蛋',
        'escargots': '焗蜗牛', 'falafel': '沙拉三明治', 'filet_mignon': '菲力牛排',
        'fish_and_chips': '炸鱼薯条', 'foie_gras': '鹅肝', 'french_fries': '薯条',
        'french_onion_soup': '法式洋葱汤', 'french_toast': '法式吐司', 'fried_calamari': '炸鱿鱼圈',
        'fried_rice': '炒饭', 'frozen_yogurt': '冻酸奶', 'garlic_bread': '蒜香面包',
        'gnocchi': '意式土豆团', 'greek_salad': '希腊沙拉', 'grilled_cheese_sandwich': '烤奶酪三明治',
        'grilled_salmon': '烤三文鱼', 'guacamole': '牛油果酱', 'gyoza': '日式饺子',
        'hamburger': '汉堡', 'hot_and_sour_soup': '酸辣汤', 'hot_dog': '热狗',
        'huevos_rancheros': '牧场蛋', 'hummus': '鹰嘴豆泥', 'ice_cream': '冰淇淋',
        'lasagna': '千层面', 'lobster_bisque': '龙虾浓汤', 'lobster_roll_sandwich': '龙虾卷',
        'macaroni_and_cheese': '通心粉奶酪', 'macarons': '马卡龙', 'miso_soup': '味增汤',
        'mussels': '青口贝', 'nachos': '玉米片', 'omelette': '煎蛋卷', 'onion_rings': '洋葱圈',
        'oysters': '生蚝', 'pad_thai': '泰式炒河粉', 'paella': '西班牙海鲜饭', 'pancakes': '松饼',
        'panna_cotta': '意式奶冻', 'peking_duck': '北京烤鸭', 'pho': '越南河粉',
        'pizza': '披萨', 'pork_chop': '猪排', 'poutine': '肉汁奶酪薯条', 'prime_rib': '西冷牛排',
        'pulled_pork_sandwich': '手撕猪肉三明治', 'ramen': '拉面', 'ravioli': '意大利饺子',
        'red_velvet_cake': '红丝绒蛋糕', 'risotto': '意大利烩饭', 'samosa': '印度三角饼',
        'sashimi': '刺身', 'scallops': '扇贝', 'seaweed_salad': '海藻沙拉',
        'shrimp_and_grits': '虾仁玉米糊', 'spaghetti_bolognese': '肉酱意面',
        'spaghetti_carbonara': '奶油培根意面', 'spring_rolls': '春卷', 'steak': '牛排',
        'strawberry_shortcake': '草莓蛋糕', 'sushi': '寿司', 'tacos': '塔可',
        'takoyaki': '章鱼烧', 'tiramisu': '提拉米苏', 'tuna_tartare': '金枪鱼塔塔',
        'waffles': '华夫饼'
    }

    def __init__(self):
        self.processor = None
        self.model = None
        self._model_loaded = False
        self._dishes_cache = None

    def _get_local_model_path(self, model_name: str) -> str:
        """获取本地模型路径"""
        model_cache_name = model_name.replace("/", "_")
        return os.path.join(self.LOCAL_MODEL_DIR, model_cache_name)

    def _is_model_cached(self, model_name: str) -> bool:
        """检查模型是否已缓存到本地"""
        local_path = self._get_local_model_path(model_name)
        required_files = ["config.json", "pytorch_model.bin", "preprocessor_config.json"]
        return all(os.path.exists(os.path.join(local_path, f)) for f in required_files)

    def _download_model(self, model_name: str) -> str:
        """下载模型到本地"""
        local_path = self._get_local_model_path(model_name)
        os.makedirs(local_path, exist_ok=True)

        print(f"正在下载模型: {model_name}")
        print(f"保存路径: {local_path}")

        try:
            processor = AutoImageProcessor.from_pretrained(model_name)
            model = AutoModelForImageClassification.from_pretrained(model_name)

            print(f"正在保存模型到本地...")
            processor.save_pretrained(local_path)
            model.save_pretrained(local_path)
            print("模型保存完成")

            return local_path
        except Exception as e:
            print(f"下载模型失败: {e}")
            raise e

    def load_model(self, model_name: str = None):
        """加载预训练模型，优先使用本地缓存"""
        if self._model_loaded:
            return

        model_name = model_name or self.DEFAULT_MODEL_NAME
        print(f"正在加载模型: {model_name}")

        local_path = self._get_local_model_path(model_name)
        if self._is_model_cached(model_name):
            print(f"发现本地缓存模型: {local_path}")
            print("正在从本地加载...")
            self.processor = AutoImageProcessor.from_pretrained(local_path)
            self.model = AutoModelForImageClassification.from_pretrained(local_path)
        else:
            print("本地未找到模型，正在从 Hugging Face 下载...")
            self._download_model(model_name)
            print("正在从本地加载...")
            self.processor = AutoImageProcessor.from_pretrained(local_path)
            self.model = AutoModelForImageClassification.from_pretrained(local_path)

        self.model.eval()
        self._model_loaded = True
        print("模型加载完成")

    def load_model_from_local(self, local_path: str):
        """从指定本地路径加载模型"""
        if self._model_loaded:
            return

        print(f"正在从本地路径加载模型: {local_path}")
        self.processor = AutoImageProcessor.from_pretrained(local_path)
        self.model = AutoModelForImageClassification.from_pretrained(local_path)
        self.model.eval()
        self._model_loaded = True
        print("模型加载完成")

    def _get_dishes_cache(self) -> List[Dict]:
        """获取菜品缓存"""
        if self._dishes_cache is None:
            self._dishes_cache = get_all_dishes()
        return self._dishes_cache

    def _find_best_match_dish(self, model_label: str, model_idx: int = None) -> Optional[Dict]:
        """根据模型标签匹配菜品数据库"""
        normalized_label = model_label.lower().replace(" ", "_")
        dishes = self._get_dishes_cache()

        dish_info = get_dish_by_food101_class(normalized_label)
        if dish_info:
            return dish_info

        for dish in dishes:
            food101_class = dish.get("food101_class") or dish.get("food101Class")
            if food101_class and food101_class.lower() == normalized_label:
                return dish
            if dish["name"].lower() in normalized_label or normalized_label in dish["name"].lower():
                return dish

        chinese_name = self.CHINESE_NAME_MAP.get(normalized_label)
        if chinese_name:
            for dish in dishes:
                if chinese_name in dish["name"] or dish["name"] in chinese_name:
                    return dish

        if model_idx is not None:
            for dish in dishes:
                if dish.get("food101_index") == model_idx:
                    return dish
            if 1 <= model_idx <= len(dishes):
                return dishes[model_idx - 1]

        return None

    def _create_unknown_dish(self, label: str, confidence: float, index: int = 0) -> Dict:
        """创建未知菜品对象"""
        return {
            "dishId": 1000 + index,
            "dishName": self.CHINESE_NAME_MAP.get(label, label.replace("_", " ")),
            "category": "未知",
            "confidence": float(confidence),
            "caloriesPer100g": 150,
            "protein": 10,
            "carbohydrates": 15,
            "fat": 8,
            "density": 0.8,
            "standardPortion": 100
        }

    def recognize(self, image_path: str, topk: int = 5) -> Dict:
        """识别图片并返回结果"""
        import time
        start_time = time.time()

        if not self._model_loaded:
            self.load_model()

        image = Image.open(image_path).convert("RGB")
        inputs = self.processor(images=image, return_tensors="pt")

        with torch.no_grad():
            outputs = self.model(**inputs)

        logits = outputs.logits
        probabilities = F.softmax(logits, dim=-1)

        topk_probs, topk_indices = torch.topk(probabilities, min(topk, len(probabilities[0])))

        dishes = []
        unknown_dishes = []
        for i in range(len(topk_probs[0])):
            idx = topk_indices[0][i].item()
            prob = topk_probs[0][i].item()
            label = self.model.config.id2label.get(idx, "unknown")

            if prob < 0.5:
                continue

            dish_info = self._find_best_match_dish(label, idx)

            if dish_info:
                dishes.append({
                    "dishId": dish_info["id"],
                    "dishName": dish_info["name"],
                    "category": dish_info["category"],
                    "confidence": float(prob),
                    "caloriesPer100g": dish_info["calories_per_100g"],
                    "protein": dish_info["protein"],
                    "carbohydrates": dish_info["carbohydrates"],
                    "fat": dish_info["fat"],
                    "density": dish_info["density"],
                    "standardPortion": dish_info["standard_portion"]
                })
            else:
                unknown_dishes.append(self._create_unknown_dish(label, prob, len(dishes)))

        dishes.extend(unknown_dishes[:3 - len(dishes)])

        dishes.sort(key=lambda x: x["confidence"], reverse=True)

        return {
            "dishes": dishes,
            "totalCalories": round(sum(d["caloriesPer100g"] * d["standardPortion"] / 100 for d in dishes)),
            "totalWeight": sum(d["standardPortion"] for d in dishes),
            "processingTime": int((time.time() - start_time) * 1000)
        }

    def recognize_from_image(self, image: Image.Image, topk: int = 5) -> Dict:
        """从 PIL Image 对象识别"""
        import time
        start_time = time.time()

        if not self._model_loaded:
            self.load_model()

        inputs = self.processor(images=image, return_tensors="pt")

        with torch.no_grad():
            outputs = self.model(**inputs)

        logits = outputs.logits
        probabilities = F.softmax(logits, dim=-1)

        topk_probs, topk_indices = torch.topk(probabilities, min(topk, len(probabilities[0])))

        dishes = []
        unknown_dishes = []
        for i in range(len(topk_probs[0])):
            idx = topk_indices[0][i].item()
            prob = topk_probs[0][i].item()
            label = self.model.config.id2label.get(idx, "unknown")

            if prob < 0.5:
                continue

            dish_info = self._find_best_match_dish(label, idx)

            if dish_info:
                dishes.append({
                    "dishId": dish_info["id"],
                    "dishName": dish_info["name"],
                    "category": dish_info["category"],
                    "confidence": float(prob),
                    "caloriesPer100g": dish_info["calories_per_100g"],
                    "protein": dish_info["protein"],
                    "carbohydrates": dish_info["carbohydrates"],
                    "fat": dish_info["fat"],
                    "density": dish_info["density"],
                    "standardPortion": dish_info["standard_portion"]
                })
            else:
                unknown_dishes.append(self._create_unknown_dish(label, prob, len(dishes)))

        dishes.extend(unknown_dishes[:3 - len(dishes)])

        dishes.sort(key=lambda x: x["confidence"], reverse=True)

        return {
            "dishes": dishes,
            "totalCalories": round(sum(d["caloriesPer100g"] * d["standardPortion"] / 100 for d in dishes)),
            "totalWeight": sum(d["standardPortion"] for d in dishes),
            "processingTime": int((time.time() - start_time) * 1000)
        }


recognizer = FoodRecognition()


def get_recognizer() -> FoodRecognition:
    """获取全局识别器实例"""
    if not recognizer._model_loaded:
        recognizer.load_model()
    return recognizer
