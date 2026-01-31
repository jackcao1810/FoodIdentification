import React, { useState, useCallback } from 'react';
import { Slider, InputNumber, Tooltip } from 'antd';
import { InformationCircleIcon, ScaleIcon } from '@heroicons/react/24/outline';

export interface PortionSelectorProps {
  dishName: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  density?: number;
  standardPortion?: number;
  minPortion?: number;
  maxPortion?: number;
  onChange: (portionInGrams: number, nutrients: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  }) => void;
}

const PortionSelector: React.FC<PortionSelectorProps> = ({
  dishName,
  caloriesPer100g,
  proteinPer100g,
  carbsPer100g,
  fatPer100g,
  density = 0.8,
  standardPortion = 100,
  minPortion = 20,
  maxPortion = 600,
  onChange
}) => {
  const [portion, setPortion] = useState(standardPortion);

  const calculateNutrients = useCallback((grams: number) => {
    const multiplier = grams / 100;
    return {
      calories: Math.round(caloriesPer100g * multiplier),
      protein: parseFloat((proteinPer100g * multiplier).toFixed(1)),
      carbohydrates: parseFloat((carbsPer100g * multiplier).toFixed(1)),
      fat: parseFloat((fatPer100g * multiplier).toFixed(1))
    };
  }, [caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g]);

  const calculateEstimatedVolume = useCallback((grams: number, density: number) => {
    return Math.round(grams / density);
  }, []);

  const handlePortionChange = (value: number | null) => {
    const newPortion = value || standardPortion;
    setPortion(newPortion);
    onChange(newPortion, calculateNutrients(newPortion));
  };

  const handleSliderChange = (value: number) => {
    handlePortionChange(value);
  };

  const handleInputChange = (value: number | null) => {
    if (value !== null && value >= minPortion && value <= maxPortion) {
      handlePortionChange(value);
    }
  };

  const nutrients = calculateNutrients(portion);
  const portionMultiplier = portion / standardPortion;
  const estimatedVolume = calculateEstimatedVolume(portion, density);

  const getPortionLabel = () => {
    if (portionMultiplier < 0.5) return { text: '小份', color: 'bg-blue-100 text-blue-700' };
    if (portionMultiplier < 0.8) return { text: '偏少', color: 'bg-yellow-100 text-yellow-700' };
    if (portionMultiplier > 1.5) return { text: '大份', color: 'bg-red-100 text-red-700' };
    if (portionMultiplier > 1.2) return { text: '偏多', color: 'bg-orange-100 text-orange-700' };
    return { text: '适中', color: 'bg-green-100 text-green-700' };
  };

  const label = getPortionLabel();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScaleIcon className="w-4 h-4 text-primary-500" />
          <span className="font-medium text-surface-900">分量调整</span>
          <Tooltip title={`标准分量约 ${standardPortion}g，根据实际食用量调整`}>
            <InformationCircleIcon className="w-4 h-4 text-surface-400 cursor-help" />
          </Tooltip>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary-600">{portion}</span>
          <span className="text-surface-500 ml-1">g</span>
        </div>
      </div>

      <div className="px-2">
        <Slider
          min={minPortion}
          max={maxPortion}
          value={portion}
          onChange={handleSliderChange}
          marks={{
            [minPortion]: { label: `${minPortion}g` },
            [standardPortion]: { 
              label: (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs">标准</span>
                  <br />
                  <span className="text-xs">{standardPortion}g</span>
                </div>
              )
            },
            [maxPortion]: { label: `${maxPortion}g` }
          }}
          step={5}
          tooltip={{
            formatter: (value) => `${value}g`
          }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${label.color}`}>
            {label.text}
          </span>
          <span className="text-surface-500">
            约 {estimatedVolume} ml
          </span>
        </div>
        <div className="flex items-center gap-1">
          <InputNumber
            min={minPortion}
            max={maxPortion}
            value={portion}
            onChange={handleInputChange}
            className="!w-20"
            size="small"
          />
          <span className="text-surface-500">g</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-100">
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-surface-500">热量</span>
          </div>
          <div className="text-xl font-bold text-surface-900">
            {nutrients.calories}
            <span className="text-sm font-normal text-surface-500 ml-1">kcal</span>
          </div>
          <div className="text-xs text-surface-400 mt-1">
            {caloriesPer100g} kcal/100g
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center bg-surface-50 rounded-lg py-2">
            <div className="text-xs text-surface-400 mb-1">蛋白质</div>
            <div className="text-sm font-semibold text-primary-600">{nutrients.protein}g</div>
            <div className="text-xs text-surface-300">{proteinPer100g}g/100g</div>
          </div>
          <div className="text-center bg-surface-50 rounded-lg py-2">
            <div className="text-xs text-surface-400 mb-1">碳水</div>
            <div className="text-sm font-semibold text-accent-600">{nutrients.carbohydrates}g</div>
            <div className="text-xs text-surface-300">{carbsPer100g}g/100g</div>
          </div>
          <div className="text-center bg-surface-50 rounded-lg py-2">
            <div className="text-xs text-surface-400 mb-1">脂肪</div>
            <div className="text-sm font-semibold text-yellow-600">{nutrients.fat}g</div>
            <div className="text-xs text-surface-300">{fatPer100g}g/100g</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortionSelector;
