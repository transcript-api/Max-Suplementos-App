/**
 * Daily Habits Tracking & Midnight Reset System for MAXFORM
 * 
 * Tracks non-nutritional habits (reading, sleep tracking, meditation, morning sunlight, digital detox)
 * that boost the athlete's daily energy score and automatically resets at midnight every day.
 */

export interface DailyHabitItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'lectura' | 'sueno' | 'meditacion' | 'salud' | 'personalizado';
  icon: string;
  energyBoost: number; // Porcentaje de aumento al puntaje de energía diario (ej. 4 = +4%)
  xpReward: number; // Puntos de experiencia
  completed: boolean;
  completedAt?: string;
  isCustom?: boolean;
}

export interface DailyHabitsData {
  lastResetDate: string; // 'YYYY-MM-DD' en hora local
  habits: DailyHabitItem[];
  streakDays?: number;
  totalCompletedAllTime?: number;
}

export const DEFAULT_DAILY_HABITS: DailyHabitItem[] = [
  {
    id: 'habit_reading',
    title: 'Lectura & Enfoque Mental',
    subtitle: '15-20 min de lectura de desarrollo, enfoque o aprendizaje',
    category: 'lectura',
    icon: 'auto_stories',
    energyBoost: 4,
    xpReward: 15,
    completed: false,
  },
  {
    id: 'habit_sleep',
    title: 'Monitoreo de Sueño & Descanso',
    subtitle: 'Registrar descanso nocturno (meta 7-8h) y optimizar recuperación',
    category: 'sueno',
    icon: 'bedtime',
    energyBoost: 5,
    xpReward: 20,
    completed: false,
  },
  {
    id: 'habit_meditation',
    title: 'Meditación & Respiración Consciente',
    subtitle: '10 min de respiración diafragmática, mindfulness o calma mental',
    category: 'meditacion',
    icon: 'self_improvement',
    energyBoost: 4,
    xpReward: 15,
    completed: false,
  },
  {
    id: 'habit_morning_sunlight',
    title: 'Luz Solar & Movilidad Matutina',
    subtitle: '10-15 min de exposición solar directa y estiramientos al despertar',
    category: 'salud',
    icon: 'wb_sunny',
    energyBoost: 3,
    xpReward: 10,
    completed: false,
  },
  {
    id: 'habit_digital_detox',
    title: 'Desconexión Digital Nocturna',
    subtitle: 'Cero pantallas 30-45 min antes de dormir para descanso profundo',
    category: 'sueno',
    icon: 'phonelink_off',
    energyBoost: 4,
    xpReward: 15,
    completed: false,
  },
];

/**
 * Retorna la fecha local en formato 'YYYY-MM-DD'
 */
export function getTodayLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna la cantidad de milisegundos restantes hasta la próxima medianoche local
 */
export function getMillisecondsUntilMidnight(): number {
  const now = new Date();
  const tomorrowMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    50
  );
  return Math.max(1000, tomorrowMidnight.getTime() - now.getTime());
}

/**
 * Retorna el tiempo restante formateado en horas y minutos hasta medianoche
 */
export function getTimeUntilMidnightFormatted(): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const ms = getMillisecondsUntilMidnight();
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let formatted = '';
  if (hours > 0) {
    formatted = `${hours}h ${minutes}m`;
  } else {
    formatted = `${minutes}m ${seconds}s`;
  }

  return { hours, minutes, seconds, formatted };
}

/**
 * Calcula el impulso total de energía (%) sumando los hábitos completados
 */
export function calculateHabitsEnergyBoost(habits: DailyHabitItem[]): number {
  if (!habits || habits.length === 0) return 0;
  return habits
    .filter((h) => h.completed)
    .reduce((sum, h) => sum + (h.energyBoost || 3), 0);
}

/**
 * Verifica si los hábitos corresponden al día actual.
 * Si es un nuevo día (o no estaban inicializados), reinicia el checklist a medianoche.
 * Preserva los hábitos personalizados creados por el usuario.
 */
export function ensureHabitsAreCurrent(data?: DailyHabitsData | null): {
  habitsData: DailyHabitsData;
  wasReset: boolean;
} {
  const todayStr = getTodayLocalDateString();

  if (!data || !data.habits || data.habits.length === 0) {
    return {
      habitsData: {
        lastResetDate: todayStr,
        habits: DEFAULT_DAILY_HABITS.map((h) => ({ ...h, completed: false })),
        streakDays: 0,
        totalCompletedAllTime: 0,
      },
      wasReset: true,
    };
  }

  // Si la última fecha de reseteo es distinta de hoy, reiniciar estados a medianoche
  if (data.lastResetDate !== todayStr) {
    const resetHabits = data.habits.map((habit) => ({
      ...habit,
      completed: false,
      completedAt: undefined,
    }));

    return {
      habitsData: {
        ...data,
        lastResetDate: todayStr,
        habits: resetHabits,
      },
      wasReset: true,
    };
  }

  return {
    habitsData: data,
    wasReset: false,
  };
}

/**
 * Fuerza el reinicio de medianoche manualmente (útil para pruebas y modo demo)
 */
export function forceMidnightReset(data: DailyHabitsData): DailyHabitsData {
  const todayStr = getTodayLocalDateString();
  return {
    ...data,
    lastResetDate: todayStr,
    habits: data.habits.map((h) => ({
      ...h,
      completed: false,
      completedAt: undefined,
    })),
  };
}

/**
 * Helper para estilos visuales de categorías de hábitos
 */
export function getCategoryBadge(category: DailyHabitItem['category']): {
  label: string;
  colorClass: string;
} {
  switch (category) {
    case 'lectura':
      return {
        label: 'Lectura & Mente',
        colorClass: 'bg-amber-500/15 text-amber-500 dark:text-amber-300 border-amber-500/30',
      };
    case 'sueno':
      return {
        label: 'Sueño & Recuperación',
        colorClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30',
      };
    case 'meditacion':
      return {
        label: 'Mindfulness & Calma',
        colorClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
      };
    case 'salud':
      return {
        label: 'Salud & Ritmo Circadiano',
        colorClass: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30',
      };
    case 'personalizado':
    default:
      return {
        label: 'Hábito Pro',
        colorClass: 'bg-blue-500/15 text-blue-600 dark:text-[#b4c5ff] border-blue-500/30',
      };
  }
}
