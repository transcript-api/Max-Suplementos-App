import { CommitmentLevel } from '../types';
import { DailyTaskItem } from '../components/DailyTasks';

export interface LevelProtocolDetails {
  id: CommitmentLevel;
  name: string;
  badgeTitle: string;
  tagline: string;
  themeColor: string;
  barGradient: string;
  glowColor: string;
  badgeClass: string;
  textColor: string;
  bgTint: string;
  borderTint: string;
  
  // Exigencias específicas y métricas
  weeklyWorkouts: string;
  workoutDuration: string;
  workoutFocus: string;
  proteinRatio: string;
  hydrationGoal: string;
  supplementsFocus: string;
  recoveryRule: string;
  formTolerance: string;
  taskCount: number;

  // Rasgos exclusivos de interfaz
  interfaceFeatures: string[];
  motto: string;
  warningNotice?: string;
}

export const LEVEL_PROTOCOLS: Record<CommitmentLevel, LevelProtocolDetails> = {
  Básico: {
    id: 'Básico',
    name: 'Básico',
    badgeTitle: 'INICIACIÓN & HÁBITO SALUDABLE',
    tagline: 'Construyendo disciplina progresiva sin fricción ni saturación mental.',
    themeColor: '#10b981',
    barGradient: 'from-emerald-500 to-teal-400',
    glowColor: 'shadow-emerald-500/20',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    textColor: 'text-emerald-400',
    bgTint: 'bg-emerald-500/5',
    borderTint: 'border-emerald-500/20',
    
    weeklyWorkouts: '3 sesiones semanales',
    workoutDuration: '25-35 minutos',
    workoutFocus: 'Caminatas activas, movilidad articular y ejercicios con peso corporal.',
    proteinRatio: '1.2g - 1.4g / kg de peso (Fácil de cubrir con comida casera sin suplementos obligatorios).',
    hydrationGoal: '2.0L a 2.4L diarios.',
    supplementsFocus: 'Opcional (enfoque primordial en alimentación real y regularidad horaria).',
    recoveryRule: 'Pausas conscientes y descanso regular de al menos 7 horas.',
    formTolerance: 'Alta tolerancia: Cumplir 2 de los 3 objetivos otorga Form positivo (>66%).',
    taskCount: 3,

    interfaceFeatures: [
      'Dashboard limpio y sin sobrecarga de números complejos',
      'Foco visual prioritario en Hidratación y Proteína base',
      'Mensajes de motivación guiados para evitar el abandono prematuro',
      'Solo 3 objetivos diarios esenciales para consolidar el hábito',
    ],
    motto: 'La consistencia supera a la intensidad en las primeras fases.',
  },

  Intermedio: {
    id: 'Intermedio',
    name: 'Intermedio',
    badgeTitle: 'DESARROLLO & CONSTANCIA ATLÉTICA',
    tagline: 'Sobrecarga estructurada y equilibrio nutricional para atletas en progreso.',
    themeColor: '#3b82f6',
    barGradient: 'from-blue-600 via-cyan-500 to-teal-400',
    glowColor: 'shadow-blue-500/25',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    textColor: 'text-blue-400',
    bgTint: 'bg-blue-500/5',
    borderTint: 'border-blue-500/20',

    weeklyWorkouts: '4 sesiones semanales',
    workoutDuration: '45-55 minutos',
    workoutFocus: 'Rutina dividida (Empuje / Tirón / Pierna) o entrenamiento funcional continuo.',
    proteinRatio: '1.6g - 1.8g / kg de peso (Distribución en 3-4 tomas a lo largo del día).',
    hydrationGoal: '2.7L a 3.0L diarios.',
    supplementsFocus: 'Recomendado: Creatina monohidrato (5g) y proteína whey opcional.',
    recoveryRule: 'Movilidad activa diaria y 7.5 horas de descanso con control de pantallas.',
    formTolerance: 'Moderada: Requiere al menos 3 de 4 objetivos para mantener Form óptimo (>75%).',
    taskCount: 4,

    interfaceFeatures: [
      'Desglose analítico de los 4 macronutrientes (Proteína, Carbos, Grasas, Calorías)',
      'Monitor de racha semanal de actividad física',
      'Indicador de balance energético y sugerencias de platos balanceados',
      '4 objetivos diarios calibrados para atletas intermedios',
    ],
    motto: 'No busques motivación efímera; construye un sistema inquebrantable.',
  },

  Avanzado: {
    id: 'Avanzado',
    name: 'Avanzado',
    badgeTitle: 'ALTO RENDIMIENTO & HIPERTROFIA',
    tagline: 'Rigor deportivo, sobrecarga progresiva y optimización metabólica.',
    themeColor: '#8b5cf6',
    barGradient: 'from-indigo-600 via-purple-600 to-pink-500',
    glowColor: 'shadow-purple-500/30',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    textColor: 'text-purple-400',
    bgTint: 'bg-purple-500/5',
    borderTint: 'border-purple-500/20',

    weeklyWorkouts: '5 sesiones semanales',
    workoutDuration: '60-75 minutos',
    workoutFocus: 'Fuerza máxima, hipertrofia RPE 8-9 y acondicionamiento metabólico.',
    proteinRatio: '1.8g - 2.0g / kg (Enfoque estricto en fuentes de alto valor biológico y leucina mTOR).',
    hydrationGoal: '3.2L a 3.5L diarios con reposición intra-entrenamiento.',
    supplementsFocus: 'Monitoreo activo de Creatina, Whey y multivitamínico con telemetría de stock.',
    recoveryRule: 'Higiene del sueño circadiana estricta (7-8 horas continuas en oscuridad).',
    formTolerance: 'Rigurosa: Requiere 4 de 5 objetivos cumplidos para acceder a la zona de excelencia (>80%).',
    taskCount: 5,

    interfaceFeatures: [
      'Telemetría de micronutrientes y leucina (mTOR) en recetas de IA',
      'Card de inventario y reabastecimiento de suplementos con días restantes',
      'Objetivo dedicado de suplementación deportiva con timing diario',
      '5 objetivos estrictos para atletas con metas competitivas',
    ],
    motto: 'La diferencia entre lo ordinario y lo extraordinario es la precisión en los detalles.',
  },

  Extremo: {
    id: 'Extremo',
    name: 'Extremo',
    badgeTitle: 'ÉLITE · TOLERANCIA CERO',
    tagline: 'Máxima exigencia biológica, pesaje al gramo y disciplina total.',
    themeColor: '#ef4444',
    barGradient: 'from-red-600 via-rose-600 to-amber-500',
    glowColor: 'shadow-red-500/35',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    textColor: 'text-rose-400',
    bgTint: 'bg-rose-500/5',
    borderTint: 'border-rose-500/25',

    weeklyWorkouts: '5-6 sesiones de alta intensidad',
    workoutDuration: '75-90 minutos o doble sesión',
    workoutFocus: 'Sobrecarga progresiva al límite, potencia neuromuscular y resistencia extrema.',
    proteinRatio: '2.2g - 2.4g / kg (Pesado exacto de alimentos, balance de electrolitos y timing peri-entreno).',
    hydrationGoal: '3.6L a 4.0L diarios con aporte de sodio/potasio post-esfuerzo.',
    supplementsFocus: 'Protocolo completo: Creatina 5g, Whey aislado, electrolitos y micronutrición.',
    recoveryRule: '8 horas de sueño profundo, descompresión articular y monitoreo de fatiga.',
    formTolerance: 'Cero concesiones: Fallar un solo objetivo penaliza drásticamente el estatus de Élite.',
    taskCount: 6,

    interfaceFeatures: [
      'Banner activo de "Protocolo Tolerancia Cero: Sin Excusas"',
      'Alertas críticas de cierre de ventana nutricional antes de la medianoche',
      '6 objetivos diarios que cubren nutrición, entrenamiento, hidratación, suplementos, movilidad y sueño',
      'Audit de micronutrientes avanzados con score de densidad metabólica',
    ],
    motto: 'La excelencia no es un acto aislado, es un hábito innegociable.',
    warningNotice: '⚠️ Nivel de exigencia física extrema. No apto para personas que busquen una rutina casual.',
  },
};

export const COOLDOWN_DAYS = 14; // 2 semanas obligatorias entre cambios regulares
export const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export interface CooldownStatus {
  isAllowed: boolean;
  hasGraceOpportunity: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  nextAllowedDate: Date;
  reason: string;
}

/**
 * Evalúa si el usuario puede cambiar de nivel o si está bloqueado por el ciclo de 2 semanas (14 días).
 * Regla:
 * 1. Al inicio tiene 1 oportunidad de gracia tras el onboarding.
 * 2. Una vez usada la oportunidad de gracia, debe esperar 14 días exactos antes del siguiente cambio.
 */
export function checkLevelCooldown(
  levelSelectedAt?: string,
  levelGraceAvailable: boolean = false,
  nextLevelChangeAllowedAt?: string
): CooldownStatus {
  const now = Date.now();

  // Si tiene la oportunidad de gracia disponible, se le permite el cambio inmediato
  if (levelGraceAvailable) {
    const nextDate = new Date(now + COOLDOWN_MS);
    return {
      isAllowed: true,
      hasGraceOpportunity: true,
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      nextAllowedDate: nextDate,
      reason: 'Tienes 1 oportunidad de gracia disponible para calibrar tu protocolo.',
    };
  }

  // Si no hay fecha registrada previa, permitir
  if (!levelSelectedAt) {
    return {
      isAllowed: true,
      hasGraceOpportunity: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      nextAllowedDate: new Date(now),
      reason: 'Configuración inicial disponible.',
    };
  }

  const selectedTimestamp = new Date(levelSelectedAt).getTime();
  const targetTimestamp = nextLevelChangeAllowedAt 
    ? new Date(nextLevelChangeAllowedAt).getTime() 
    : selectedTimestamp + COOLDOWN_MS;

  const msRemaining = targetTimestamp - now;

  if (msRemaining <= 0) {
    return {
      isAllowed: true,
      hasGraceOpportunity: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      nextAllowedDate: new Date(targetTimestamp),
      reason: 'Ciclo de 14 días completado. Puedes recalibrar tu nivel para el siguiente ciclo.',
    };
  }

  const totalMinutes = Math.ceil(msRemaining / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return {
    isAllowed: false,
    hasGraceOpportunity: false,
    daysRemaining: days,
    hoursRemaining: hours,
    minutesRemaining: minutes,
    nextAllowedDate: new Date(targetTimestamp),
    reason: `Protocolo bloqueado: Faltan ${days} días y ${hours}h para completar el ciclo de adaptación fisiológica de 14 días.`,
  };
}
