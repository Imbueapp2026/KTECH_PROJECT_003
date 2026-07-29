export interface CalculateGoldPriceParams {
  goldPricePerGram: number;
  purityCarats: 24 | 22 | 18 | 14 | 9;
  weightGrams: number;
  makingCharge: number;
  makingChargeType: 'percent' | 'flat';
}

export function calculateGoldPrice({
  goldPricePerGram,
  purityCarats,
  weightGrams,
  makingCharge,
  makingChargeType,
}: CalculateGoldPriceParams): number {
  const purityFactor = {
    24: 1.0,
    22: 0.9167,
    18: 0.75,
    14: 0.5833,
    9: 0.375,
  }[purityCarats];

  const goldValue = goldPricePerGram * weightGrams * purityFactor;
  const charge = makingChargeType === 'percent' 
    ? goldValue * (makingCharge / 100) 
    : makingCharge;
  
  return Math.round(goldValue + charge);
}

export const PURITY_OPTIONS = [
  { value: 24, label: '24K' },
  { value: 22, label: '22K' },
  { value: 18, label: '18K' },
  { value: 14, label: '14K' },
  { value: 9, label: '9K' },
] as const;

export const MAKING_CHARGE_TYPES = [
  { value: 'percent', label: 'Percent of gold value' },
  { value: 'flat', label: 'Flat amount (₹)' },
] as const;
