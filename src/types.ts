/**
 * Definiciones globales de tipos e interfaces para MAXFORM
 */

export interface MacroNutrients {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

export interface MealEntry {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  timestamp: string;
  source?: 'MAX_AI' | 'MANUAL' | 'RECIPE';
}

export type CommitmentLevel = 'Básico' | 'Intermedio' | 'Avanzado' | 'Extremo';

export interface LevelConfig {
  name: CommitmentLevel;
  barGradient: string;
  barColor: string;
  glowColor: string;
  textColor: string;
  badgeClass: string;
  description: string;
}
