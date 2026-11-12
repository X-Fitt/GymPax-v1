/**
 * Bodybuilding and gym calculation formulas:
 * 1RM calculations, Plate loading calculator, and unit conversions.
 */

export const KG_TO_LBS = 2.20462;

export function kgToLbs(kg: number): number {
  return Math.round(kg * KG_TO_LBS * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / KG_TO_LBS) * 10) / 10;
}

/**
 * Calculates Estimated 1 Rep Max (1RM) using Epley and Brzycki hybrid formula
 */
export function calculateOneRepMax(weight: number, reps: number): {
  oneRepMax: number;
  percentages: { percentage: number; repsEstimate: number; weight: number }[];
} {
  if (reps <= 0 || weight <= 0) {
    return { oneRepMax: 0, percentages: [] };
  }

  if (reps === 1) {
    const percentages = getPercentagesTable(weight);
    return { oneRepMax: Math.round(weight), percentages };
  }

  // Epley: w * (1 + r / 30)
  const epley = weight * (1 + reps / 30);
  // Brzycki: w * (36 / (37 - r))
  const brzycki = reps < 37 ? weight * (36 / (37 - reps)) : epley;

  const estimated1RM = Math.round((epley + brzycki) / 2);
  const percentages = getPercentagesTable(estimated1RM);

  return {
    oneRepMax: estimated1RM,
    percentages
  };
}

function getPercentagesTable(oneRepMax: number) {
  const steps = [
    { percentage: 95, repsEstimate: 2 },
    { percentage: 90, repsEstimate: 4 },
    { percentage: 85, repsEstimate: 6 },
    { percentage: 80, repsEstimate: 8 },
    { percentage: 75, repsEstimate: 10 },
    { percentage: 70, repsEstimate: 12 },
    { percentage: 65, repsEstimate: 15 }
  ];

  return steps.map(step => ({
    percentage: step.percentage,
    repsEstimate: step.repsEstimate,
    weight: Math.round((oneRepMax * step.percentage) / 100)
  }));
}

export interface PlateResult {
  plateWeight: number;
  countPerSide: number;
  color: string;
}

export interface BarbellPlateBreakdown {
  totalTargetWeight: number;
  barWeight: number;
  weightPerSide: number;
  unit: 'kg' | 'lbs';
  platesPerSide: PlateResult[];
  remainder: number;
}

/**
 * Calculates plate loading per side on Olympic barbell or custom clean barbell
 */
export function calculateBarbellPlates(
  targetWeight: number,
  unit: 'kg' | 'lbs' = 'kg',
  customBarWeight?: number
): BarbellPlateBreakdown {
  const defaultBarWeight = unit === 'kg' ? 20 : 45;
  const barWeight = typeof customBarWeight === 'number' && customBarWeight > 0
    ? customBarWeight
    : defaultBarWeight;

  if (targetWeight <= barWeight) {
    return {
      totalTargetWeight: targetWeight,
      barWeight,
      weightPerSide: 0,
      unit,
      platesPerSide: [],
      remainder: 0
    };
  }

  let weightToDistributePerSide = (targetWeight - barWeight) / 2;
  const initialPerSide = weightToDistributePerSide;

  // Standard gym plate inventory with IWF Olympic color codes
  const kgPlates = [
    { weight: 25, color: '#dc2626' }, // Red
    { weight: 20, color: '#2563eb' }, // Blue
    { weight: 15, color: '#ca8a04' }, // Yellow
    { weight: 10, color: '#16a34a' }, // Green
    { weight: 5, color: '#ffffff' },  // White
    { weight: 2.5, color: '#000000' }, // Black
    { weight: 1.25, color: '#9333ea' } // Purple micro
  ];

  const lbsPlates = [
    { weight: 45, color: '#2563eb' }, // Blue
    { weight: 35, color: '#ca8a04' }, // Yellow
    { weight: 25, color: '#16a34a' }, // Green
    { weight: 10, color: '#000000' }, // Black
    { weight: 5, color: '#ffffff' },  // White
    { weight: 2.5, color: '#9333ea' } // Purple micro
  ];

  const availablePlates = unit === 'kg' ? kgPlates : lbsPlates;
  const platesPerSide: PlateResult[] = [];

  for (const p of availablePlates) {
    if (weightToDistributePerSide >= p.weight) {
      const count = Math.floor(weightToDistributePerSide / p.weight);
      if (count > 0) {
        platesPerSide.push({
          plateWeight: p.weight,
          countPerSide: count,
          color: p.color
        });
        weightToDistributePerSide = Math.round((weightToDistributePerSide - count * p.weight) * 100) / 100;
      }
    }
  }

  return {
    totalTargetWeight: targetWeight,
    barWeight,
    weightPerSide: initialPerSide,
    unit,
    platesPerSide,
    remainder: weightToDistributePerSide
  };
}
