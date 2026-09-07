import { DailyTaskItem } from '../components/DailyTasks';
import { MacroNutrients } from '../types';
import { OnboardingProfileInput, generatePersonalizedObjectives } from './objectiveEngine';
import { calculateLevelFromXP, calculateDailyForm } from './gamification';
import { supabaseRepository } from './supabaseRepository';
export { authService } from './authService';
export type { AppUser } from './authService';

export interface UserAppState {
  userId: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  levelName: string;
  streakDays: number;
  formScore: number;
  completedObjectives: number;
  hydration: number;
  protein: number;
  commitmentLevel: 'Básico' | 'Intermedio' | 'Avanzado' | 'Extremo';
  levelSelectedAt?: string;
  levelGraceAvailable?: boolean;
  nextLevelChangeAllowedAt?: string;
  tasks: DailyTaskItem[];
  macros: MacroNutrients;
  targets?: {
    hydrationLiters: number;
    proteinGrams: number;
    calories: number;
  };
  biometrics?: {
    weightKg?: number;
    heightCm?: number;
    age?: number;
  };
  onboardingCompleted: boolean;
  firstDashboardSeen: boolean;
  onboardingData?: OnboardingProfileInput;
  activityDates: string[];
  foodHistory: any[];
  supplementHistory: any[];
  progressHistory: any[];
  dailyHistory?: Record<string, number>;
  isPro?: boolean;
  proExpiry?: string;
  referralCode?: string;
  challengesCompleted: number;
  lastActiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export type UserState = UserAppState;

// ESTADO DEMO AISLADO (Santiago, 4860 XP, 12 días)
export const SANTIAGO_DEMO_STATE: UserAppState = {
  userId: 'santiago-demo-athlete',
  name: 'Santiago',
  email: 'santiago@maxform.app',
  xp: 4860,
  level: 7,
  levelName: 'Elite',
  streakDays: 12,
  formScore: 78,
  completedObjectives: 3,
  hydration: 2.1,
  protein: 128,
  commitmentLevel: 'Avanzado',
  tasks: [
    {
      id: 'agua',
      title: 'Hidratación Basal (Meta: 3.0L)',
      subtitle: '2.1L consumidos · Faltan 900ml',
      detail: 'Mantiene volemia y transporte celular activo.',
      xpReward: 10,
      completed: false,
      icon: 'water_drop',
      accentColor: '#06B6D4',
    },
    {
      id: 'entrenamiento',
      title: 'Fuerza & Hipertrofia (Gimnasio)',
      subtitle: 'Hipertrofia Empuje / Pierna',
      detail: '6 ejercicios con sobrecarga progresiva.',
      xpReward: 25,
      completed: true,
      icon: 'fitness_center',
      accentColor: '#3B82F6',
    },
    {
      id: 'nutricion',
      title: 'Alcanzar 160g de Proteína',
      subtitle: '128g alcanzados hoy · Falta 32g',
      detail: 'Síntesis proteica y recuperación muscular.',
      xpReward: 20,
      completed: false,
      icon: 'egg_alt',
      accentColor: '#10B981',
    },
    {
      id: 'suplemento',
      title: 'Creatina Monohidrato 5g',
      subtitle: 'Post-entreno tomada',
      detail: 'Saturación muscular de fosfocreatina.',
      xpReward: 10,
      completed: true,
      icon: 'medication',
      accentColor: '#8B5CF6',
    },
    {
      id: 'sueno',
      title: 'Descanso Nocturno (7.5 Horas)',
      subtitle: 'Recuperación neuromuscular registrada',
      detail: 'Fase REM y ondas lentas óptimas.',
      xpReward: 15,
      completed: true,
      icon: 'bedtime',
      accentColor: '#EC4899',
    },
  ],
  macros: {
    protein: 160,
    carbs: 220,
    fats: 65,
    calories: 2150,
  },
  onboardingCompleted: true,
  firstDashboardSeen: true,
  activityDates: ['2026-09-04', '2026-09-03', '2026-09-02'],
  foodHistory: [
    { id: 'demo-f1', name: 'Huevos revueltos y avena', protein: 28, carbs: 45, fats: 14, calories: 420, timestamp: '08:30' },
    { id: 'demo-f2', name: 'Pollo con arroz y palta', protein: 48, carbs: 65, fats: 18, calories: 610, timestamp: '13:15' },
    { id: 'demo-f3', name: 'Batido Whey con banana', protein: 32, carbs: 30, fats: 3, calories: 275, timestamp: '17:40' },
  ],
  supplementHistory: [
    { id: 'demo-s1', name: 'Creatina 5g', takenAt: '18:10' }
  ],
  progressHistory: [
    { date: '2026-08-01', weight: 74.2 },
    { date: '2026-08-15', weight: 73.5 },
    { date: '2026-09-01', weight: 72.4 },
  ],
  challengesCompleted: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_CLEAN_TASKS: DailyTaskItem[] = [
  {
    id: 'agua',
    title: 'Hidratación Basal (Meta: 2.5L)',
    subtitle: '0.0L consumidos · Faltan 2.5L',
    detail: 'Mantiene volemia y transporte celular activo.',
    xpReward: 10,
    completed: false,
    icon: 'water_drop',
    accentColor: '#06B6D4',
  },
  {
    id: 'entrenamiento',
    title: 'Sesión de Entrenamiento',
    subtitle: 'Actividad física programada',
    detail: 'Completa tu sesión diaria de fuerza o acondicionamiento.',
    xpReward: 25,
    completed: false,
    icon: 'fitness_center',
    accentColor: '#3B82F6',
  },
  {
    id: 'nutricion',
    title: 'Alcanzar Meta de Proteína',
    subtitle: '0g alcanzados hoy',
    detail: 'Síntesis proteica y balance de aminoácidos.',
    xpReward: 20,
    completed: false,
    icon: 'egg_alt',
    accentColor: '#10B981',
  },
  {
    id: 'suplemento',
    title: 'Suplementación Diaria',
    subtitle: 'Toma según tu protocolo',
    detail: 'Optimización y recuperación biológica.',
    xpReward: 10,
    completed: false,
    icon: 'medication',
    accentColor: '#8B5CF6',
  },
  {
    id: 'sueno',
    title: 'Descanso Nocturno (7-8 Horas)',
    subtitle: 'Recuperación neuromuscular',
    detail: 'Regeneración celular y ritmo circadiano.',
    xpReward: 15,
    completed: false,
    icon: 'bedtime',
    accentColor: '#EC4899',
  },
];

/**
 * Crea el estado inicial puro para un NUEVO USUARIO.
 * REGLA ABSOLUTA: TODO NUEVO USUARIO EMPIEZA ESTRICTAMENTE DESDE CERO.
 */
export function createCleanInitialUserState(userId: string, email: string, name: string): UserAppState {
  const todayStr = new Date().toISOString().split('T')[0];

  return {
    userId,
    name: name.trim() || 'Atleta',
    email,
    xp: 0,
    level: 1,
    levelName: 'Básico',
    streakDays: 0,
    formScore: 0,
    completedObjectives: 0,
    hydration: 0,
    protein: 0,
    commitmentLevel: 'Básico',
    levelSelectedAt: new Date().toISOString(),
    levelGraceAvailable: true, // 1 oportunidad tras el onboarding
    nextLevelChangeAllowedAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    tasks: INITIAL_CLEAN_TASKS,
    macros: {
      protein: 130,
      carbs: 180,
      fats: 55,
      calories: 1800,
    },
    targets: {
      hydrationLiters: 2.5,
      proteinGrams: 130,
      calories: 1800,
    },
    onboardingCompleted: false,
    firstDashboardSeen: false,
    onboardingData: undefined,
    activityDates: [],
    foodHistory: [],
    supplementHistory: [],
    progressHistory: [],
    dailyHistory: {},
    isPro: false,
    referralCode: `MAX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    challengesCompleted: 0,
    lastActiveDate: todayStr,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Clave única de almacenamiento local por usuario
 */
export function getUserStorageKey(userId: string): string {
  return `maxform_user_v2_${userId}`;
}

/**
 * Carga de forma inmediata y síncrona el estado local del usuario desde localStorage.
 * Si no existe, crea un estado inicial limpio en cero absoluto.
 */
export function loadLocalUserState(userId: string, email = '', name = ''): UserAppState {
  const storageKey = getUserStorageKey(userId);
  try {
    const localRaw = localStorage.getItem(storageKey);
    if (localRaw) {
      const parsed = JSON.parse(localRaw) as UserAppState;
      if (parsed && parsed.userId === userId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[userStore] Error al parsear estado local:', e);
  }

  const clean = createCleanInitialUserState(userId, email, name);
  saveUserData(clean);
  return clean;
}

/**
 * Elimina los datos del usuario en localStorage para aislamiento y privacidad.
 */
export function deleteUserData(userId: string): void {
  const storageKey = getUserStorageKey(userId);
  localStorage.removeItem(storageKey);
}

/**
 * Carga el estado del usuario: primero intenta de Supabase PostgreSQL si hay conexión,
 * y luego de su clave de almacenamiento local aislada.
 */
export async function loadUserData(userId: string, email: string, name: string): Promise<UserAppState> {
  const storageKey = getUserStorageKey(userId);

  // 1. Intentar cargar desde Supabase PostgreSQL
  try {
    const remote = await supabaseRepository.loadAthleteState(userId);
    if (remote) {
      // Guardar copia local de este usuario
      localStorage.setItem(storageKey, JSON.stringify(remote));
      return remote;
    }
  } catch (err) {
    console.warn('[userStore] Consulta Supabase diferida:', err);
  }

  // 2. Fallback a estado local
  return loadLocalUserState(userId, email, name);
}

/**
 * Guarda el estado del usuario en su clave local y lo sincroniza en Supabase PostgreSQL
 */
export async function saveUserData(state: UserAppState): Promise<void> {
  if (!state || !state.userId) return;

  const storageKey = getUserStorageKey(state.userId);
  const updatedState = {
    ...state,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(updatedState));
  } catch (e) {
    console.warn('[userStore] Error escribiendo en localStorage:', e);
  }

  // Guardar en Supabase PostgreSQL de forma asíncrona
  if (!state.userId.includes('demo')) {
    supabaseRepository.saveAthleteState(updatedState).catch((err) => {
      console.warn('[userStore] Escritura en Supabase diferida:', err);
    });
  }
}

/**
 * Inicializa completamente la cuenta del usuario tras completar el Onboarding:
 * - Genera metas deterministas
 * - Asigna macros calculados
 * - Establece onboardingCompleted = true
 * - MANTIENE XP = 0, Streak = 0, Form = 0%
 */
export function initializeUserFromOnboarding(
  currentState: UserAppState,
  onboardingInput: OnboardingProfileInput
): UserAppState {
  const generated = generatePersonalizedObjectives(onboardingInput);

  const completedCount = generated.dailyObjectives.filter((t) => t.completed).length;
  const formScore = calculateDailyForm(completedCount, generated.dailyObjectives.length);

  const updated: UserAppState = {
    ...currentState,
    name: onboardingInput.name.trim() || currentState.name,
    commitmentLevel: onboardingInput.experience_level,
    levelSelectedAt: new Date().toISOString(),
    levelGraceAvailable: true, // Dispone de 1 oportunidad tras el onboarding para cambiarlo
    nextLevelChangeAllowedAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    tasks: generated.dailyObjectives,
    macros: generated.macros,
    targets: {
      hydrationLiters: generated.hydrationTargetLiters,
      proteinGrams: generated.proteinTargetGrams,
      calories: generated.calorieTarget,
    },
    biometrics: {
      weightKg: onboardingInput.weight,
      heightCm: onboardingInput.height,
      age: onboardingInput.age,
    },
    onboardingCompleted: true,
    firstDashboardSeen: false, // Disparará el banner "Hoy empieza tu Form"
    onboardingData: onboardingInput,
    xp: 0, // ¡ESTRICTAMENTE CERO!
    level: 1,
    levelName: 'Básico',
    streakDays: 0, // ¡ESTRICTAMENTE CERO!
    formScore,
    completedObjectives: completedCount,
    updatedAt: new Date().toISOString(),
  };

  saveUserData(updated);
  return updated;
}
