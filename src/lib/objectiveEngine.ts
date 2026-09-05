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

  // 1. Cálculo de Hidratación Basal
  // ~35 ml por kg de peso corporal
  const rawHydration = (safeWeight * 35) / 1000;
  const hydrationTarget = Number(Math.max(2.0, Math.min(3.8, rawHydration)).toFixed(1));

  // 2. Cálculo de Proteína
  let proteinFactor = 1.6;
  if (primary_goal === 'Ganar masa muscular') {
    proteinFactor = experience_level === 'Avanzado' || experience_level === 'Extremo' ? 2.0 : 1.8;
  } else if (primary_goal === 'Perder grasa') {
    proteinFactor = 2.0; // Preservación muscular en déficit
  } else if (primary_goal === 'Mejorar mi rendimiento') {
    proteinFactor = 1.8;
  } else {
    proteinFactor = 1.5;
  }
  const proteinGrams = Math.round(safeWeight * proteinFactor);

  // 3. Estimación de TMB y Calorías (Mifflin-St Jeor)
  const bmr = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge + 5;
  let activityMultiplier = 1.35;
  if (training_frequency === '0') activityMultiplier = 1.2;
  else if (training_frequency === '1–2') activityMultiplier = 1.35;
  else if (training_frequency === '3–4') activityMultiplier = 1.5;
  else if (training_frequency === '5–6' || training_frequency === '7') activityMultiplier = 1.65;

  const tdee = Math.round(bmr * activityMultiplier);
  let targetCalories = tdee;
  if (primary_goal === 'Ganar masa muscular') {
    targetCalories = tdee + 280; // Superávit moderado
  } else if (primary_goal === 'Perder grasa') {
    targetCalories = Math.max(1400, tdee - 400); // Déficit controlado
  }

  const fatsGrams = Math.round((safeWeight * 0.85));
  const caloriesFromProteinAndFat = proteinGrams * 4 + fatsGrams * 9;
  const remainingCaloriesForCarbs = Math.max(200, targetCalories - caloriesFromProteinAndFat);
  const carbsGrams = Math.round(remainingCaloriesForCarbs / 4);

  const calculatedMacros: MacroNutrients = {
    protein: proteinGrams,
    carbs: carbsGrams,
    fats: fatsGrams,
    calories: targetCalories,
  };

  // 4. Generación determinista de Objetivos Diarios (DailyTaskItem)
  const objectives: DailyTaskItem[] = [];

  // OBJETIVO 1: ENTRENAMIENTO / ACTIVIDAD FÍSICA
  if (training_frequency === '0') {
    objectives.push({
      id: 'entrenamiento',
      title: 'Caminata Activa & Movilidad',
      subtitle: '25-30 min a paso ligero',
      detail: 'Activación cardiovascular suave para crear el hábito sin sobrecarga articular.',
      xpReward: DEFAULT_XP_CONFIG.training,
      completed: false, // ¡TODO NUEVO USUARIO EMPIEZA EN FALSO!
      icon: 'directions_walk',
      accentColor: '#3B82F6',
    });
  } else {
    let workoutTitle = 'Sesión de Entrenamiento';
    let workoutSubtitle = '45-60 min programados';
    let workoutDetail = 'Completar la sesión enfocada en técnica y control de carga.';
    let icon = 'fitness_center';

    if (training_type.includes('Gimnasio')) {
      workoutTitle = 'Fuerza & Hipertrofia (Gimnasio)';
      workoutSubtitle = 'Rutina de pesas programada';
      workoutDetail = 'Trabajo de sobrecarga progresiva y estímulo mecánico muscular.';
      icon = 'fitness_center';
    } else if (training_type.includes('Running')) {
      workoutTitle = 'Sesión de Running';
      workoutSubtitle = 'Distancia o tiempo planificado';
      workoutDetail = 'Cardio y resistencia aeróbica según tu planificación semanal.';
      icon = 'directions_run';
    } else if (training_type.includes('Cross training')) {
      workoutTitle = 'WOD / Cross Training';
      workoutSubtitle = 'Alta intensidad funcional';
      workoutDetail = 'Sesión de acondicionamiento metabólico y fuerza aplicada.';
      icon = 'bolt';
    } else if (training_type.includes('Entrenamiento en casa')) {
      workoutTitle = 'Rutina Funcional en Casa';
      workoutSubtitle = '30-45 min peso corporal y bandas';
      workoutDetail = 'Ejercicios de empuje, tracción y estabilidad corporal.';
      icon = 'home';
    } else if (training_type.includes('Deportes')) {
      workoutTitle = 'Práctica Deportiva';
      workoutSubtitle = 'Entrenamiento de campo o cancha';
      workoutDetail = 'Desarrollo de habilidades específicas y condición física deportiva.';
      icon = 'sports_soccer';
    }

    objectives.push({
      id: 'entrenamiento',
      title: workoutTitle,
      subtitle: workoutSubtitle,
      detail: workoutDetail,
      xpReward: DEFAULT_XP_CONFIG.training,
      completed: false,
      icon,
      accentColor: '#3B82F6',
    });
  }

  // OBJETIVO 2: PROTEÍNA Y ALIMENTACIÓN
  const dietLabel = dietary_preferences ? ` (${dietary_preferences})` : '';
  objectives.push({
    id: 'nutricion',
    title: `Alcanzar ${proteinGrams}g de Proteína${dietLabel}`,
    subtitle: `Meta nutricional para ${primary_goal.toLowerCase()}`,
    detail: `Consumo distribuido a lo largo del día para apoyar la síntesis proteica y saciedad.`,
    xpReward: DEFAULT_XP_CONFIG.protein,
    completed: false,
    icon: 'egg_alt',
    accentColor: '#10B981',
  });

  // OBJETIVO 3: HIDRATACIÓN BASAL
  objectives.push({
    id: 'agua',
    title: `Hidratación Basal (${hydrationTarget}L)`,
    subtitle: 'Consumo constante a lo largo del día',
    detail: 'Mantiene la volemia, transporte de electrolitos y rendimiento cognitivo.',
    xpReward: DEFAULT_XP_CONFIG.hydration,
    completed: false,
    icon: 'water_drop',
    accentColor: '#06B6D4',
  });

  // OBJETIVO 4: SUPLEMENTACIÓN DEPORTIVA (SI CORRESPONDE)
  if (supplements.length > 0) {
    const primarySupp = supplements[0];
    const suppNames = supplements.map((s) => s.name).join(' + ');
    objectives.push({
      id: 'suplemento',
      title: `Tomas de Suplementación (${suppNames})`,
      subtitle: primarySupp.preferred_time || 'Según tu ventana diaria óptima',
      detail: 'Toma regular de tus suplementos para mantener saturación y apoyo energético.',
      xpReward: DEFAULT_XP_CONFIG.supplement,
      completed: false,
      icon: 'medication',
      accentColor: '#8B5CF6',
    });
  } else {
    // Si no toma suplementos, crear objetivo de recuperación o hábitos
    objectives.push({
      id: 'suplemento',
      title: 'Pausa de Estiramiento o Movilidad',
      subtitle: '10 minutos al levantarte o antes de dormir',
      detail: 'Descompresión articular y relajación miofascial activa.',
      xpReward: DEFAULT_XP_CONFIG.supplement,
      completed: false,
      icon: 'self_improvement',
      accentColor: '#8B5CF6',
    });
  }

  // OBJETIVO 5: SUEÑO Y RECUPERACIÓN
  objectives.push({
    id: 'sueno',
    title: 'Descanso Reparador (7-8 Horas)',
    subtitle: 'Higiene del sueño y oscuridad',
    detail: 'Vital para la segregación de hormona de crecimiento y recuperación neuromuscular.',
    xpReward: DEFAULT_XP_CONFIG.sleep,
    completed: false,
    icon: 'bedtime',
    accentColor: '#EC4899',
  });

  return {
    dailyObjectives: objectives,
    macros: calculatedMacros,
    hydrationTargetLiters: hydrationTarget,
    proteinTargetGrams: proteinGrams,
    calorieTarget: targetCalories,
  };
}
