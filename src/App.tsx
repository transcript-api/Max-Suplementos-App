/**
 * MAXFORM Performance Health & Nutrition Tracking System
 * Modern React + Tailwind CSS + Supabase + Gemini AI + Recharts
 */

import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { usePwaInstall } from './lib/usePwaInstall';
import { DailyTasks, DailyTaskItem } from './components/DailyTasks';
import { ConsistencyChallenges } from './components/ConsistencyChallenges';
import { ProteinWeeklyChart } from './components/ProteinWeeklyChart';
import { SupplementReplenishmentCard } from './components/SupplementReplenishmentCard';
import { AnimatedCounter } from './components/AnimatedCounter';
import { ensureAuthUser } from './lib/supabase';
import { supabaseRepository } from './lib/supabaseRepository';
import { offlineSync, SyncStatus } from './lib/offlineSync';
import { MacroNutrients } from './types';
import { reconcileAthleteData, LocalAthleteState } from './lib/reconciliation';
import { AdminPanel } from './components/admin/AdminPanel';
import { getPersonalizedContent } from './lib/personalizationEngine';

// Módulos pesados diferidos con React.lazy para carga ultrarrápida del bundle principal
const StatsTab = lazy(() => import('./components/StatsTab').then(m => ({ default: m.StatsTab })));
const NutritionTab = lazy(() => import('./components/NutritionTab').then(m => ({ default: m.NutritionTab })));
const MaxAiTab = lazy(() => import('./components/MaxAiTab').then(m => ({ default: m.MaxAiTab })));
const ChallengesTab = lazy(() => import('./components/ChallengesTab').then(m => ({ default: m.ChallengesTab })));
const ProfileTab = lazy(() => import('./components/ProfileTab').then(m => ({ default: m.ProfileTab })));
const SuplementosTab = lazy(() => import('./components/SuplementosTab').then(m => ({ default: m.SuplementosTab })));

const OnboardingModal = lazy(() => import('./components/OnboardingModal').then(m => ({ default: m.OnboardingModal })));
const PremiumModal = lazy(() => import('./components/PremiumModal').then(m => ({ default: m.PremiumModal })));
const AudioTranscriberModal = lazy(() => import('./components/AudioTranscriberModal').then(m => ({ default: m.AudioTranscriberModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const ProtocolChangeModal = lazy(() => import('./components/ProtocolChangeModal').then(m => ({ default: m.ProtocolChangeModal })));

const TabLoaderFallback = () => (
  <div className="w-full flex-1 min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
    <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-white/70 animate-spin" />
    <span className="text-xs font-semibold tracking-wider uppercase text-zinc-500 animate-pulse">
      Cargando sección...
    </span>
  </div>
);

import { 
  authService, 
  AppUser, 
  loadUserData, 
  loadLocalUserState,
  saveUserData, 
  createCleanInitialUserState, 
  initializeUserFromOnboarding, 
  SANTIAGO_DEMO_STATE,
  UserState,
  deleteUserData
} from './lib/userStore';
import { calculateLevelFromXP, calculateDailyForm, calculateStreak } from './lib/gamification';
import { OnboardingProfileInput, generatePersonalizedObjectives } from './lib/objectiveEngine';
import { LevelExclusivesCard } from './components/LevelExclusivesCard';
import { checkLevelCooldown } from './lib/levelProtocols';
import {
  triggerEnergyCelebrationConfetti,
  playCelebrationSound,
  hasCelebratedEnergyToday,
  markCelebratedEnergyToday,
  resetCelebratedEnergyToday,
} from './lib/celebration';
import { EnergyCelebrationModal } from './components/EnergyCelebrationModal';
import { DailyHabits } from './components/DailyHabits';
import {
  DailyHabitItem,
  DailyHabitsData,
  DEFAULT_DAILY_HABITS,
  ensureHabitsAreCurrent,
  forceMidnightReset,
  calculateHabitsEnergyBoost,
  getMillisecondsUntilMidnight,
  getTodayLocalDateString,
} from './lib/dailyHabits';

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

export const LEVEL_CONFIGS: Record<CommitmentLevel, LevelConfig> = {
  Básico: {
    name: 'Básico',
    barGradient: 'from-zinc-600 via-zinc-500 to-zinc-400',
    barColor: '#898a8c',
    glowColor: 'shadow-zinc-500/20',
    textColor: 'text-zinc-400 dark:text-zinc-300',
    badgeClass: 'bg-zinc-900 text-zinc-300 border-zinc-700/60 shadow-sm',
    description: 'Enfoque de salud general: 2L de agua, registro flexible y 3 entrenos semanales.',
  },
  Intermedio: {
    name: 'Intermedio',
    barGradient: 'from-zinc-500 via-zinc-300 to-zinc-200',
    barColor: '#d6d6d6',
    glowColor: 'shadow-zinc-300/30',
    textColor: 'text-zinc-300 dark:text-zinc-100',
    badgeClass: 'bg-zinc-800 text-zinc-100 border-zinc-500/50 shadow-sm',
    description: 'Equilibrio atlético: 120g proteína, hidratación continua y 4 sesiones semanales.',
  },
  Avanzado: {
    name: 'Avanzado',
    barGradient: 'from-zinc-400 via-zinc-100 to-white',
    barColor: '#d6d6d6',
    glowColor: 'shadow-white/30',
    textColor: 'text-zinc-100 dark:text-white',
    badgeClass: 'bg-zinc-100 text-zinc-950 font-black border-white shadow-md',
    description: 'Rigor atlético: 150g proteína estricta, telemetría y sobrecarga progresiva.',
  },
  Extremo: {
    name: 'Extremo',
    barGradient: 'from-zinc-200 via-white to-zinc-100',
    barColor: '#ffffff',
    glowColor: 'shadow-[0_0_20px_rgba(255,255,255,0.45)]',
    textColor: 'text-white',
    badgeClass: 'bg-white text-black font-black border-white shadow-[0_0_15px_rgba(255,255,255,0.35)] animate-pulse',
    description: 'Máximo rendimiento sin concesiones: macros al gramo y tolerancia cero.',
  },
};

interface DashboardProps {
  onNavigateTab: (tab: string, prompt?: string) => void;
  hydration: number;
  onAddWater: () => void;
  onReduceWater?: () => void;
  xp: number;
  streakDays: number;
  protein: number;
  onAddProtein: (amount: number) => void;
  macros: MacroNutrients;
  onAddMealEntry: (meal: {
    name: string;
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  }) => void;
  onClaimReward: (xp: number, title: string) => void;
  commitmentLevel: CommitmentLevel;
  setCommitmentLevel: (lvl: CommitmentLevel) => void;
  levelSelectedAt?: string;
  levelGraceAvailable?: boolean;
  nextLevelChangeAllowedAt?: string;
  onOpenLevelModal: () => void;
  tasks: DailyTaskItem[];
  onToggleTask: (taskId: DailyTaskItem['id']) => void;
  energyPercent: number;
  isDark: boolean;
  syncStatus: SyncStatus;
  onManualSync: () => void;
  userName?: string;
  firstDashboardSeen?: boolean;
  onDismissFirstDashboard?: () => void;
  dailyHistory?: Record<string, number>;
  isDemoMode?: boolean;
  targets?: UserState['targets'];
  userSupplements?: Array<{ name: string; serving?: string; frequency?: string }>;
  onTakeSupplement?: (name: string) => void;
  dailyHabits?: DailyHabitsData;
  onToggleHabit?: (habitId: string) => void;
  onAddCustomHabit?: (habit: Omit<DailyHabitItem, 'id' | 'completed' | 'completedAt'>) => void;
  onDeleteCustomHabit?: (habitId: string) => void;
  onForceMidnightReset?: () => void;
  habitsEnergyBoost?: number;
  userGoal?: string;
  userWeight?: number;
}

/**
 * Componente Dashboard principal con:
 * - Saludo e indicador visual dinámico de Racha
 * - Barra de Energía visual (progreso) para el cumplimiento diario con colores por nivel
 * - Componente DailyTasks con casillas de verificación
 * - Componente DailyHabits (Hábitos diarios no nutricionales con reseteo a medianoche)
 */
export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateTab,
  hydration,
  onAddWater,
  onReduceWater,
  xp,
  streakDays,
  protein,
  onAddProtein,
  macros,
  onAddMealEntry,
  onClaimReward,
  commitmentLevel,
  setCommitmentLevel,
  levelSelectedAt,
  levelGraceAvailable,
  nextLevelChangeAllowedAt,
  onOpenLevelModal,
  tasks,
  onToggleTask,
  energyPercent,
  isDark,
  syncStatus,
  onManualSync,
  userName = 'Atleta',
  firstDashboardSeen = true,
  onDismissFirstDashboard,
  dailyHistory = {},
  isDemoMode = false,
  targets,
  userSupplements,
  onTakeSupplement,
  dailyHabits,
  onToggleHabit,
  onAddCustomHabit,
  onDeleteCustomHabit,
  onForceMidnightReset,
  habitsEnergyBoost = 0,
  userGoal = 'Crear constancia',
  userWeight = 70,
}) => {
  const currentLevelConfig = LEVEL_CONFIGS[commitmentLevel] || LEVEL_CONFIGS.Avanzado;

  // Motor de personalización adaptativo por Objetivo y Nivel
  const personalized = useMemo(() => {
    return getPersonalizedContent(userGoal, commitmentLevel, userName, userWeight);
  }, [userGoal, commitmentLevel, userName, userWeight]);

  // Estado y referencia para la celebración del 100% de energía diaria
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);
  const celebrationTriggeredTodayRef = useRef<boolean>(false);

  // Efecto que detecta cuando el usuario alcanza el 100% de su energía diaria por primera vez en el día
  useEffect(() => {
    if (energyPercent >= 100) {
      const alreadyCelebrated = hasCelebratedEnergyToday(userName);
      if (!alreadyCelebrated && !celebrationTriggeredTodayRef.current) {
        celebrationTriggeredTodayRef.current = true;
        markCelebratedEnergyToday(userName);

        const timer = setTimeout(() => {
          triggerEnergyCelebrationConfetti();
          playCelebrationSound();
          setShowCelebrationModal(true);
        }, 350);
        return () => clearTimeout(timer);
      }
    }
  }, [energyPercent, userName]);

  // Dinámica de Racha: si todas las metas diarias están completadas
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const isAllTasksDone = tasks.length > 0 && completedTasksCount === tasks.length;
  const displayedStreak = isAllTasksDone ? streakDays + 1 : streakDays;

  const todayFormatted = new Intl.DateTimeFormat('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).format(new Date());

  return (
    <div className="flex flex-col w-full px-4 space-y-5 max-w-[1280px] mx-auto pb-24">
      {/* Modal de Celebración de 100% de Energía Diaria con Confeti */}
      <EnergyCelebrationModal
        isOpen={showCelebrationModal}
        onClose={() => setShowCelebrationModal(false)}
        userName={userName}
        streakDays={displayedStreak}
        completedTasksCount={completedTasksCount}
        totalTasksCount={tasks.length}
        commitmentLevel={commitmentLevel}
      />

      {/* Banner de Sincronización Offline / Supabase */}
      {(!syncStatus.isOnline || syncStatus.pendingCount > 0) && (
        <div
          className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all dark:bg-zinc-900/80 bg-slate-50 dark:border-white/10 border-slate-200 dark:text-zinc-300 text-slate-600"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] dark:text-zinc-400">
              {!syncStatus.isOnline ? 'cloud_off' : 'cloud_sync'}
            </span>
            <div>
              <p className="font-bold dark:text-zinc-200 text-slate-700">
                {!syncStatus.isOnline
                  ? 'Modo Offline Activo'
                  : `${syncStatus.pendingCount} registros listos para sincronizar`}
              </p>
              <p className="text-[11px] opacity-70">
                {!syncStatus.isOnline
                  ? 'Tus datos se guardan localmente y se sincronizarán en cuanto regrese la conexión.'
                  : 'Los datos locales se subirán a tu cuenta en la nube.'}
              </p>
            </div>
          </div>

          {syncStatus.isOnline && syncStatus.pendingCount > 0 && (
            <button
              type="button"
              onClick={onManualSync}
              disabled={syncStatus.isSyncing}
              className="px-3 py-1.5 rounded-lg dark:bg-white/10 bg-slate-200 hover:dark:bg-white/20 hover:bg-slate-300 dark:text-white text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 self-start sm:self-auto active:scale-95 disabled:opacity-50 border dark:border-white/15 border-slate-300 transition-all"
            >
              <span className={`material-symbols-outlined text-[15px] ${syncStatus.isSyncing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{syncStatus.isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}</span>
            </button>
          )}
        </div>
      )}

      {/* Banner de Bienvenida a Nuevo Usuario (Primer día) */}
      {!firstDashboardSeen && (
        <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-black border border-white/12 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-md">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Todo listo. Protocolo activado.</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-white/12 text-zinc-200 rounded-full border border-white/20">
                  Plan Inicial
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tu objetivo está configurado. Comienza tu primer día de protocolo.
              </p>
            </div>
          </div>
          {onDismissFirstDashboard && (
            <button
              type="button"
              onClick={onDismissFirstDashboard}
              className="px-4 py-2 rounded-xl bg-white text-black hover:bg-zinc-100 text-xs font-black transition-all shadow-md active:scale-95 whitespace-nowrap self-end sm:self-center"
            >
              Ver mis objetivos
            </button>
          )}
        </div>
      )}

      {/* 1. Saludo Inicial e Indicador Visual Dinámico de Racha Personalizado */}
      <section className="flex flex-col gap-2 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-label-caps text-label-caps dark:text-[#898a8c] text-slate-500 uppercase tracking-wider capitalize">
                {todayFormatted} · Telemetría Activa
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm"
                style={{
                  backgroundColor: `${personalized.modeBadgeColor}20`,
                  color: personalized.modeBadgeColor,
                  borderColor: `${personalized.modeBadgeColor}40`,
                }}
              >
                {personalized.modeBadge}
              </span>
            </div>
            <h1 className="font-headline-xl-mobile text-2xl sm:text-3xl font-bold dark:text-white text-slate-900 tracking-tight">
              {personalized.greeting}
            </h1>
            <p className="text-xs dark:text-zinc-400 text-slate-500 font-semibold tracking-wide mt-0.5">
              {personalized.homeSubtitle}
            </p>
          </div>

          {/* Indicador Visual Dinámico de Racha */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all shadow-sm ${
              isAllTasksDone
                ? 'bg-white/12 text-white border-white/25 ring-2 ring-white/15 shadow-[0_0_16px_rgba(255,255,255,0.12)]'
                : 'dark:bg-[#0a0a0a] bg-[#0a0a0a] dark:text-white text-slate-800 dark:border-white/10 border-slate-200'
            }`}
          >
            <span className="text-xl select-none">🔥</span>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-extrabold leading-none">
                {displayedStreak} días de racha
              </span>
              <span className="text-[10px] dark:text-zinc-400 text-slate-500 leading-none mt-0.5 font-medium">
                {isAllTasksDone ? '¡Meta de hoy sellada!' : `${completedTasksCount}/${tasks.length} metas listas`}
              </span>
            </div>
            {isAllTasksDone && (
              <span className="w-2 h-2 rounded-full bg-white/70 animate-ping"></span>
            )}
          </div>
        </div>

        {/* Alerta de Nivel Extremo o Avanzado si aplica */}
        {personalized.levelAlert && (
          <div
            className="p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 mt-1 animate-fadeIn"
            style={{
              backgroundColor: `${personalized.modeBadgeColor}15`,
              borderColor: `${personalized.modeBadgeColor}40`,
              color: personalized.modeBadgeColor,
            }}
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span>{personalized.levelAlert}</span>
          </div>
        )}

        {/* Nivel de Atleta y XP */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold uppercase border ${currentLevelConfig.badgeClass}`}>
            Nivel {currentLevelConfig.name}
          </span>
          <span className="dark:text-[#898a8c] text-slate-400">·</span>
          <span className="dark:text-zinc-400 text-slate-600 font-medium">{userGoal}</span>
          <span className="dark:text-[#898a8c] text-slate-400">·</span>
          <span className="font-bold dark:text-zinc-100 text-slate-800 inline-flex items-center">
            <AnimatedCounter
              value={xp}
              suffix=" XP"
              duration={850}
              className="font-bold dark:text-zinc-100 text-slate-800"
              deltaBadgeLabel="XP"
            />
          </span>
        </div>
      </section>

      {/* 2. Barra de Energía Visual (Progreso) para Cumplimiento Diario de Metas */}
      <section className="relative overflow-hidden rounded-2xl p-5 shadow-xl border dark:bg-[#0a0a0a] bg-white dark:border-white/10 border-slate-200 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ color: currentLevelConfig.barColor }}
            >
              bolt
            </span>
            <div>
              <h2 className="font-label-caps text-xs uppercase font-bold tracking-wider dark:text-[#898a8c] text-slate-500">
                ENERGÍA DEL DÍA · CUMPLIMIENTO DE METAS
              </h2>
              <span className="text-xs dark:text-slate-300 text-slate-600">
                Progreso metabólico calibrado al Nivel <strong>{currentLevelConfig.name}</strong>
              </span>
            </div>
          </div>

          {/* Indicador de Protocolo de Nivel y Cooldown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onOpenLevelModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all dark:bg-[#0a0a0a] bg-slate-100 hover:scale-[1.02] shadow-sm"
              style={{
                borderColor: `${currentLevelConfig.barColor}55`,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentLevelConfig.barColor }}
              />
              <span className="dark:text-white text-slate-800 font-extrabold">
                {commitmentLevel}
              </span>
              <span className="text-[10px] text-slate-400">· Protocolo</span>
              <span className="text-xs opacity-75">⚖️</span>
            </button>
          </div>
        </div>

        {/* Indicador numérico grande y barra visual de progreso */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <AnimatedCounter
                value={energyPercent}
                suffix="%"
                duration={850}
                className="text-3xl sm:text-4xl font-black dark:text-white text-slate-900 tracking-tight"
                deltaBadgeLabel="%"
                deltaBadgeClassName="bg-white text-black font-black"
              />
              <span className="text-xs sm:text-sm font-semibold dark:text-[#898a8c] text-slate-500 uppercase tracking-wide">
                Energía Diaria
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${currentLevelConfig.badgeClass} flex items-center gap-1.5`}
              >
                {energyPercent >= 100
                  ? '⚡ ¡Máxima Potencia 100%!'
                  : energyPercent >= 75
                  ? 'Zona Óptima'
                  : 'En Proceso'}
              </span>
              {habitsEnergyBoost > 0 && (
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-black bg-white/10 text-zinc-200 border border-white/18 flex items-center gap-1 shadow-sm"
                  title="Impulso sumado por tus Hábitos Diarios no nutricionales"
                >
                  <span>⚡</span>
                  <span>+{habitsEnergyBoost}% Hábitos</span>
                </span>
              )}
              {energyPercent >= 100 && (
                <button
                  type="button"
                  onClick={() => {
                    triggerEnergyCelebrationConfetti();
                    playCelebrationSound();
                    setShowCelebrationModal(true);
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                  title="Celebrar 100% de Energía Diaria"
                >
                  <span>🎉</span>
                  <span className="hidden sm:inline">Celebrar</span>
                </button>
              )}
            </div>
          </div>

          {/* Barra de progreso de Energía con los colores de nivel definidos */}
          <div
            className={`relative w-full h-4 rounded-full overflow-hidden dark:bg-[#0a0a0a] bg-slate-100 p-0.5 border transition-all ${
              energyPercent >= 100
                ? 'border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                : 'dark:border-white/10 border-slate-200'
            }`}
          >
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${currentLevelConfig.barGradient} shadow-md`}
              style={{ width: `${Math.min(100, Math.max(5, energyPercent))}%` }}
            >
              <div className="w-full h-full opacity-30 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]"></div>
            </div>
          </div>

          {/* Banner de Celebración de 100% de Energía Alcanzado */}
          {energyPercent >= 100 && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-white/5 via-white/8 to-white/5 border border-white/18 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/12 text-white border border-white/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-lg">🏆</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                    <span>¡100% de Energía Diaria Alcanzado hoy!</span>
                    <span className="text-[10px] px-2 py-0.5 bg-white/15 text-zinc-100 border border-white/20 rounded-full font-black">
                      Meta del Día Cumplida
                    </span>
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Has completado la totalidad de tu energía diaria programada para hoy.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    triggerEnergyCelebrationConfetti();
                    playCelebrationSound();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-100 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer whitespace-nowrap transition-all"
                >
                  <span>🎉</span>
                  <span>Lanzar Confeti</span>
                </button>
                {isDemoMode && (
                  <button
                    type="button"
                    onClick={() => {
                      resetCelebratedEnergyToday(userName);
                      triggerEnergyCelebrationConfetti();
                      playCelebrationSound();
                      setShowCelebrationModal(true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 font-medium text-[11px] border border-white/10 active:scale-95 whitespace-nowrap cursor-pointer"
                    title="Reiniciar registro de hoy para disparar como si fuera la primera vez del día"
                  >
                    Simular 1ra vez
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs dark:text-[#898a8c] text-slate-500 pt-1 flex-wrap gap-1">
            <span>
              {completedTasksCount} de {tasks.length} metas completas + Proteína ({protein}/{targets?.proteinGrams || 150}g)
              {habitsEnergyBoost > 0 && ` • +${habitsEnergyBoost}% Hábitos`}
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('estadisticas')}
              className="text-xs font-bold dark:text-zinc-300 text-slate-700 hover:dark:text-white hover:text-slate-900 hover:underline flex items-center gap-1 transition-colors"
            >
              <span>Ver estadísticas</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2.4. Desafío Activo Personalizado según Objetivo y Nivel */}
      <div className="rounded-2xl p-4 sm:p-5 border dark:bg-[#0a0a0a] bg-white dark:border-white/10 border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ backgroundColor: `${personalized.modeBadgeColor}25`, color: personalized.modeBadgeColor }}
          >
            <span className="material-symbols-outlined text-[22px]">military_tech</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold dark:text-white text-slate-900">
                {personalized.challengeTitle}
              </span>
              <span
                className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${personalized.modeBadgeColor}15`,
                  color: personalized.modeBadgeColor,
                  borderColor: `${personalized.modeBadgeColor}35`,
                }}
              >
                Nivel {commitmentLevel}
              </span>
            </div>
            <p className="text-xs dark:text-[#898a8c] text-slate-600">
              {personalized.challengeDescription}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenLevelModal}
          className="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto hover:bg-slate-100 dark:hover:bg-slate-800"
          style={{ borderColor: `${personalized.modeBadgeColor}50`, color: personalized.modeBadgeColor }}
        >
          Ajustar Protocolo
        </button>
      </div>

      {/* 2.45. Tip del Día y Cita del Coach Personalizados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl border dark:bg-[#0a0a0a] bg-white dark:border-white/10 border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center gap-1.5 dark:text-zinc-300 text-slate-600">
            <span className="material-symbols-outlined text-[18px]">lightbulb</span>
            <span className="text-[10px] font-black uppercase tracking-wider">
              Tip Diario · {userGoal}
            </span>
          </div>
          <p className="text-xs dark:text-zinc-200 text-slate-700 leading-relaxed font-medium">
            {personalized.dailyTip}
          </p>
        </div>

        <div className="p-4 rounded-2xl border dark:bg-[#0a0a0a] bg-white dark:border-white/10 border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center gap-1.5 dark:text-zinc-400 text-slate-500">
            <span className="material-symbols-outlined text-[18px]">format_quote</span>
            <span className="text-[10px] font-black uppercase tracking-wider">
              Cita del Coach
            </span>
          </div>
          <p className="text-xs italic dark:text-zinc-300 text-slate-600 leading-relaxed">
            {personalized.coachQuote}
          </p>
        </div>
      </div>

      {/* 2.5. Card Exclusiva del Nivel de Compromiso (Exigencias, reglas de Form y estado de cooldown) */}
      <LevelExclusivesCard
        level={commitmentLevel}
        levelSelectedAt={levelSelectedAt}
        levelGraceAvailable={levelGraceAvailable}
        nextLevelChangeAllowedAt={nextLevelChangeAllowedAt}
        onOpenLevelModal={onOpenLevelModal}
        completedTasksCount={completedTasksCount}
        totalTasksCount={tasks.length}
        formScore={energyPercent}
      />

      {/* 3. Componente DailyTasks con Casillas de Verificación y Opción de Deshacer */}
      <DailyTasks
        tasks={tasks}
        onToggleTask={onToggleTask}
        hydration={hydration}
        onAddWater={onAddWater}
        onReduceWater={onReduceWater}
        isDark={isDark}
      />

      {/* 3.5. Componente Daily Habits (Hábitos diarios no nutricionales con reseteo a medianoche) */}
      {dailyHabits && onToggleHabit && onAddCustomHabit && onDeleteCustomHabit && onForceMidnightReset && (
        <DailyHabits
          habitsData={dailyHabits}
          onToggleHabit={onToggleHabit}
          onAddCustomHabit={onAddCustomHabit}
          onDeleteCustomHabit={onDeleteCustomHabit}
          onForceMidnightReset={onForceMidnightReset}
          energyBoost={habitsEnergyBoost}
          isDark={isDark}
          isDemoMode={isDemoMode}
        />
      )}

      {/* 4. Sistema de Desafíos de Consistencia con Recompensas Animadas */}
      <ConsistencyChallenges
        streakDays={displayedStreak}
        tasks={tasks}
        hydration={hydration}
        protein={macros.protein}
        onClaimReward={onClaimReward}
        isDark={isDark}
      />

      {/* Resumen Gráfico del Cumplimiento de la Meta de Proteínas (Últimos 7 Días) */}
      <ProteinWeeklyChart
        currentProtein={protein}
        targetProtein={150}
        streakDays={streakDays}
        isDark={isDark}
        onNavigateNutrition={() => onNavigateTab('nutricion')}
        dailyHistory={dailyHistory}
        isDemoMode={isDemoMode}
      />

      {/* Módulo de Reposición Inteligente de Suplementos & Referidos */}
      <SupplementReplenishmentCard
        userName={userName}
        isDark={isDark}
        isDemoMode={isDemoMode}
        userSupplements={userSupplements}
        streakDays={streakDays}
        onTakeServing={onTakeSupplement}
        onNavigateTab={onNavigateTab}
      />

      {/* 7. Panel Exclusivo: Lo que vas sumando cada día con tu esfuerzo */}
      <section className="rounded-2xl p-5 border dark:bg-[#0a0a0a] bg-white dark:border-white/10 border-slate-200 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-zinc-200 border border-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">military_tech</span>
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold dark:text-white text-slate-900 flex items-center gap-2">
                Lo Que Vas Sumando Como Atleta
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/10 text-zinc-200 border border-white/15">
                  Progreso Real
                </span>
              </h2>
              <p className="text-xs dark:text-[#898a8c] text-slate-500">
                Cada día que no fallas tus tomas construyes tu ventaja competitiva.
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-white/8 text-zinc-300 border border-white/12">
            Comunidad MAX Suplementos
          </span>
        </div>

        {/* Cuadrícula de Métricas de Progreso Acumulado */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl dark:bg-[#0a0a0a] bg-slate-50 border dark:border-white/10 border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider dark:text-[#898a8c] text-slate-500 block">
              XP Total Sumado
            </span>
            <span className="text-lg font-black dark:text-white text-slate-900">
              +{xp} XP
            </span>
            <span className="text-[10px] dark:text-[#898a8c] text-slate-500 block mt-0.5">
              Por consistencia diaria
            </span>
          </div>

          <div className="p-3 rounded-xl dark:bg-[#0a0a0a] bg-slate-50 border dark:border-white/10 border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider dark:text-[#898a8c] text-slate-500 block">
              Racha Activa
            </span>
            <span className="text-lg font-black dark:text-zinc-200 text-slate-800">
              {displayedStreak} Días
            </span>
            <span className="text-[10px] dark:text-[#898a8c] text-slate-500 block mt-0.5">
              Sin saltarte tomas
            </span>
          </div>

          <div className="p-3 rounded-xl dark:bg-[#0a0a0a] bg-slate-50 border dark:border-white/10 border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider dark:text-[#898a8c] text-slate-500 block">
              Hidratación de Hoy
            </span>
            <span className="text-lg font-black dark:text-zinc-300 text-slate-700">
              {hydration.toFixed(1)} L
            </span>
            <span className="text-[10px] dark:text-[#898a8c] text-slate-500 block mt-0.5">
              Absorción óptima
            </span>
          </div>

          <div className="p-3 rounded-xl dark:bg-[#0a0a0a] bg-slate-50 border dark:border-white/10 border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider dark:text-[#898a8c] text-slate-500 block">
              Beneficio Exclusivo
            </span>
            <span className="text-lg font-black dark:text-zinc-100 text-slate-900">
              15% OFF
            </span>
            <span className="text-[10px] dark:text-[#898a8c] text-slate-500 block mt-0.5">
              En MAX Suplementos
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('inicio');
  const [aiPrompt, setAiPrompt] = useState<string | undefined>(undefined);

  // Hook de Instalación PWA (Descarga directa desde el navegador)
  const {
    isInstallable: isPwaInstallable,
    isInstalled: isPwaInstalled,
    isIos,
    showIosModal,
    setShowIosModal,
    triggerInstall,
  } = usePwaInstall();

  // Switch de Modo Claro / Modo Oscuro
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('maxform_theme');
    if (saved) return saved === 'dark';
    return true; // Por defecto modo oscuro atlético
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('maxform_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

  // Estado de usuario y autenticación
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => authService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState<boolean>(false);
  const [isAudioTranscriberOpen, setIsAudioTranscriberOpen] = useState<boolean>(false);

  // Modo Demo vs Modo Usuario Real (Por defecto FALSE -> Nuevo Usuario)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const user = authService.getCurrentUser();
    if (user) return false;
    const saved = localStorage.getItem('maxform_is_demo_mode');
    return saved === 'true';
  });

  // Estado del usuario activo (Por defecto estado limpio en cero absoluto para nuevos atletas)
  const [userState, setUserState] = useState<UserState>(() => {
    const user = authService.getCurrentUser();
    if (user) {
      return loadLocalUserState(user.uid, user.email, user.displayName);
    }
    return loadLocalUserState('new_athlete', '', 'Atleta');
  });

  // Limpieza inicial forzosa para garantizar arranque como Nuevo Usuario en esta sesión
  useEffect(() => {
    const isNewUserReady = localStorage.getItem('maxform_new_user_v4_ready');
    if (!isNewUserReady) {
      localStorage.setItem('maxform_is_demo_mode', 'false');
      localStorage.setItem('maxform_new_user_v4_ready', 'true');
      const freshUser = createCleanInitialUserState('new_athlete', '', 'Atleta');
      setUserState(freshUser);
      saveUserData(freshUser);
      setIsDemoMode(false);
      setIsOnboardingOpen(true);
    }
  }, []);

  // Escuchar cambios de sesión con authService
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        setIsDemoMode(false);
        localStorage.setItem('maxform_is_demo_mode', 'false');
        const local = loadLocalUserState(user.uid, user.email, user.displayName);
        setUserState(local);
        if (!local.onboardingCompleted) {
          setIsOnboardingOpen(true);
        }
        // Consulta remota complementaria
        loadUserData(user.uid, user.email, user.displayName).then((remote) => {
          if (remote) {
            setUserState(remote);
          }
        });
      }
    });
    return unsubscribe;
  }, []);

  // Forzar Onboarding si el atleta real no ha completado su configuración inicial
  useEffect(() => {
    if (!isDemoMode && !userState.onboardingCompleted) {
      setIsOnboardingOpen(true);
    }
  }, [isDemoMode, userState.onboardingCompleted]);

  // Valores derivados para consumo reactivo
  const userName = userState.name || 'Atleta';
  const xp = userState.xp;
  const streakDays = userState.streakDays;
  const hydration = userState.hydration;
  const protein = userState.protein;
  const macros = userState.macros;
  const tasks = userState.tasks;
  const commitmentLevel = userState.commitmentLevel;

  // Alternar entre Modo Demo y Usuario Real
  const handleToggleDemoMode = (targetDemoState?: boolean) => {
    const nextMode = targetDemoState !== undefined ? targetDemoState : !isDemoMode;
    setIsDemoMode(nextMode);
    localStorage.setItem('maxform_is_demo_mode', String(nextMode));

    if (nextMode) {
      // Activar Demo de Santiago
      setUserState(SANTIAGO_DEMO_STATE);
    } else {
      // Activar Cuenta Real / Nuevo Atleta
      if (currentUser) {
        const loaded = loadLocalUserState(currentUser.uid, currentUser.email, currentUser.displayName);
        setUserState(loaded);
        if (!loaded.onboardingCompleted) {
          setIsOnboardingOpen(true);
        }
      } else {
        const loaded = loadLocalUserState('new_athlete', '', 'Atleta');
        setUserState(loaded);
        if (!loaded.onboardingCompleted) {
          setIsOnboardingOpen(true);
        }
      }
    }
  };

  // Reiniciar la aplicación a un estado 100% limpio como nuevo usuario
  const handleResetToNewUser = () => {
    localStorage.removeItem('maxform_user_v2_new_athlete');
    localStorage.removeItem('maxform_onboarding_draft_new_athlete');
    localStorage.setItem('maxform_is_demo_mode', 'false');
    const freshUser = createCleanInitialUserState('new_athlete', '', 'Atleta');
    setUserState(freshUser);
    saveUserData(freshUser);
    setIsDemoMode(false);
    setIsOnboardingOpen(true);
  };

  // Finalización del Onboarding (Regla: Inicia siempre desde cero absoluto)
  const handleOnboardingComplete = (data: OnboardingProfileInput) => {
    setIsDemoMode(false);
    localStorage.setItem('maxform_is_demo_mode', 'false');

    const effectiveUid = currentUser?.uid || 'athlete_' + Date.now().toString(36);
    const baseState = currentUser 
      ? userState 
      : createCleanInitialUserState(effectiveUid, currentUser?.email || 'atleta@maxform.app', data.name || 'Atleta');

    const initialized = initializeUserFromOnboarding(baseState, data);
    setUserState(initialized);
    saveUserData(initialized);
    setIsOnboardingOpen(false);
  };

  const handleAuthSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setIsDemoMode(false);
    localStorage.setItem('maxform_is_demo_mode', 'false');
    const loaded = loadLocalUserState(user.uid, user.email, user.displayName);
    setUserState(loaded);
    setIsAuthModalOpen(false);
    if (!loaded.onboardingCompleted) {
      setIsOnboardingOpen(true);
    }
  };

  const handleUpdateAvatar = (avatarUrl: string | null) => {
    setUserState((prev) => {
      const updated = { ...prev, avatarUrl: avatarUrl || undefined, updatedAt: new Date().toISOString() };
      saveUserData(updated);
      return updated;
    });
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsDemoMode(false);
    localStorage.setItem('maxform_is_demo_mode', 'false');
    const freshUser = createCleanInitialUserState('new_athlete', '', 'Atleta');
    setUserState(freshUser);
    saveUserData(freshUser);
  };

  const handleDeleteAccount = () => {
    if (currentUser) {
      deleteUserData(currentUser.uid);
      authService.deleteAccount(currentUser.uid);
      setCurrentUser(null);
      setIsDemoMode(false);
      localStorage.setItem('maxform_is_demo_mode', 'false');
      const freshUser = createCleanInitialUserState('new_athlete', '', 'Atleta');
      setUserState(freshUser);
      saveUserData(freshUser);
    }
  };

  // Estado de sincronización Offline y Supabase
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => offlineSync.getStatus());

  useEffect(() => {
    const unsubscribe = offlineSync.subscribe((status) => {
      setSyncStatus(status);
    });
    return unsubscribe;
  }, []);

  // Referencia mutable al estado local para evitar cierres obsoletos en reconciliador
  const localStateRef = useRef<LocalAthleteState>({
    hydration: userState.hydration,
    protein: userState.protein,
    xp: userState.xp,
    streakDays: userState.streakDays,
    commitmentLevel: userState.commitmentLevel,
    tasks: userState.tasks,
    macros: userState.macros,
    lastUpdated: Date.now(),
  });

  useEffect(() => {
    localStateRef.current = {
      hydration: userState.hydration,
      protein: userState.protein,
      xp: userState.xp,
      streakDays: userState.streakDays,
      commitmentLevel: userState.commitmentLevel,
      tasks: userState.tasks,
      macros: userState.macros,
      lastUpdated: Date.now(),
    };
  }, [userState]);

  // Notificación de reconciliación de datos
  const [reconciliationNotice, setReconciliationNotice] = useState<{
    message: string;
    details?: string[];
  } | null>(null);

  // Manejador central de resolución de conflictos y reconciliación con Supabase PostgreSQL
  const reconcileWithSupabase = useCallback(
    async (
      trigger: 'initial' | 'online' | 'manual' | 'snapshot',
      forcedSnapshot?: any
    ): Promise<boolean> => {
      try {
        const user = await ensureAuthUser();
        const userId = currentUser ? currentUser.uid : (user?.id || 'guest_athlete');

        let remoteData = forcedSnapshot;
        if (!remoteData) {
          remoteData = await supabaseRepository.loadAthleteState(userId);
        }

        if (!remoteData) {
          console.log('[Reconciliación MAXFORM] No hay snapshot remoto en Supabase; preservando estado local.');
          return false;
        }

        const currentLocal = localStateRef.current;
        const pendingQueue = offlineSync.getQueue();

        // Ejecutar motor de reconciliación
        const result = reconcileAthleteData(currentLocal, remoteData, pendingQueue);

        if (result.hadConflicts || trigger === 'initial' || trigger === 'online') {
          const { merged } = result;

          setUserState((prev) => {
            const nextForm = calculateDailyForm(
              merged.tasks.filter((t) => t.completed).length,
              merged.tasks.length
            );
            const updated: UserState = {
              ...prev,
              hydration: merged.hydration,
              protein: merged.protein,
              xp: merged.xp,
              streakDays: merged.streakDays,
              commitmentLevel: merged.commitmentLevel,
              tasks: merged.tasks,
              macros: merged.macros,
              formScore: nextForm,
            };
            if (!isDemoMode && currentUser) {
              saveUserData(updated);
            }
            return updated;
          });

          // Escribir el estado unificado y libre de conflictos a Supabase PostgreSQL
          await supabaseRepository.saveAthleteState({
            ...currentLocal,
            ...merged,
            userId,
          });

          // Limpiar cola pendiente puesto que sus deltas ya fueron consolidados en el snapshot
          if (pendingQueue.length > 0) {
            offlineSync.clearQueue();
          }

          if (result.hadConflicts) {
            setReconciliationNotice({
              message: result.summary,
              details: result.resolutions,
            });
            setTimeout(() => {
              setReconciliationNotice(null);
            }, 7000);
          }

          return true;
        }

        return false;
      } catch (err) {
        console.warn('[Reconciliación MAXFORM] Error al sincronizar con Supabase:', err);
        return false;
      }
    },
    [currentUser, isDemoMode]
  );

  // Sincronización y reconciliación manual iniciada por el usuario
  const handleManualSync = useCallback(async () => {
    await reconcileWithSupabase('manual');
    await offlineSync.syncPendingActions();
  }, [reconcileWithSupabase]);

  // Suscripción al recuperador de red (evento 'online' del navegador)
  useEffect(() => {
    const unregister = offlineSync.registerReconciler(async () => {
      console.log('[MAXFORM] Red recuperada: ejecutando reconciliador contra Supabase...');
      await reconcileWithSupabase('online');
    });

    return unregister;
  }, [reconcileWithSupabase]);

  // Listener en tiempo real de Supabase (Postgres Changes) para recibir cambios externos
  useEffect(() => {
    const userId = currentUser ? currentUser.uid : (isDemoMode ? 'santiago-athlete-01' : 'guest_athlete');
    const unsubscribe = supabaseRepository.subscribeToAthleteChanges(userId, (remoteData) => {
      reconcileWithSupabase('snapshot', remoteData);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [reconcileWithSupabase, currentUser, isDemoMode]);

  // Cargar estado inicial y reconciliar con Supabase
  useEffect(() => {
    reconcileWithSupabase('initial');
  }, [reconcileWithSupabase]);

  // Cambio y recalibración de nivel de compromiso bajo protocolo de 14 días
  const handleConfirmLevelChange = (newLvl: CommitmentLevel) => {
    // 1. Verificar cooldown y oportunidad de gracia
    const cooldown = checkLevelCooldown(
      userState.levelSelectedAt,
      userState.levelGraceAvailable,
      userState.nextLevelChangeAllowedAt
    );
    if (!cooldown.isAllowed) {
      return;
    }

    // 2. Recalibrar objetivos y metas nutricionales con el nuevo nivel
    const input: OnboardingProfileInput = userState.onboardingData || {
      name: userState.name || 'Atleta',
      gender: 'Hombre',
      main_goal: 'Recomposición corporal',
      experience_level: newLvl,
      weight: userState.biometrics?.weightKg || 75,
      height: userState.biometrics?.heightCm || 175,
      age: userState.biometrics?.age || 26,
      training_type: 'Gimnasio',
      training_days_per_week: newLvl === 'Básico' ? 3 : newLvl === 'Intermedio' ? 4 : 5,
      diet_type: 'Omnívora',
      supplements: [],
      supplement_timing: 'Mañana',
    };

    const updatedInput: OnboardingProfileInput = {
      ...input,
      experience_level: newLvl,
    };

    const generated = generatePersonalizedObjectives(updatedInput);
    const completedCount = generated.dailyObjectives.filter((t) => t.completed).length;
    const formScore = calculateDailyForm(completedCount, generated.dailyObjectives.length);

    const now = new Date();
    const nextAllowed = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const updated: UserState = {
      ...userState,
      commitmentLevel: newLvl,
      levelSelectedAt: now.toISOString(),
      levelGraceAvailable: false, // Consumida la oportunidad libre tras el primer cambio
      nextLevelChangeAllowedAt: nextAllowed,
      tasks: generated.dailyObjectives,
      macros: userState.macros,
      targets: {
        hydrationLiters: generated.hydrationTargetLiters,
        proteinGrams: generated.proteinTargetGrams,
        carbsGrams: generated.macros.carbs,
        fatsGrams: generated.macros.fats,
        calories: generated.calorieTarget,
      },
      onboardingData: updatedInput,
      formScore,
      completedObjectives: completedCount,
      updatedAt: now.toISOString(),
    };

    setUserState(updated);
    if (!isDemoMode) {
      saveUserData(updated);
    }
  };

  // Modificación administrativa directa del perfil de atleta (Objetivo + Nivel de Desafío)
  const handleAdminUpdateUserProfile = (newGoal: string, newLvl: CommitmentLevel) => {
    const input: OnboardingProfileInput = userState.onboardingData || {
      name: userState.name || 'Atleta',
      gender: 'Hombre',
      primary_goal: newGoal,
      experience_level: newLvl,
      weight: userState.biometrics?.weightKg || 75,
      height: userState.biometrics?.heightCm || 175,
      age: userState.biometrics?.age || 26,
      training_frequency: newLvl === 'Básico' ? '3 veces por semana' : newLvl === 'Intermedio' ? '4 veces por semana' : '5 veces por semana',
      dietary_preferences: 'Equilibrada',
      supplements: [],
    };

    const updatedInput: OnboardingProfileInput = {
      ...input,
      primary_goal: newGoal,
      experience_level: newLvl,
    };

    const generated = generatePersonalizedObjectives(updatedInput);
    const completedCount = generated.dailyObjectives.filter((t) => t.completed).length;
    const formScore = calculateDailyForm(completedCount, generated.dailyObjectives.length);
    const now = new Date();

    const updated: UserState = {
      ...userState,
      commitmentLevel: newLvl,
      tasks: generated.dailyObjectives,
      macros: userState.macros,
      targets: {
        hydrationLiters: generated.hydrationTargetLiters,
        proteinGrams: generated.proteinTargetGrams,
        carbsGrams: generated.macros.carbs,
        fatsGrams: generated.macros.fats,
        calories: generated.calorieTarget,
      },
      onboardingData: updatedInput,
      formScore,
      completedObjectives: completedCount,
      updatedAt: now.toISOString(),
    };

    setUserState(updated);
    if (!isDemoMode) {
      saveUserData(updated);
    }
  };

  // Manejador para alternar tareas diarias
  const handleToggleTask = (taskId: string) => {
    const nextTasks = userState.tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    const toggled = nextTasks.find((t) => t.id === taskId);
    const completedCount = nextTasks.filter((t) => t.completed).length;
    const nextForm = calculateDailyForm(completedCount, nextTasks.length);

    let nextXp = userState.xp;
    let nextHydration = userState.hydration;

    if (toggled) {
      if (toggled.completed) {
        nextXp += toggled.xpReward;
        if (taskId === 'agua' && userState.targets?.hydrationLiters) {
          nextHydration = Math.max(userState.hydration, userState.targets.hydrationLiters);
        }
      } else {
        nextXp = Math.max(0, nextXp - toggled.xpReward);
      }
    }

    let nextStreak = userState.streakDays;
    let nextDates = [...(userState.activityDates || [])];
    const todayStr = new Date().toISOString().split('T')[0];

    if (nextForm >= 80 && !nextDates.includes(todayStr)) {
      nextDates.push(todayStr);
      nextStreak = calculateStreak(nextDates);
    } else if (nextForm < 80 && nextDates.includes(todayStr)) {
      nextDates = nextDates.filter((d) => d !== todayStr);
      nextStreak = calculateStreak(nextDates);
    }

    const updated: UserState = {
      ...userState,
      tasks: nextTasks,
      xp: nextXp,
      hydration: nextHydration,
      formScore: nextForm,
      streakDays: nextStreak,
      activityDates: nextDates,
      completedObjectives: completedCount,
      lastActiveDate: todayStr,
    };

    setUserState(updated);
    if (!isDemoMode && currentUser) saveUserData(updated);

    offlineSync.queueAction('TASK_UPDATE', {
      taskId,
      completed: toggled ? toggled.completed : false,
      timestamp: Date.now(),
    });
  };

  // Añadir agua (+250ml)
  const handleAddWater = () => {
    const target = userState.targets?.hydrationLiters || 3.0;
    const nextWater = Math.min(target + 1.0, +(userState.hydration + 0.25).toFixed(2));
    const isDone = nextWater >= target;
    const nextTasks = userState.tasks.map((t) => {
      if (t.id === 'agua') {
        return {
          ...t,
          completed: isDone,
          detail: `${nextWater.toFixed(1).replace('.', ',')} L registrados hoy`,
        };
      }
      return t;
    });
    const completedCount = nextTasks.filter((t) => t.completed).length;
    const nextForm = calculateDailyForm(completedCount, nextTasks.length);

    const todayIso = new Date().toISOString().slice(0, 10);
    const nextHydrationHistory = {
      ...(userState.hydrationHistory || {}),
      [todayIso]: nextWater,
    };

    const updated: UserState = {
      ...userState,
      hydration: nextWater,
      hydrationHistory: nextHydrationHistory,
      tasks: nextTasks,
      formScore: nextForm,
      completedObjectives: completedCount,
    };
    setUserState(updated);
    if (!isDemoMode && currentUser) saveUserData(updated);

    offlineSync.queueAction('STATE_FULL', {
      hydration: nextWater,
      hydrationHistory: nextHydrationHistory,
      tasks: nextTasks,
      timestamp: Date.now(),
    });
  };

  const lastProteinTapRef = useRef<number>(0);

  // Añadir proteína directa con protección anti-spam y persistencia en dailyHistory
  const handleAddProtein = (amount: number) => {
    const now = Date.now();
    // Bloquear spam clicks consecutivos menores a 350ms
    if (now - lastProteinTapRef.current < 350) {
      return;
    }
    lastProteinTapRef.current = now;

    const target = userState.targets?.proteinGrams || 150;
    const nextProtein = Math.min(350, userState.protein + amount);
    const nextMacros: MacroNutrients = {
      ...userState.macros,
      protein: nextProtein,
      calories: userState.macros.calories + amount * 4,
    };
    const isDone = nextProtein >= target;
    const nextTasks = userState.tasks.map((t) => {
      if (t.id === 'nutricion') {
        return {
          ...t,
          completed: isDone,
          detail: `${nextProtein}g de ${target}g meta alcanzada`,
        };
      }
      return t;
    });
    const completedCount = nextTasks.filter((t) => t.completed).length;
    const nextForm = calculateDailyForm(completedCount, nextTasks.length);

    // Registro histórico del día de hoy en formato ISO YYYY-MM-DD
    const todayIso = new Date().toISOString().slice(0, 10);
    const nextDailyHistory = {
      ...(userState.dailyHistory || {}),
      [todayIso]: nextProtein,
    };

    const updated: UserState = {
      ...userState,
      protein: nextProtein,
      macros: nextMacros,
      tasks: nextTasks,
      formScore: nextForm,
      completedObjectives: completedCount,
      dailyHistory: nextDailyHistory,
    };
    setUserState(updated);
    if (!isDemoMode && currentUser) saveUserData(updated);

    offlineSync.queueAction('MACROS_UPDATE', {
      amount,
      macros: nextMacros,
      protein: nextProtein,
      dailyHistory: nextDailyHistory,
      timestamp: Date.now(),
    });
  };

  // Añadir entrada de comida con macros completos
  const handleAddMealEntry = (meal: {
    name: string;
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  }) => {
    const target = userState.targets?.proteinGrams || 150;
    const nextProtein = Math.min(300, userState.protein + meal.protein);
    const nextMacros: MacroNutrients = {
      protein: nextProtein,
      carbs: userState.macros.carbs + meal.carbs,
      fats: userState.macros.fats + meal.fats,
      calories: userState.macros.calories + meal.calories,
    };
    const isDone = nextProtein >= target;
    const nextTasks = userState.tasks.map((t) => {
      if (t.id === 'nutricion') {
        return {
          ...t,
          completed: isDone,
          detail: `${nextProtein}g de ${target}g meta alcanzada`,
        };
      }
      return t;
    });
    const completedCount = nextTasks.filter((t) => t.completed).length;
    const nextForm = calculateDailyForm(completedCount, nextTasks.length);

    const newFood = {
      id: 'meal_' + Date.now(),
      name: meal.name,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      calories: meal.calories,
      timestamp: Date.now(),
    };

    const updated: UserState = {
      ...userState,
      protein: nextProtein,
      macros: nextMacros,
      tasks: nextTasks,
      formScore: nextForm,
      completedObjectives: completedCount,
      foodHistory: [newFood, ...(userState.foodHistory || [])],
    };
    setUserState(updated);
    if (!isDemoMode && currentUser) saveUserData(updated);

    offlineSync.saveLocalFoodLog({
      id: newFood.id,
      name: meal.name,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      calories: meal.calories,
      timestamp: new Date().toISOString(),
      synced: false,
    });

    offlineSync.queueAction('FOOD_LOG', {
      mealName: meal.name,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      calories: meal.calories,
      timestamp: Date.now(),
    });
  };

  // Reducir agua si el usuario se equivocó (-250ml)
  const handleReduceWater = (amount = 0.25) => {
    const target = userState.targets?.hydrationLiters || 3.0;
    const nextWater = Math.max(0, +(userState.hydration - amount).toFixed(2));
    const isDone = nextWater >= target;
    const nextTasks = userState.tasks.map((t) => {
      if (t.id === 'agua') {
        return {
          ...t,
          completed: isDone,
          detail: `${nextWater.toFixed(1).replace('.', ',')} L registrados hoy`,
        };
      }
      return t;
    });
    const completedCount = nextTasks.filter((t) => t.completed).length;
    const nextForm = calculateDailyForm(completedCount, nextTasks.length);
    const todayIso = new Date().toISOString().slice(0, 10);
    const nextHydrationHistory = {
      ...(userState.hydrationHistory || {}),
      [todayIso]: nextWater,
    };

    const updated: UserState = {
      ...userState,
      hydration: nextWater,
      hydrationHistory: nextHydrationHistory,
      tasks: nextTasks,
      formScore: nextForm,
      completedObjectives: completedCount,
    };
    setUserState(updated);
    if (!isDemoMode && currentUser) saveUserData(updated);
  };

  // Reducir proteína si el usuario sumó de más
  const handleReduceProtein = (amount: number) => {
    const target = userState.targets?.proteinGrams || 150;
    const nextProtein = Math.max(0, userState.protein - amount);
    const nextMacros: MacroNutrients = {
      ...userState.macros,
      protein: nextProtein,
      calories: Math.max(0, userState.macros.calories - amount * 4),
    };
    const isDone = nextProtein >= target;
    const nextTasks = userState.tasks.map((t) => {
      if (t.id === 'nutricion') {
        return {
          ...t,
          completed: isDone,
          detail: `${nextProtein}g de ${target}g meta alcanzada`,
        };
      }
      return t;
    });
    const completedCount = nextTasks.filter((t) => t.completed).length;
    const nextForm = calculateDailyForm(completedCount, nextTasks.length);

    const todayIso = new Date().toISOString().slice(0, 10);
    const nextDailyHistory = {
      ...(userState.dailyHistory || {}),
      [todayIso]: nextProtein,
    };

    const updated: UserState = {
      ...userState,
      protein: nextProtein,
      macros: nextMacros,
      tasks: nextTasks,
      formScore: nextForm,
      completedObjectives: completedCount,
      dailyHistory: nextDailyHistory,
    };
    setUserState(updated);
    if (!isDemoMode && currentUser) saveUserData(updated);
  };

  // Deshacer / eliminar una comida registrada por error
  const handleDeleteMealEntry = (mealId: string) => {
    const targetMeal = (userState.foodHistory || []).find((m) => m.id === mealId);
    const nextHistory = (userState.foodHistory || []).filter((m) => m.id !== mealId);

    const target = userState.targets?.proteinGrams || 150;
    const removedProtein = targetMeal ? targetMeal.protein : 0;
    const removedCarbs = targetMeal ? (targetMeal.carbs || 0) : 0;
    const removedFats = targetMeal ? (targetMeal.fats || 0) : 0;
    const removedCalories = targetMeal ? (targetMeal.calories || 0) : 0;

    const nextProtein = Math.max(0, userState.protein - removedProtein);
    const nextMacros: MacroNutrients = {
      protein: nextProtein,
      carbs: Math.max(0, userState.macros.carbs - removedCarbs),
      fats: Math.max(0, userState.macros.fats - removedFats),
      calories: Math.max(0, userState.macros.calories - removedCalories),
    };

    const isDone = nextProtein >= target;
    const nextTasks = userState.tasks.map((t) => {
      if (t.id === 'nutricion') {
        return {
          ...t,
          completed: isDone,
          detail: `${nextProtein}g de ${target}g meta alcanzada`,
        };
      }
      return t;
    });
    const completedCount = nextTasks.filter((t) => t.completed).length;
    const nextForm = calculateDailyForm(completedCount, nextTasks.length);

    const todayIso = new Date().toISOString().slice(0, 10);
    const nextDailyHistory = {
      ...(userState.dailyHistory || {}),
      [todayIso]: nextProtein,
    };

    const updated: UserState = {
      ...userState,
      protein: nextProtein,
      macros: nextMacros,
      tasks: nextTasks,
      formScore: nextForm,
      completedObjectives: completedCount,
      foodHistory: nextHistory,
      dailyHistory: nextDailyHistory,
    };
    setUserState(updated);
    if (!isDemoMode && currentUser) saveUserData(updated);
  };

  // Calibrar directamente los valores totales del día si hubo errores mayores
  const handleUpdateDirectIntake = (newProtein: number, newHydration: number) => {
    const proteinTarget = userState.targets?.proteinGrams || 150;
    const waterTarget = userState.targets?.hydrationLiters || 3.0;

    const isProteinDone = newProtein >= proteinTarget;
    const isWaterDone = newHydration >= waterTarget;

    const nextTasks = userState.tasks.map((t) => {
      if (t.id === 'nutricion') {
        return {
          ...t,
          completed: isProteinDone,
          detail: `${newProtein}g de ${proteinTarget}g meta alcanzada`,
        };
      }
      if (t.id === 'agua') {
        return {
          ...t,
          completed: isWaterDone,
          detail: `${newHydration.toFixed(1).replace('.', ',')} L registrados hoy`,
        };
      }
      return t;
    });

    const completedCount = nextTasks.filter((t) => t.completed).length;
    const nextForm = calculateDailyForm(completedCount, nextTasks.length);

    const todayIso = new Date().toISOString().slice(0, 10);
    const nextDailyHistory = {
      ...(userState.dailyHistory || {}),
      [todayIso]: newProtein,
    };
    const nextHydrationHistory = {
      ...(userState.hydrationHistory || {}),
      [todayIso]: newHydration,
    };

    const nextMacros: MacroNutrients = {
      ...userState.macros,
      protein: newProtein,
      calories: Math.max(0, userState.macros.calories + (newProtein - userState.protein) * 4),
    };

    const updated: UserState = {
      ...userState,
      protein: newProtein,
      hydration: newHydration,
      macros: nextMacros,
      tasks: nextTasks,
      formScore: nextForm,
      completedObjectives: completedCount,
      dailyHistory: nextDailyHistory,
      hydrationHistory: nextHydrationHistory,
    };
    setUserState(updated);
    if (!isDemoMode && currentUser) saveUserData(updated);
  };

  // Reclamar recompensa de desafío de consistencia
  const handleClaimReward = (rewardXp: number, challengeTitle: string) => {
    const nextXp = userState.xp + rewardXp;
    const updated: UserState = {
      ...userState,
      xp: nextXp,
      challengesCompleted: (userState.challengesCompleted || 0) + 1,
    };
    setUserState(updated);
    if (!isDemoMode && currentUser) saveUserData(updated);

    offlineSync.queueAction('CHALLENGE_CLAIM', {
      challengeTitle,
      rewardXp,
      timestamp: Date.now(),
    });
  };

  // Manejo de toma de suplemento real
  const handleTakeSupplement = (supplementName: string) => {
    const suppTask = userState.tasks.find(
      (t) => t.id === 'suplemento' || t.id.toLowerCase().includes('suplement')
    );
    if (suppTask && !suppTask.completed) {
      handleToggleTask(suppTask.id);
    }

    const nowIso = new Date().toISOString();
    const newEntry = {
      id: `supp_${Date.now()}`,
      name: supplementName,
      timestamp: nowIso,
    };
    const nextHistory = [...(userState.supplementHistory || []), newEntry];
    const updatedState: UserState = {
      ...userState,
      supplementHistory: nextHistory,
    };
    setUserState(updatedState);
    if (!isDemoMode && currentUser) saveUserData(updatedState);

    fetch('/api/supplements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userState.userId,
        supplementName,
        servingsUsed: 1,
        timestamp: nowIso,
      }),
    }).catch(() => {
      // offline fallback
    });
  };

  const handleDismissFirstDashboard = () => {
    const updated: UserState = {
      ...userState,
      firstDashboardSeen: true,
    };
    setUserState(updated);
    if (!isDemoMode && currentUser) saveUserData(updated);
  };

  const handleNavigateTab = (tab: string, prompt?: string) => {
    if (prompt) setAiPrompt(prompt);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reseteo automático de medianoche para Hábitos Diarios
  useEffect(() => {
    // 1. Validar al montar o reanudar
    const { habitsData, wasReset } = ensureHabitsAreCurrent(userState.dailyHabits);
    if (wasReset) {
      setUserState((prev) => {
        const nextState = { ...prev, dailyHabits: habitsData };
        if (!isDemoMode && currentUser) saveUserData(nextState);
        return nextState;
      });
    }

    // 2. Programar temporizador para la medianoche exacta
    const msUntilMidnight = getMillisecondsUntilMidnight();
    const midnightTimer = setTimeout(() => {
      console.log('[MAXFORM] Medianoche alcanzada: reseteando Hábitos Diarios automáticamente');
      setUserState((prev) => {
        const currentHabits = prev.dailyHabits || {
          lastResetDate: '',
          habits: DEFAULT_DAILY_HABITS,
        };
        const resetData = forceMidnightReset(currentHabits);
        const nextState = { ...prev, dailyHabits: resetData };
        if (!isDemoMode && currentUser) saveUserData(nextState);
        return nextState;
      });
    }, msUntilMidnight);

    // 3. Intervalo de seguridad cada minuto por si el equipo se suspendió durante la medianoche
    const safetyCheck = setInterval(() => {
      const todayStr = getTodayLocalDateString();
      if (userState.dailyHabits && userState.dailyHabits.lastResetDate !== todayStr) {
        setUserState((prev) => {
          const { habitsData } = ensureHabitsAreCurrent(prev.dailyHabits);
          const nextState = { ...prev, dailyHabits: habitsData };
          if (!isDemoMode && currentUser) saveUserData(nextState);
          return nextState;
        });
      }
    }, 60000);

    return () => {
      clearTimeout(midnightTimer);
      clearInterval(safetyCheck);
    };
  }, [userState.dailyHabits?.lastResetDate, isDemoMode, currentUser]);

  // Manejador para alternar el estado de un hábito diario
  const handleToggleDailyHabit = (habitId: string) => {
    const currentData = ensureHabitsAreCurrent(userState.dailyHabits).habitsData;
    let xpDelta = 0;

    const nextHabits = currentData.habits.map((habit) => {
      if (habit.id === habitId) {
        const nextCompleted = !habit.completed;
        xpDelta = nextCompleted ? habit.xpReward : -habit.xpReward;
        return {
          ...habit,
          completed: nextCompleted,
          completedAt: nextCompleted
            ? new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            : undefined,
        };
      }
      return habit;
    });

    const nextXp = Math.max(0, userState.xp + xpDelta);

    const updatedData: DailyHabitsData = {
      ...currentData,
      habits: nextHabits,
      totalCompletedAllTime: (currentData.totalCompletedAllTime || 0) + (xpDelta > 0 ? 1 : 0),
    };

    const updatedState: UserState = {
      ...userState,
      xp: nextXp,
      dailyHabits: updatedData,
    };

    setUserState(updatedState);
    if (!isDemoMode && currentUser) saveUserData(updatedState);

    offlineSync.queueAction('DAILY_HABIT_TOGGLE', {
      habitId,
      timestamp: Date.now(),
      xpDelta,
    });
  };

  // Manejador para añadir un hábito personalizado
  const handleAddCustomHabit = (newHabit: Omit<DailyHabitItem, 'id' | 'completed' | 'completedAt'>) => {
    const currentData = ensureHabitsAreCurrent(userState.dailyHabits).habitsData;
    const customItem: DailyHabitItem = {
      ...newHabit,
      id: `custom_habit_${Date.now()}`,
      completed: false,
      isCustom: true,
    };

    const updatedData: DailyHabitsData = {
      ...currentData,
      habits: [...currentData.habits, customItem],
    };

    const updatedState: UserState = {
      ...userState,
      dailyHabits: updatedData,
    };

    setUserState(updatedState);
    if (!isDemoMode && currentUser) saveUserData(updatedState);
  };

  // Manejador para eliminar un hábito personalizado
  const handleDeleteCustomHabit = (habitId: string) => {
    const currentData = ensureHabitsAreCurrent(userState.dailyHabits).habitsData;
    const updatedData: DailyHabitsData = {
      ...currentData,
      habits: currentData.habits.filter((h) => h.id !== habitId),
    };

    const updatedState: UserState = {
      ...userState,
      dailyHabits: updatedData,
    };

    setUserState(updatedState);
    if (!isDemoMode && currentUser) saveUserData(updatedState);
  };

  // Forzar reseteo de medianoche manual para testing/demo
  const handleForceMidnightReset = () => {
    const currentData = ensureHabitsAreCurrent(userState.dailyHabits).habitsData;
    const resetData = forceMidnightReset(currentData);

    const updatedState: UserState = {
      ...userState,
      dailyHabits: resetData,
    };

    setUserState(updatedState);
    if (!isDemoMode && currentUser) saveUserData(updatedState);
  };

  // Cálculo de Energía del Día (Progreso en %) potenciado por Hábitos Diarios
  const { baseEnergyPercent, habitsEnergyBoost, energyPercent } = useMemo(() => {
    const completedCount = tasks.filter((t) => t.completed).length;
    const tasksScore = tasks.length > 0 ? (completedCount / tasks.length) * 80 : 0;
    const targetProt = userState.targets?.proteinGrams || 150;
    const proteinRatio = Math.min(1, protein / (targetProt || 150));
    const proteinScore = proteinRatio * 20;
    const base = Math.round(tasksScore + proteinScore);

    const habits = userState.dailyHabits?.habits || [];
    const habitsBoost = calculateHabitsEnergyBoost(habits);

    // Los hábitos diarios potencian de forma directa y visible el puntaje de energía del día
    const total = Math.min(100, Math.round(base + habitsBoost));
    return {
      baseEnergyPercent: base,
      habitsEnergyBoost: habitsBoost,
      energyPercent: total,
    };
  }, [tasks, protein, userState.targets, userState.dailyHabits]);

  return (
    <div className="min-h-screen dark:bg-[#0a0a0a] bg-slate-50 dark:text-[#d6d6d6] text-slate-800 flex flex-col selection:bg-[#0a0a0a] selection:text-white transition-colors duration-200">
      {/* Barra de Navegación Superior Fija con Switch de Modo Claro/Oscuro y Demo Toggle */}
      <Header
        currentTab={currentTab}
        onProfileClick={() => handleNavigateTab('perfil')}
        streakDays={streakDays}
        isDark={isDark}
        onToggleDark={toggleDarkMode}
        syncStatus={syncStatus}
        onManualSync={handleManualSync}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => handleToggleDemoMode()}
        userName={userName}
        userAvatar={userState.avatarUrl}
        onOpenAudioTranscriber={() => setIsAudioTranscriberOpen(true)}
        onDownloadApp={triggerInstall}
        isAppInstalled={isPwaInstalled}
      />

      {/* Contenido Principal */}
      <main className="flex-1 w-full pt-20 flex flex-col items-center">
        {/* Banner de Reconciliación Inteligente Offline/Supabase */}
        {reconciliationNotice && (
          <div className="mx-4 my-2.5 max-w-4xl w-[calc(100%-2rem)] p-3.5 bg-white/80 dark:bg-[#0a0a0a]/90 border border-white/40 rounded-2xl shadow-xl backdrop-blur-md flex items-start justify-between gap-3 text-white transition-all animate-fadeIn z-30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#0a0a0a] flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-md shadow-black/20">
                <span className="material-symbols-outlined text-[20px]">published_with_changes</span>
              </div>
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white tracking-wide">
                    Reconciliación de Datos Exitosa
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Sin Sobrescritura
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {reconciliationNotice.message}
                </p>
                {reconciliationNotice.details && reconciliationNotice.details.length > 0 && (
                  <ul className="text-[11px] text-white/80 space-y-0.5 list-disc list-inside pt-1 font-medium">
                    {reconciliationNotice.details.slice(0, 3).map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReconciliationNotice(null)}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              aria-label="Cerrar notificación"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {currentTab === 'inicio' && (
          <Dashboard
            onNavigateTab={handleNavigateTab}
            hydration={hydration}
            onAddWater={handleAddWater}
            onReduceWater={handleReduceWater}
            xp={xp}
            streakDays={streakDays}
            protein={protein}
            onAddProtein={handleAddProtein}
            macros={macros}
            onAddMealEntry={handleAddMealEntry}
            onClaimReward={handleClaimReward}
            commitmentLevel={commitmentLevel}
            setCommitmentLevel={handleConfirmLevelChange}
            levelSelectedAt={userState.levelSelectedAt}
            levelGraceAvailable={userState.levelGraceAvailable}
            nextLevelChangeAllowedAt={userState.nextLevelChangeAllowedAt}
            onOpenLevelModal={() => setIsProtocolModalOpen(true)}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            energyPercent={energyPercent}
            isDark={isDark}
            syncStatus={syncStatus}
            onManualSync={handleManualSync}
            userName={userName}
            firstDashboardSeen={userState.firstDashboardSeen ?? true}
            onDismissFirstDashboard={handleDismissFirstDashboard}
            dailyHistory={userState.dailyHistory}
            isDemoMode={isDemoMode}
            targets={userState.targets}
            userSupplements={userState.onboardingData?.supplements}
            onTakeSupplement={handleTakeSupplement}
            dailyHabits={ensureHabitsAreCurrent(userState.dailyHabits).habitsData}
            onToggleHabit={handleToggleDailyHabit}
            onAddCustomHabit={handleAddCustomHabit}
            onDeleteCustomHabit={handleDeleteCustomHabit}
            onForceMidnightReset={handleForceMidnightReset}
            habitsEnergyBoost={habitsEnergyBoost}
            userGoal={userState.onboardingData?.primary_goal || 'Crear constancia'}
            userWeight={userState.onboardingData?.weight || userState.biometrics?.weightKg || 70}
          />
        )}

        {currentTab !== 'inicio' && (
          <Suspense fallback={<TabLoaderFallback />}>
            {currentTab === 'suplementos' && (
              <SuplementosTab
                userName={userName}
                isDark={isDark}
                onNavigateTab={handleNavigateTab}
              />
            )}

            {(currentTab === 'progreso' || currentTab === 'estadisticas') && (
              <StatsTab
                streakDays={streakDays}
                formScore={energyPercent}
                xp={xp}
                weightKg={userState.biometrics?.weightKg || 70}
                isDark={isDark}
                onUpdateWeight={(newWeight) => {
                  const updatedState: UserState = {
                    ...userState,
                    biometrics: {
                      ...userState.biometrics,
                      weightKg: newWeight,
                    }
                  };
                  setUserState(updatedState);
                  saveUserData(updatedState);
                }}
                currentHydration={hydration}
                targetHydration={userState.targets?.hydrationLiters || 2.5}
                hydrationHistory={userState.hydrationHistory}
                onAddWater={handleAddWater}
                currentProtein={protein}
                targetProtein={userState.targets?.proteinGrams || 150}
                proteinDailyHistory={userState.dailyHistory}
                isDemoMode={isDemoMode}
                onNavigateNutrition={() => handleNavigateTab('nutricion')}
              />
            )}

            {currentTab === 'nutricion' && (
              <NutritionTab
                hydration={hydration}
                onAddWater={handleAddWater}
                onReduceWater={handleReduceWater}
                onAddProtein={handleAddProtein}
                onReduceProtein={handleReduceProtein}
                currentProtein={protein}
                macros={macros}
                targets={userState.targets}
                onAddMealEntry={handleAddMealEntry}
                onDeleteMealEntry={handleDeleteMealEntry}
                onUpdateDirectIntake={handleUpdateDirectIntake}
                foodHistory={userState.foodHistory || []}
                isDark={isDark}
              />
            )}

            {currentTab === 'max-ai' && (
              <MaxAiTab
                initialPrompt={aiPrompt}
                currentProtein={protein}
                streakDays={streakDays}
                userName={userName}
                userId={currentUser?.uid || userState.userId || 'guest_athlete'}
                athleteLevel={userState.level || 1}
                weightKg={userState.biometrics?.weightKg || 70}
                onAddMealEntry={handleAddMealEntry}
                onOpenAudioTranscriber={() => setIsAudioTranscriberOpen(true)}
              />
            )}

            {currentTab === 'retos' && (
              <ChallengesTab
                xp={xp}
                streakDays={streakDays}
                userName={userName}
                isDemoMode={isDemoMode}
              />
            )}

            {currentTab === 'perfil' && (
              <ProfileTab
                xp={xp}
                streakDays={streakDays}
                userName={userName}
                userEmail={currentUser?.email}
                userAvatar={userState.avatarUrl}
                onUpdateAvatar={handleUpdateAvatar}
                isDemoMode={isDemoMode}
                isPro={userState.isPro}
                proExpiry={userState.proExpiry}
                onToggleDemoMode={handleToggleDemoMode}
                onOpenOnboarding={() => setIsOnboardingOpen(true)}
                onResetNewUser={handleResetToNewUser}
                onOpenPremium={() => setIsPremiumModalOpen(true)}
                onLogout={handleLogout}
                onDeleteAccount={handleDeleteAccount}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onOpenAdmin={() => handleNavigateTab('admin')}
                weightKg={userState.biometrics?.weightKg}
                formScore={energyPercent}
                commitmentLevel={commitmentLevel}
                levelSelectedAt={userState.levelSelectedAt}
                levelGraceAvailable={userState.levelGraceAvailable}
                nextLevelChangeAllowedAt={userState.nextLevelChangeAllowedAt}
                onOpenLevelModal={() => setIsProtocolModalOpen(true)}
                dailyHistory={userState.dailyHistory}
                onDownloadApp={triggerInstall}
                isAppInstalled={isPwaInstalled}
              />
            )}

            {currentTab === 'admin' && (
              <AdminPanel
                onBackToApp={() => handleNavigateTab('inicio')}
                isDark={isDark}
                currentUserProfile={{
                  name: userName,
                  goal: userState.onboardingData?.primary_goal || 'Crear constancia',
                  level: commitmentLevel,
                  weightKg: userState.onboardingData?.weight || userState.biometrics?.weightKg || 70,
                }}
                onUpdateUserProfile={handleAdminUpdateUserProfile}
              />
            )}
          </Suspense>
        )}
      </main>

      {/* Modales diferidos con carga bajo demanda */}
      <Suspense fallback={null}>
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onAuthSuccess={handleAuthSuccess}
            isDark={isDark}
          />
        )}

        {isOnboardingOpen && (
          <OnboardingModal
            isOpen={isOnboardingOpen}
            onClose={() => setIsOnboardingOpen(false)}
            onComplete={handleOnboardingComplete}
            isDark={isDark}
          />
        )}

        {isProtocolModalOpen && (
          <ProtocolChangeModal
            isOpen={isProtocolModalOpen}
            onClose={() => setIsProtocolModalOpen(false)}
            currentLevel={commitmentLevel}
            levelSelectedAt={userState.levelSelectedAt}
            levelGraceAvailable={userState.levelGraceAvailable}
            nextLevelChangeAllowedAt={userState.nextLevelChangeAllowedAt}
            onConfirmLevelChange={handleConfirmLevelChange}
          />
        )}

        {isPremiumModalOpen && (
          <PremiumModal
            isOpen={isPremiumModalOpen}
            onClose={() => setIsPremiumModalOpen(false)}
            onUpgrade={(durationDays = 30) => {
              setIsPremiumModalOpen(false);
              const expiryDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
              const updated: UserState = {
                ...userState,
                isPro: true,
                proExpiry: expiryDate,
              };
              setUserState(updated);
              if (!isDemoMode && currentUser) saveUserData(updated);
            }}
            isDark={isDark}
          />
        )}

        {isAudioTranscriberOpen && (
          <AudioTranscriberModal
            isOpen={isAudioTranscriberOpen}
            onClose={() => setIsAudioTranscriberOpen(false)}
            onSendToChat={(text) => {
              setAiPrompt(text);
              handleNavigateTab('max-ai');
            }}
            onLogMeal={(meal) => {
              handleAddMealEntry(meal);
            }}
          />
        )}
      </Suspense>

      {/* Barra de Navegación Inferior Flotante */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setAiPrompt(undefined);
          handleNavigateTab(tab);
        }}
      />

      {/* Prompts e Instalación Directa PWA desde Navegador */}
      <PwaInstallPrompt
        isInstallable={isPwaInstallable}
        isInstalled={isPwaInstalled}
        isIos={isIos}
        showIosModal={showIosModal}
        onCloseIosModal={() => setShowIosModal(false)}
        onInstall={triggerInstall}
        isDark={isDark}
      />
    </div>
  );
}
