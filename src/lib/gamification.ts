/**
 * Motor de Gamificación y Reglas de Negocio para MAXFORM
 * 
 * Gestiona de forma determinista la progresión por niveles, cálculo de Daily Form,
 * adjudicación de experiencia (XP) y cálculo de rachas basadas en fechas reales.
 */

export interface XPRewardConfig {
  training: number;
  protein: number;
  hydration: number;
  supplement: number;
  sleep: number;
  customTask: number;
}

export const DEFAULT_XP_CONFIG: XPRewardConfig = {
  training: 25,
  protein: 20,
  hydration: 10,
  supplement: 10,
  sleep: 15,
  customTask: 15,
};

// Umbrales configurables de niveles (1,000 XP por nivel)
export const LEVEL_THRESHOLDS = [
  { level: 1, name: 'Básico', minXp: 0, maxXp: 999 },
  { level: 2, name: 'Iniciado', minXp: 1000, maxXp: 1999 },
  { level: 3, name: 'Constante', minXp: 2000, maxXp: 2999 },
  { level: 4, name: 'Intermedio', minXp: 3000, maxXp: 3999 },
  { level: 5, name: 'Dedicado', minXp: 4000, maxXp: 4999 },
  { level: 6, name: 'Avanzado', minXp: 5000, maxXp: 5999 },
  { level: 7, name: 'Elite', minXp: 6000, maxXp: 6999 },
  { level: 8, name: 'Extremo / Pro', minXp: 7000, maxXp: Infinity },
];

/**
 * Calcula el nivel atlético actual a partir de los puntos de experiencia (XP)
 */
export function calculateLevelFromXP(xp: number): {
  levelNumber: number;
  levelName: string;
  currentLevelXp: number;
  xpForNextLevel: number;
  progressPercent: number;
} {
  const safeXp = Math.max(0, xp);
  const found = LEVEL_THRESHOLDS.find((t) => safeXp >= t.minXp && safeXp <= t.maxXp) || LEVEL_THRESHOLDS[0];

  const currentLevelXp = safeXp - found.minXp;
  const isMaxLevel = found.maxXp === Infinity;
  const xpForNextLevel = isMaxLevel ? 1000 : (found.maxXp - found.minXp + 1);
  const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.round((currentLevelXp / xpForNextLevel) * 100));

  return {
    levelNumber: found.level,
    levelName: found.name,
    currentLevelXp,
    xpForNextLevel,
    progressPercent,
  };
}

/**
 * Calcula el puntaje de Daily Form a partir de los objetivos diarios completados
 * Fórmula determinista: (completed / total) * 100
 */
export function calculateDailyForm(completedCount: number, totalCount: number): number {
  if (totalCount <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((completedCount / totalCount) * 100)));
}

/**
 * Calcula la racha activa de un usuario a partir de su historial de fechas de cumplimiento
 */
export function calculateStreak(activityDates: string[]): number {
  if (!activityDates || activityDates.length === 0) return 0;

  // Ordenar fechas únicas de más reciente a más antigua
  const uniqueDates = Array.from(new Set(activityDates)).sort().reverse();
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Si la última actividad no fue hoy ni ayer, la racha se rompió (0)
  const latestDate = uniqueDates[0];
  if (latestDate !== todayStr && latestDate !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let expectedDate = new Date(latestDate);

  for (const dateStr of uniqueDates) {
    const currentDate = new Date(dateStr);
    const diffDays = Math.round((expectedDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 0) {
      streak += 1;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
