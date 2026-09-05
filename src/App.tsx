/**
 * MAXFORM Performance Health & Nutrition Tracking System
 * Modern React + Tailwind CSS + Firebase + Gemini AI + Recharts
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DailyTasks, DailyTaskItem } from './components/DailyTasks';
import { MaxAiSimpleChat } from './components/MaxAiSimpleChat';
import { StatsTab } from './components/StatsTab';
import { ProgressTab } from './components/ProgressTab';
import { NutritionTab } from './components/NutritionTab';
import { MaxAiTab } from './components/MaxAiTab';
import { ChallengesTab } from './components/ChallengesTab';
import { ProfileTab } from './components/ProfileTab';
import { ConsistencyChallenges } from './components/ConsistencyChallenges';
import { OnboardingModal } from './components/OnboardingModal';
import { PremiumModal } from './components/PremiumModal';
import { suggestMealFromFoods, MealSuggestion } from './lib/gemini';
import { db, ensureAuthUser } from './lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { offlineSync, SyncStatus } from './lib/offlineSync';
import { MacroNutrients } from './types';
import { reconcileAthleteData, LocalAthleteState } from './lib/reconciliation';

import { AuthModal } from './components/AuthModal';
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
import { OnboardingProfileInput } from './lib/objectiveEngine';

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
    barGradient: 'from-emerald-500 to-teal-400',
    barColor: '#10b981',
    glowColor: 'shadow-emerald-500/30',
    textColor: 'text-emerald-500 dark:text-emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
    description: 'Enfoque de salud general: 2L de agua, registro flexible y 3 entrenos semanales.',
  },
  Intermedio: {
    name: 'Intermedio',
    barGradient: 'from-blue-600 to-cyan-500',
    barColor: '#3b82f6',
    glowColor: 'shadow-blue-500/30',
    textColor: 'text-blue-500 dark:text-[#b4c5ff]',
    badgeClass: 'bg-blue-500/20 text-blue-600 dark:text-[#b4c5ff] border-blue-500/30',
    description: 'Equilibrio atlético: 120g proteína, hidratación continua y 4 sesiones semanales.',
  },
  Avanzado: {
    name: 'Avanzado',
    barGradient: 'from-indigo-600 via-purple-600 to-pink-500',
    barColor: '#8b5cf6',
    glowColor: 'shadow-purple-500/30',
    textColor: 'text-purple-500 dark:text-purple-300',
    badgeClass: 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30',
    description: 'Rigor atlético: 150g proteína estricta, telemetría y sobrecarga progresiva.',
  },
  Extremo: {
    name: 'Extremo',
    barGradient: 'from-red-600 via-rose-600 to-amber-500',
    barColor: '#ef4444',
    glowColor: 'shadow-red-500/30',
    textColor: 'text-red-500 dark:text-rose-400',
    badgeClass: 'bg-red-500/20 text-red-600 dark:text-rose-300 border-red-500/30',
    description: 'Máximo rendimiento sin concesiones: macros al gramo y tolerancia cero.',
  },
};

interface DashboardProps {
  onNavigateTab: (tab: string, prompt?: string) => void;
  hydration: number;
  onAddWater: () => void;
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
  tasks: DailyTaskItem[];
  onToggleTask: (taskId: DailyTaskItem['id']) => void;
  energyPercent: number;
  isDark: boolean;
  syncStatus: SyncStatus;
  onManualSync: () => void;
  userName?: string;
  firstDashboardSeen?: boolean;
  onDismissFirstDashboard?: () => void;
}

/**
 * Componente Dashboard principal con:
 * - Saludo e indicador visual dinámico de Racha
 * - Barra de Energía visual (progreso) para el cumplimiento diario con colores por nivel
 * - Componente DailyTasks con casillas de verificación
 * - Sugerencia básica de comida mediante Gemini API basada en proteínas faltantes
 * - Chat rápido MAX AI integrado
 */
export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateTab,
  hydration,
  onAddWater,
  xp,
  streakDays,
  protein,
  onAddProtein,
  macros,
  onAddMealEntry,
  onClaimReward,
  commitmentLevel,
  setCommitmentLevel,
  tasks,
  onToggleTask,
  energyPercent,
  isDark,
  syncStatus,
  onManualSync,
  userName = 'Santiago',
  firstDashboardSeen = true,
  onDismissFirstDashboard,
}) => {
  const currentLevelConfig = LEVEL_CONFIGS[commitmentLevel] || LEVEL_CONFIGS.Avanzado;

  // Estado para la sugerencia de comida mediante función auxiliar de Gemini
  const missingProtein = Math.max(0, 150 - protein);
  const [availableFoods, setAvailableFoods] = useState<string[]>([
    'Pechuga de pollo',
    'Huevos camperos',
    'Atún al agua',
    'Yogur griego',
    'Avena',
    'Espinacas',
  ]);
  const [mealSuggestion, setMealSuggestion] = useState<MealSuggestion | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState<boolean>(false);
  const [suggestionMessage, setSuggestionMessage] = useState<string | null>(null);

  // Obtener sugerencia básica de comida usando la función auxiliar conectada a Gemini
  const loadMealSuggestion = async (foodsList = availableFoods, missing = missingProtein) => {
    setIsLoadingSuggestion(true);
    try {
      const suggestion = await suggestMealFromFoods(foodsList, missing);
      setMealSuggestion(suggestion);
    } catch (err) {
      console.error('Error cargando sugerencia:', err);
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  useEffect(() => {
    loadMealSuggestion(availableFoods, missingProtein);
  }, []);

  const handleApplySuggestedMeal = (prot: number) => {
    if (mealSuggestion) {
      onAddMealEntry({
        name: mealSuggestion.mealName,
        protein: mealSuggestion.protein,
        carbs: 22,
        fats: 8,
        calories: mealSuggestion.calories || (prot * 4 + 160),
      });
    } else {
      onAddProtein(prot);
    }
    setSuggestionMessage(`¡Comida registrada y sincronizada! +${prot}g de proteína añadidos.`);
    setTimeout(() => setSuggestionMessage(null), 4000);
  };

  const handleToggleFoodChip = (food: string) => {
    let nextFoods: string[];
    if (availableFoods.includes(food)) {
      if (availableFoods.length <= 2) return; // al menos 2 alimentos
      nextFoods = availableFoods.filter((f) => f !== food);
    } else {
      nextFoods = [...availableFoods, food];
    }
    setAvailableFoods(nextFoods);
    loadMealSuggestion(nextFoods, missingProtein);
  };

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
      {/* Banner de Sincronización Offline / Firestore */}
      {(!syncStatus.isOnline || syncStatus.pendingCount > 0) && (
        <div
          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
            !syncStatus.isOnline
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              : 'bg-blue-500/15 border-blue-500/30 text-[#b4c5ff]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px]">
              {!syncStatus.isOnline ? 'cloud_off' : 'cloud_sync'}
            </span>
            <div>
              <p className="font-bold">
                {!syncStatus.isOnline
                  ? 'Modo Offline Activo'
                  : `${syncStatus.pendingCount} registros listos para sincronizar`}
              </p>
              <p className="text-[11px] opacity-80">
                {!syncStatus.isOnline
                  ? 'Todas tus tareas y comidas se guardan localmente y se sincronizarán con Firestore apenas regrese internet.'
                  : 'Los datos locales se subirán a tu cuenta Firestore en la nube.'}
              </p>
            </div>
          </div>

          {syncStatus.isOnline && syncStatus.pendingCount > 0 && (
            <button
              type="button"
              onClick={onManualSync}
              disabled={syncStatus.isSyncing}
              className="px-3 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#3b82f6] text-white font-bold text-xs flex items-center justify-center gap-1.5 self-start sm:self-auto active:scale-95 disabled:opacity-50"
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
        <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-blue-950/50 border border-blue-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-md shadow-blue-500/30">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Todo listo.</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-500/30 text-blue-300 rounded-full border border-blue-400/30">
                  Plan Inicial
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Tu objetivo ya está configurado. Ahora empieza tu primer día.
              </p>
            </div>
          </div>
          {onDismissFirstDashboard && (
            <button
              type="button"
              onClick={onDismissFirstDashboard}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 whitespace-nowrap self-end sm:self-center"
            >
              Ver mis objetivos
            </button>
          )}
        </div>
      )}

      {/* 1. Saludo Inicial e Indicador Visual Dinámico de Racha */}
      <section className="flex flex-col gap-2 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-label-caps text-label-caps dark:text-[#8d90a0] text-slate-500 uppercase tracking-wider capitalize">
              {todayFormatted} · Telemetría Activa
            </span>
            <h1 className="font-headline-xl-mobile text-2xl sm:text-3xl font-bold dark:text-white text-slate-900 tracking-tight">
              Buenos días, {userName || 'Atleta'}
            </h1>
            {xp === 0 && streakDays === 0 && (
              <p className="text-xs text-blue-500 dark:text-blue-400 font-semibold tracking-wide mt-0.5">
                Hoy empieza tu Form.
              </p>
            )}
          </div>

          {/* Indicador Visual Dinámico de Racha */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all shadow-sm ${
              isAllTasksDone
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 ring-2 ring-amber-500/20 animate-pulse'
                : 'dark:bg-[#191c20] bg-white dark:text-white text-slate-800 dark:border-[#282a2f] border-slate-200'
            }`}
          >
            <span className="text-xl select-none">🔥</span>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-extrabold leading-none">
                {displayedStreak} días de racha
              </span>
              <span className="text-[10px] dark:text-[#8d90a0] text-slate-500 leading-none mt-0.5 font-medium">
                {isAllTasksDone ? '¡Meta de hoy sellada!' : `${completedTasksCount}/${tasks.length} metas listas`}
              </span>
            </div>
            {isAllTasksDone && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            )}
          </div>
        </div>

        {/* Nivel de Atleta y XP */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold uppercase border ${currentLevelConfig.badgeClass}`}>
            Nivel {currentLevelConfig.name}
          </span>
          <span className="dark:text-[#8d90a0] text-slate-400">·</span>
          <span className="dark:text-[#8d90a0] text-slate-600 font-medium">Atleta de Rendimiento</span>
          <span className="dark:text-[#8d90a0] text-slate-400">·</span>
          <span className="font-bold text-[#2563eb] dark:text-[#b4c5ff]">
            {xp.toLocaleString('es-ES')} XP
          </span>
        </div>
      </section>

      {/* 2. Barra de Energía Visual (Progreso) para Cumplimiento Diario de Metas */}
      <section className="relative overflow-hidden rounded-2xl p-5 shadow-xl border dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 transition-colors">
        {/* Resplandor ambiental de fondo */}
        <div
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: currentLevelConfig.barColor }}
        ></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ color: currentLevelConfig.barColor }}
            >
              bolt
            </span>
            <div>
              <h2 className="font-label-caps text-xs uppercase font-bold tracking-wider dark:text-[#8d90a0] text-slate-500">
                ENERGÍA DEL DÍA · CUMPLIMIENTO DE METAS
              </h2>
              <span className="text-xs dark:text-slate-300 text-slate-600">
                Progreso metabólico calibrado al Nivel <strong>{currentLevelConfig.name}</strong>
              </span>
            </div>
          </div>

          {/* Selector de Nivel de Compromiso con los colores especificados */}
          <div className="flex items-center gap-1 p-1 rounded-xl dark:bg-[#111318] bg-slate-100 border dark:border-[#282a2f] border-slate-200 self-start sm:self-auto">
            {(['Básico', 'Intermedio', 'Avanzado', 'Extremo'] as const).map((lvl) => {
              const isSelected = commitmentLevel === lvl;
              const cfg = LEVEL_CONFIGS[lvl];
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setCommitmentLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    isSelected
                      ? 'text-white shadow-md scale-[1.02]'
                      : 'dark:text-[#8d90a0] text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  style={{
                    backgroundColor: isSelected ? cfg.barColor : 'transparent',
                  }}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Indicador numérico grande y barra visual de progreso */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black dark:text-white text-slate-900 tracking-tight">
                {energyPercent}%
              </span>
              <span className="text-xs sm:text-sm font-semibold dark:text-[#8d90a0] text-slate-500 uppercase tracking-wide">
                Energía Diaria
              </span>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${currentLevelConfig.badgeClass}`}
            >
              {energyPercent >= 100
                ? '¡Máxima Potencia 100%!'
                : energyPercent >= 75
                ? 'Zona Óptima'
                : 'En Proceso'}
            </span>
          </div>

          {/* Barra de progreso de Energía con los colores de nivel definidos */}
          <div className="relative w-full h-4 rounded-full overflow-hidden dark:bg-[#111318] bg-slate-100 p-0.5 border dark:border-[#282a2f] border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${currentLevelConfig.barGradient} shadow-md`}
              style={{ width: `${Math.min(100, Math.max(5, energyPercent))}%` }}
            >
              <div className="w-full h-full opacity-30 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]"></div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs dark:text-[#8d90a0] text-slate-500 pt-1">
            <span>
              {completedTasksCount} de {tasks.length} metas completas + Proteína ({protein}/150g)
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('estadisticas')}
              className="text-xs font-bold text-[#2563eb] dark:text-[#b4c5ff] hover:underline flex items-center gap-1"
            >
              <span>Ver estadísticas con Recharts</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Componente DailyTasks con Casillas de Verificación Interactivas */}
      <DailyTasks
        tasks={tasks}
        onToggleTask={onToggleTask}
        hydration={hydration}
        onAddWater={onAddWater}
        isDark={isDark}
      />

      {/* 4. Sistema de Desafíos de Consistencia con Recompensas Animadas */}
      <ConsistencyChallenges
        streakDays={displayedStreak}
        tasks={tasks}
        hydration={hydration}
        protein={macros.protein}
        onClaimReward={onClaimReward}
        isDark={isDark}
      />

      {/* 5. Sugerencia Básica de Comida mediante API de Gemini (basada en proteínas faltantes) */}
      <section className="rounded-2xl p-5 border dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb]/20 text-[#2563eb] dark:text-[#b4c5ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
            </div>
            <div>
              <h2 className="font-headline-md text-sm sm:text-base font-bold dark:text-white text-slate-900 flex items-center gap-2">
                Sugerencia Inteligente de Comida
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2563eb]/20 text-[#2563eb] dark:text-[#b4c5ff]">
                  Gemini AI
                </span>
              </h2>
              <p className="text-xs dark:text-[#8d90a0] text-slate-500">
                Diseñada para cubrir exactamente tus <strong>{missingProtein}g</strong> de proteína faltante.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoadingSuggestion}
            onClick={() => loadMealSuggestion(availableFoods, missingProtein)}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-bold border dark:border-[#282a2f] border-slate-300 dark:bg-[#1d2024] bg-slate-100 hover:bg-slate-200 dark:hover:bg-[#282a2f] dark:text-white text-slate-800 transition-colors flex items-center gap-1.5"
          >
            <span className={`material-symbols-outlined text-[16px] ${isLoadingSuggestion ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{isLoadingSuggestion ? 'Consultando Gemini...' : 'Regenerar'}</span>
          </button>
        </div>

        {/* Chips de Alimentos Disponibles */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase dark:text-[#8d90a0] text-slate-500 block">
            Alimentos seleccionados para la sugerencia:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Pechuga de pollo',
              'Huevos camperos',
              'Atún al agua',
              'Yogur griego',
              'Avena',
              'Espinacas',
              'Queso cottage',
              'Tofu',
            ].map((food) => {
              const isSelected = availableFoods.includes(food);
              return (
                <button
                  key={food}
                  type="button"
                  onClick={() => handleToggleFoodChip(food)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    isSelected
                      ? 'bg-[#2563eb] text-white border-[#2563eb] font-semibold shadow-sm'
                      : 'dark:bg-[#111318] bg-slate-100 dark:text-[#8d90a0] text-slate-600 dark:border-[#282a2f] border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {food}
                </button>
              );
            })}
          </div>
        </div>

        {suggestionMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>{suggestionMessage}</span>
          </div>
        )}

        {/* Tarjeta de Sugerencia Resultante */}
        {mealSuggestion && (
          <div className="p-4 rounded-xl dark:bg-[#111318] bg-slate-50 border dark:border-[#282a2f] border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#2563eb] dark:text-[#b4c5ff] tracking-wider block">
                  Recomendación para cerrar tu Form Diaria:
                </span>
                <h3 className="font-headline-md text-base font-bold dark:text-white text-slate-900 mt-0.5">
                  {mealSuggestion.mealName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#2563eb] text-white text-xs font-extrabold shadow-sm">
                  +{mealSuggestion.protein}g Proteína
                </span>
                <span className="px-2 py-1 rounded-lg dark:bg-[#1d2024] bg-white border dark:border-[#282a2f] border-slate-200 text-xs font-bold dark:text-white text-slate-800">
                  {mealSuggestion.calories} kcal
                </span>
                <span className="px-2 py-1 rounded-lg dark:bg-[#1d2024] bg-white border dark:border-[#282a2f] border-slate-200 text-xs font-medium dark:text-[#8d90a0] text-slate-500">
                  ⏱️ {mealSuggestion.preparationTime}
                </span>
              </div>
            </div>

            <p className="text-xs dark:text-[#c3c6d7] text-slate-600 leading-relaxed">
              {mealSuggestion.instructions}
            </p>

            {mealSuggestion.reason && (
              <p className="text-[11px] dark:text-[#8d90a0] text-slate-500 italic">
                «{mealSuggestion.reason}»
              </p>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => handleApplySuggestedMeal(mealSuggestion.protein)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Registrar y sumar +{mealSuggestion.protein}g a mi Form</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('nutricion')}
                className="py-2.5 px-4 rounded-xl dark:bg-[#1d2024] bg-white hover:bg-slate-100 dark:hover:bg-[#282a2f] dark:text-white text-slate-800 border dark:border-[#282a2f] border-slate-200 font-bold text-xs transition-colors"
              >
                Ver en Nutrición
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 5. Chat Rápido 'MAX AI' con Estimación de Comidas */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2563eb] text-[20px]">chat</span>
            <h2 className="font-label-caps text-xs uppercase font-bold tracking-wider dark:text-[#8d90a0] text-slate-500">
              REGISTRO RÁPIDO DE COMIDAS CON MAX AI
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('max-ai')}
            className="text-xs font-bold text-[#2563eb] dark:text-[#b4c5ff] hover:underline flex items-center gap-1"
          >
            <span>Abrir chat completo</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </button>
        </div>

        <MaxAiSimpleChat
          onAddProtein={onAddProtein}
          onAddMealEntry={onAddMealEntry}
          isDark={isDark}
        />
      </section>
    </div>
  );
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('inicio');
  const [aiPrompt, setAiPrompt] = useState<string | undefined>(undefined);

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

  // Modo Demo vs Modo Usuario Real
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const user = authService.getCurrentUser();
    if (user) return false;
    const saved = localStorage.getItem('maxform_is_demo_mode');
    return saved !== null ? saved === 'true' : true;
  });

  // Estado del usuario activo (Santiago en Demo, o estado aislado y namespaced para cada atleta)
  const [userState, setUserState] = useState<UserState>(() => {
    const user = authService.getCurrentUser();
    const savedDemo = localStorage.getItem('maxform_is_demo_mode');
    const isDemo = !user && (savedDemo === null || savedDemo === 'true');
    if (isDemo) {
      return SANTIAGO_DEMO_STATE;
    }
    if (user) {
      return loadLocalUserState(user.uid, user.email, user.displayName);
    }
    return createCleanInitialUserState('guest_athlete', 'guest@maxform.app', 'Atleta');
  });

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
  const userName = userState.name;
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
      // Activar Cuenta Real
      if (currentUser) {
        const loaded = loadLocalUserState(currentUser.uid, currentUser.email, currentUser.displayName);
        setUserState(loaded);
        if (!loaded.onboardingCompleted) {
          setIsOnboardingOpen(true);
        }
      } else {
        // Abrir modal de autenticación para que cree su cuenta desde cero
        setIsAuthModalOpen(true);
      }
    }
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

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsDemoMode(true);
    localStorage.setItem('maxform_is_demo_mode', 'true');
    setUserState(SANTIAGO_DEMO_STATE);
  };

  const handleDeleteAccount = () => {
    if (currentUser) {
      deleteUserData(currentUser.uid);
      authService.deleteAccount(currentUser.uid);
      setCurrentUser(null);
      setIsDemoMode(true);
      localStorage.setItem('maxform_is_demo_mode', 'true');
      setUserState(SANTIAGO_DEMO_STATE);
    }
  };

  // Estado de sincronización Offline y Firestore
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

  // Manejador central de resolución de conflictos y reconciliación con Firestore
  const reconcileWithFirestore = useCallback(
    async (
      trigger: 'initial' | 'online' | 'manual' | 'snapshot',
      forcedSnapshot?: any
    ): Promise<boolean> => {
      try {
        const user = await ensureAuthUser();
        if (!user || !db) return false;
        const userId = currentUser ? currentUser.uid : (isDemoMode ? 'santiago-athlete-01' : 'guest_athlete');
        const userDocRef = doc(db, 'users', userId);

        let remoteData = forcedSnapshot;
        if (!remoteData) {
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            remoteData = snap.data();
          }
        }

        if (!remoteData) {
          console.log('[Reconciliación MAXFORM] No hay snapshot remoto en Firestore; preservando estado local.');
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

          // Escribir el estado unificado y libre de conflictos a Firestore
          await setDoc(
            userDocRef,
            {
              ...merged,
              lastSyncedAt: new Date().toISOString(),
              offlineSynced: true,
            },
            { merge: true }
          );

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
        console.warn('[Reconciliación MAXFORM] Error al sincronizar con Firestore:', err);
        return false;
      }
    },
    [currentUser, isDemoMode]
  );

  // Sincronización y reconciliación manual iniciada por el usuario
  const handleManualSync = useCallback(async () => {
    await reconcileWithFirestore('manual');
    await offlineSync.syncPendingActions();
  }, [reconcileWithFirestore]);

  // Suscripción al recuperador de red (evento 'online' del navegador)
  useEffect(() => {
    const unregister = offlineSync.registerReconciler(async () => {
      console.log('[MAXFORM] Red recuperada: ejecutando reconciliador contra Firestore...');
      await reconcileWithFirestore('online');
    });

    return unregister;
  }, [reconcileWithFirestore]);

  // Listener en tiempo real de Firestore para recibir cambios externos
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    async function initSnapshotListener() {
      try {
        const user = await ensureAuthUser();
        if (!user || !db) return;
        const userId = currentUser ? currentUser.uid : (isDemoMode ? 'santiago-athlete-01' : 'guest_athlete');
        const userDocRef = doc(db, 'users', userId);

        unsubscribeSnapshot = onSnapshot(
          userDocRef,
          (snapshot) => {
            if (snapshot.metadata.hasPendingWrites) {
              return;
            }

            if (snapshot.exists()) {
              const remoteData = snapshot.data();
              reconcileWithFirestore('snapshot', remoteData);
            }
          },
          (error) => {
            console.warn('[MAXFORM] Listener de snapshot offline diferido:', error);
          }
        );
      } catch (e) {
        console.warn('[MAXFORM] Error inicializando listener de Firestore:', e);
      }
    }

    initSnapshotListener();

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [reconcileWithFirestore, currentUser, isDemoMode]);

  // Cargar estado inicial y reconciliar con Firestore
  useEffect(() => {
    reconcileWithFirestore('initial');
  }, [reconcileWithFirestore]);

  // Nivel de compromiso
  const setCommitmentLevel = (lvl: CommitmentLevel) => {
    const updated: UserState = {
      ...userState,
      commitmentLevel: lvl,
    };
    setUserState(updated);
    if (!isDemoMode && currentUser) saveUserData(updated);
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

    const updated: UserState = {
      ...userState,
      hydration: nextWater,
      tasks: nextTasks,
      formScore: nextForm,
      completedObjectives: completedCount,
    };
    setUserState(updated);
    if (!isDemoMode && currentUser) saveUserData(updated);

    offlineSync.queueAction('STATE_FULL', {
      hydration: nextWater,
      tasks: nextTasks,
      timestamp: Date.now(),
    });
  };

  // Añadir proteína directa
  const handleAddProtein = (amount: number) => {
    const target = userState.targets?.proteinGrams || 150;
    const nextProtein = Math.min(300, userState.protein + amount);
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

    const updated: UserState = {
      ...userState,
      protein: nextProtein,
      macros: nextMacros,
      tasks: nextTasks,
      formScore: nextForm,
      completedObjectives: completedCount,
    };
    setUserState(updated);
    if (!isDemoMode && currentUser) saveUserData(updated);

    offlineSync.queueAction('MACROS_UPDATE', {
      amount,
      macros: nextMacros,
      protein: nextProtein,
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

  // Cálculo de Energía del Día (Progreso en %)
  const energyPercent = useMemo(() => {
    const completedCount = tasks.filter((t) => t.completed).length;
    if (tasks.length === 0) return 0;
    const tasksScore = (completedCount / tasks.length) * 80;
    const targetProt = userState.targets?.proteinGrams || 150;
    const proteinRatio = Math.min(1, protein / (targetProt || 150));
    const proteinScore = proteinRatio * 20;
    return Math.round(tasksScore + proteinScore);
  }, [tasks, protein, userState.targets]);

  return (
    <div className="min-h-screen dark:bg-[#111318] bg-slate-50 dark:text-[#e2e2e8] text-slate-800 flex flex-col selection:bg-[#2563eb] selection:text-white transition-colors duration-200">
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
      />

      {/* Contenido Principal */}
      <main className="flex-1 w-full pt-20 flex flex-col items-center">
        {/* Banner de Reconciliación Inteligente Offline/Firestore */}
        {reconciliationNotice && (
          <div className="mx-4 my-2.5 max-w-4xl w-[calc(100%-2rem)] p-3.5 bg-blue-950/80 dark:bg-[#101935]/90 border border-blue-500/40 rounded-2xl shadow-xl backdrop-blur-md flex items-start justify-between gap-3 text-white transition-all animate-fadeIn z-30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-md shadow-blue-500/20">
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
                  <ul className="text-[11px] text-blue-200/80 space-y-0.5 list-disc list-inside pt-1 font-medium">
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
            xp={xp}
            streakDays={streakDays}
            protein={protein}
            onAddProtein={handleAddProtein}
            macros={macros}
            onAddMealEntry={handleAddMealEntry}
            onClaimReward={handleClaimReward}
            commitmentLevel={commitmentLevel}
            setCommitmentLevel={setCommitmentLevel}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            energyPercent={energyPercent}
            isDark={isDark}
            syncStatus={syncStatus}
            onManualSync={handleManualSync}
            userName={userName}
            firstDashboardSeen={userState.firstDashboardSeen ?? true}
            onDismissFirstDashboard={handleDismissFirstDashboard}
          />
        )}

        {(currentTab === 'progreso' || currentTab === 'estadisticas') && (
          <StatsTab
            streakDays={streakDays}
            formScore={energyPercent}
            isDark={isDark}
          />
        )}

        {currentTab === 'nutricion' && (
          <NutritionTab
            hydration={hydration}
            onAddWater={handleAddWater}
            onAddProtein={handleAddProtein}
            currentProtein={protein}
            macros={macros}
            onAddMealEntry={handleAddMealEntry}
          />
        )}

        {currentTab === 'max-ai' && (
          <MaxAiTab
            initialPrompt={aiPrompt}
            currentProtein={protein}
            streakDays={streakDays}
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
            isDemoMode={isDemoMode}
            onToggleDemoMode={handleToggleDemoMode}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            weightKg={userState.biometrics?.weightKg}
            formScore={energyPercent}
          />
        )}
      </main>

      {/* Modal de Autenticación y Registro Real */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        isDark={isDark}
      />

      {/* Modal de Onboarding Inicial / Reconfiguración */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
        isDark={isDark}
      />

      {/* Modal de Planes MAXFORM Premium */}
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onUpgrade={() => {
          setIsPremiumModalOpen(false);
          alert('¡30 Días de MAXFORM Pro activados con éxito para tu cuenta!');
        }}
        isDark={isDark}
      />

      {/* Barra de Navegación Inferior Flotante */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setAiPrompt(undefined);
          handleNavigateTab(tab);
        }}
      />
    </div>
  );
}
