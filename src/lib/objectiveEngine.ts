import { MacroNutrients } from '../types';
import { DailyTaskItem } from '../components/DailyTasks';
import { DEFAULT_XP_CONFIG } from './gamification';

export interface OnboardingProfileInput {
  name: string;
  primary_goal: string;
  experience_level: 'Básico' | 'Intermedio' | 'Avanzado' | 'Extremo';
  age: number;
  height: number; // cm
  weight: number; // kg
  activity_level?: 'Sedentario' | 'Ligero' | 'Moderado' | 'Muy activo';
  training_frequency: '0' | '1–2' | '3–4' | '5–6' | '7';
  training_type: string[];
  dietary_preferences: string;
  foods_to_avoid?: string;
  supplements: Array<{
    name: string;
    serving?: string;
    frequency?: string;
    preferred_time?: string;
  }>;
}

export interface GeneratedUserPlan {
  dailyObjectives: DailyTaskItem[];
  macros: MacroNutrients;
  hydrationTargetLiters: number;
  proteinTargetGrams: number;
  calorieTarget: number;
}

/**
 * Generador determinista de objetivos diarios y nutrición de MAXFORM
 * Crea metas personalizadas y calibradas sin inventar datos ni usar IA no determinista.
 */
export function generatePersonalizedObjectives(input: OnboardingProfileInput): GeneratedUserPlan {
  const {
    primary_goal,
    experience_level,
    weight,
    height,
    age,
    training_frequency,
    training_type = [],
    dietary_preferences,
    supplements = [],
  } = input;

  const safeWeight = Math.max(40, Math.min(220, weight || 70));
  const safeHeight = Math.max(120, Math.min(230, height || 170));
  const safeAge = Math.max(14, Math.min(95, age || 25));

  // 1. Cálculo de Hidratación según Nivel de Exigencia
  let baseHydration = (safeWeight * 35) / 1000;
  if (experience_level === 'Básico') {
    baseHydration = Math.min(2.3, Math.max(2.0, (safeWeight * 30) / 1000));
  } else if (experience_level === 'Intermedio') {
    baseHydration = Math.min(3.0, Math.max(2.7, (safeWeight * 36) / 1000));
  } else if (experience_level === 'Avanzado') {
    baseHydration = Math.min(3.5, Math.max(3.2, (safeWeight * 42) / 1000));
  } else if (experience_level === 'Extremo') {
    baseHydration = Math.min(4.0, Math.max(3.6, (safeWeight * 48) / 1000));
  }
  const hydrationTarget = Number(baseHydration.toFixed(1));

  // 2. Cálculo de Proteína según Nivel de Exigencia
  let proteinFactor = 1.6;
  if (experience_level === 'Básico') {
    proteinFactor = primary_goal === 'Ganar masa muscular' ? 1.4 : 1.3;
  } else if (experience_level === 'Intermedio') {
    proteinFactor = primary_goal === 'Ganar masa muscular' ? 1.8 : 1.6;
  } else if (experience_level === 'Avanzado') {
    proteinFactor = primary_goal === 'Ganar masa muscular' ? 2.0 : 1.9;
  } else if (experience_level === 'Extremo') {
    proteinFactor = primary_goal === 'Ganar masa muscular' ? 2.3 : 2.2;
  }
  const proteinGrams = Math.round(safeWeight * proteinFactor);

  // 3. Estimación de TMB y Calorías (Mifflin-St Jeor)
  const bmr = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge + 5;
  let activityMultiplier = 1.35;
  if (experience_level === 'Básico') activityMultiplier = 1.25;
  else if (experience_level === 'Intermedio') activityMultiplier = 1.45;
  else if (experience_level === 'Avanzado') activityMultiplier = 1.65;
  else if (experience_level === 'Extremo') activityMultiplier = 1.8;

  const tdee = Math.round(bmr * activityMultiplier);
  let targetCalories = tdee;
  if (primary_goal === 'Ganar masa muscular') {
    targetCalories = tdee + (experience_level === 'Extremo' ? 380 : 260);
  } else if (primary_goal === 'Perder grasa') {
    targetCalories = Math.max(1400, tdee - (experience_level === 'Extremo' ? 480 : 350));
  }

  const fatsGrams = Math.round((safeWeight * (experience_level === 'Extremo' ? 0.9 : 0.8)));
  const caloriesFromProteinAndFat = proteinGrams * 4 + fatsGrams * 9;
  const remainingCaloriesForCarbs = Math.max(200, targetCalories - caloriesFromProteinAndFat);
  const carbsGrams = Math.round(remainingCaloriesForCarbs / 4);

  const calculatedMacros: MacroNutrients = {
    protein: proteinGrams,
    carbs: carbsGrams,
    fats: fatsGrams,
    calories: targetCalories,
  };

  // 4. Generación determinista de Objetivos Diarios (DailyTaskItem) según Nivel
  const objectives: DailyTaskItem[] = [];

  // TAREA 1: ENTRENAMIENTO / ACTIVIDAD ADAPTADA AL NIVEL
  if (experience_level === 'Básico') {
    objectives.push({
      id: 'entrenamiento',
      title: 'Caminata Activa o Movilidad (25 min)',
      subtitle: 'Ritmo ligero y sin sobreesfuerzo',
      detail: 'Crea el hábito de movimiento diario sin sobrecargar articulaciones.',
      xpReward: DEFAULT_XP_CONFIG.training,
      completed: false,
      icon: 'directions_walk',
      accentColor: '#10B981',
    });
  } else if (experience_level === 'Intermedio') {
    objectives.push({
      id: 'entrenamiento',
      title: 'Sesión Estructurada (45-50 min)',
      subtitle: 'Fuerza, cardio o funcional planificado',
      detail: 'Cumplir los bloques de trabajo con descansos medidos y buena técnica.',
      xpReward: DEFAULT_XP_CONFIG.training,
      completed: false,
      icon: 'fitness_center',
      accentColor: '#3B82F6',
    });
  } else if (experience_level === 'Avanzado') {
    objectives.push({
      id: 'entrenamiento',
      title: 'Entreno de Alto Rendimiento (60 min)',
      subtitle: 'Sobrecarga progresiva y RPE 8-9',
      detail: 'Monitorea series efectivas cerca del fallo muscular o potencia aeróbica.',
      xpReward: DEFAULT_XP_CONFIG.training + 5,
      completed: false,
      icon: 'bolt',
      accentColor: '#8B5CF6',
    });
  } else {
    // Extremo
    objectives.push({
      id: 'entrenamiento',
      title: 'Entrenamiento Élite · Máxima Intensidad',
      subtitle: '75+ min o sesión planificada de alta carga',
      detail: 'Tolerancia cero a descansos excesivos. Estímulo máximo neuromuscular.',
      xpReward: DEFAULT_XP_CONFIG.training + 10,
      completed: false,
      icon: 'local_fire_department',
      accentColor: '#EF4444',
    });
  }

  // TAREA 2: NUTRICIÓN Y PROTEÍNA
  const dietLabel = dietary_preferences ? ` (${dietary_preferences})` : '';
  objectives.push({
    id: 'nutricion',
    title: `Consumir ${proteinGrams}g de Proteína${dietLabel}`,
    subtitle: experience_level === 'Extremo' 
      ? 'Pesado estricto al gramo (Tolerancia cero)'
      : experience_level === 'Avanzado'
      ? 'Fuentes de alto valor biológico (Leucina mTOR)'
      : 'Distribución balanceada a lo largo del día',
    detail: `Objetivo nutricional calibrado a tu nivel ${experience_level}.`,
    xpReward: DEFAULT_XP_CONFIG.protein,
    completed: false,
    icon: 'egg_alt',
    accentColor: experience_level === 'Extremo' ? '#EF4444' : experience_level === 'Avanzado' ? '#8B5CF6' : experience_level === 'Intermedio' ? '#3B82F6' : '#10B981',
  });

  // TAREA 3: HIDRATACIÓN
  objectives.push({
    id: 'agua',
    title: `Hidratación (${hydrationTarget}L)`,
    subtitle: experience_level === 'Extremo' 
      ? 'Aporte de electrolitos y sales post-esfuerzo'
      : 'Consumo constante a lo largo de la jornada',
    detail: 'Mantiene el volumen plasmático, excreción renal y rendimiento celular.',
    xpReward: DEFAULT_XP_CONFIG.hydration,
    completed: false,
    icon: 'water_drop',
    accentColor: '#06B6D4',
  });

  // TAREA 4: INTERMEDIO, AVANZADO Y EXTREMO (Movilidad o suplementación)
  if (experience_level !== 'Básico') {
    if (supplements.length > 0 || experience_level === 'Avanzado' || experience_level === 'Extremo') {
      const suppName = supplements.length > 0 ? supplements.map(s => s.name).join(' + ') : 'Creatina (5g) / Proteína';
      objectives.push({
        id: 'suplemento',
        title: `Protocolo de Suplementación (${suppName})`,
        subtitle: 'Tomas cronometradas según tu ventana metabólica',
        detail: 'Mantiene la saturación de fosfocreatina y soporte inmunológico.',
        xpReward: DEFAULT_XP_CONFIG.supplement,
        completed: false,
        icon: 'medication',
        accentColor: '#8B5CF6',
      });
    } else {
      objectives.push({
        id: 'movilidad',
        title: 'Pausa de Movilidad & Recuperación (15 min)',
        subtitle: 'Estiramiento dinámico o descompresión',
        detail: 'Reducción de rigidez articular y estimulación del retorno venoso.',
        xpReward: DEFAULT_XP_CONFIG.supplement,
        completed: false,
        icon: 'self_improvement',
        accentColor: '#10B981',
      });
    }
  }

  // TAREA 5: AVANZADO Y EXTREMO (Descanso e Higiene del Sueño)
  if (experience_level === 'Avanzado' || experience_level === 'Extremo') {
    objectives.push({
      id: 'sueno',
      title: 'Higiene del Sueño & Descanso (7.5 - 8h)',
      subtitle: 'Habitación oscura y sin pantallas 30 min antes',
      detail: 'Clave para la liberación de GH y regeneración del sistema nervioso central.',
      xpReward: DEFAULT_XP_CONFIG.sleep,
      completed: false,
      icon: 'bedtime',
      accentColor: '#EC4899',
    });
  }

  // TAREA 6: EXTREMO (Tolerancia cero: Cierre y registro riguroso)
  if (experience_level === 'Extremo') {
    objectives.push({
      id: 'cierre_elite',
      title: 'Registro y Auditoría Total de la Jornada',
      subtitle: 'Cero estimaciones; control exacto antes de las 23:00',
      detail: 'El atleta de élite evalúa su jornada y deja lista la planificación de mañana.',
      xpReward: 20,
      completed: false,
      icon: 'verified',
      accentColor: '#F59E0B',
    });
  }

  return {
    dailyObjectives: objectives,
    macros: calculatedMacros,
    hydrationTargetLiters: hydrationTarget,
    proteinTargetGrams: proteinGrams,
    calorieTarget: targetCalories,
  };
}
