import React, { useState, useMemo } from 'react';
import { calculateLevelFromXP } from '../lib/gamification';
import { ExpandableMealSuggestionCard } from './ExpandableMealSuggestionCard';
import { ProteinWeeklyChart } from './ProteinWeeklyChart';
import { MealSuggestion } from '../lib/gemini';
import { getPersonalizedContent } from '../lib/personalizationEngine';
import { CommitmentLevel } from '../types';

interface HomeTabProps {
  onNavigateTab: (tab: string, prompt?: string) => void;
  hydration: number;
  onAddWater: () => void;
  xp: number;
  completedCount: number;
  totalObjectivesCount?: number;
  formScore: number;
  streakDays: number;
  protein?: number;
  onAddProtein?: (amount: number) => void;
  userName?: string;
  userGoal?: string;
  userLevel?: CommitmentLevel;
  userWeight?: number;
  firstDashboardSeen?: boolean;
  onDismissFirstDashboard?: () => void;
  isDemoMode?: boolean;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  onNavigateTab,
  hydration,
  onAddWater,
  xp,
  completedCount,
  totalObjectivesCount = 5,
  formScore,
  streakDays,
  protein = 120,
  onAddProtein,
  userName = 'Atleta',
  userGoal = 'Crear constancia',
  userLevel = 'Intermedio',
  userWeight = 70,
  firstDashboardSeen = true,
  onDismissFirstDashboard,
  isDemoMode = false,
}) => {
  // Motor de personalización
  const personalized = useMemo(
    () => getPersonalizedContent(userGoal, userLevel as CommitmentLevel, userName, userWeight),
    [userGoal, userLevel, userName, userWeight]
  );
  const [mealSuggestion, setMealSuggestion] = useState<MealSuggestion>({
    mealName: 'Bowl proteico de pollo con quinoa, palta y espinacas',
    protein: 42,
    calories: 460,
    preparationTime: '12 min',
    ingredientsUsed: ['Pechuga de pollo grillada (160g)', 'Quinoa cocida', 'Palta en láminas', 'Espinacas frescas'],
    instructions: 'Dispón la base de quinoa templada con la pechuga en tiras, palta y hojas de espinaca. Adereza con gotas de oliva y limón.',
    reason: 'Aporte de alto valor biológico con perfil completo de electrolitos para optimizar la síntesis proteica.',
    isComplexMenu: true,
  });
  const maxHydration = 3.0;
  const isHydrationDone = hydration >= maxHydration;
  const hydrationPct = Math.min(100, Math.round((hydration / maxHydration) * 100));

  const levelInfo = calculateLevelFromXP(xp);

  // Cálculo de offsets para SVG rings
  const outerCircumference = 314.16;
  const outerOffset = outerCircumference * (1 - formScore / 100);

  // Fecha dinámica en español
  const todayFormatted = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  const isBrandNewAccount = xp === 0 && streakDays === 0 && completedCount === 0;

  return (
    <div className="flex flex-col w-full px-4 space-y-4 max-w-[1280px] mx-auto pb-24">
      {/* Banner de Primera Experiencia (Solo en el primer día o hasta que se desestime) */}
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
          <button
            type="button"
            onClick={onDismissFirstDashboard}
            className="px-4 py-2 rounded-xl bg-white text-black hover:bg-zinc-100 text-xs font-black transition-all shadow-md active:scale-95 whitespace-nowrap self-end sm:self-center"
          >
            Ver mis objetivos
          </button>
        </div>
      )}

      {/* Saludo y Racha */}
      <section className="flex flex-col gap-2 pt-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-[#898a8c] uppercase tracking-wider">
              {capitalizedDate}
            </span>
            <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-[#d6d6d6] font-bold">
              {personalized.greeting}
            </h1>
            {isBrandNewAccount && (
              <p className="text-xs dark:text-zinc-400 text-slate-500 font-semibold tracking-wide">
                Hoy empieza tu Form.
              </p>
            )}
            {!isBrandNewAccount && (
              <p className="text-xs text-slate-400 mt-0.5 leading-snug max-w-[220px]">
                {personalized.homeSubtitle}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#06151e] text-white border border-[#545a5b] shadow-sm">
              <span className="text-base select-none">🔥</span>
              <span className="font-label-caps text-label-caps tracking-normal font-bold">
                {streakDays} días de racha
              </span>
            </div>
            {/* Badge de modo activo */}
            <span
              className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border whitespace-nowrap"
              style={{
                color: personalized.modeBadgeColor,
                borderColor: `${personalized.modeBadgeColor}40`,
                backgroundColor: `${personalized.modeBadgeColor}15`,
              }}
            >
              {personalized.modeBadge}
            </span>
          </div>
        </div>

        {/* Alerta de nivel Avanzado/Extremo */}
        {personalized.levelAlert && (
          <div
            className="px-3 py-2 rounded-xl text-[11px] font-semibold leading-snug border"
            style={{
              color: personalized.modeBadgeColor,
              borderColor: `${personalized.modeBadgeColor}30`,
              backgroundColor: `${personalized.modeBadgeColor}10`,
            }}
          >
            {personalized.levelAlert}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-200 font-label-caps text-label-caps uppercase font-bold border border-white/15">
            Nivel {levelInfo.levelNumber}
          </span>
          <span className="font-body-sm text-[#898a8c]">·</span>
          <span className="font-body-sm text-[#898a8c] font-medium">{levelInfo.levelName}</span>
          <span className="font-body-sm text-[#898a8c]">·</span>
          <span className="font-body-sm text-zinc-200 font-bold">
            {xp.toLocaleString('es-ES')} XP
          </span>
        </div>
      </section>

      {/* Tarjeta Héroe: FORM DIARIA */}
      <section className="relative overflow-hidden rounded-xl bg-[#06151e] p-5 shadow-xl border border-white/10">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#d6d6d6] text-[20px]">bolt</span>
            <span className="font-label-caps text-label-caps uppercase text-[#898a8c] tracking-wider font-bold">
              FORM DIARIA
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#06151e] text-[#d6d6d6] font-label-caps text-label-caps border border-white/10 font-semibold">
            {formScore === 0 ? 'COMIENZA HOY' : `${formScore}% HOY`}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Anillo Circular de Progreso Técnico SVG Concéntrico */}
          <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
            <svg aria-hidden="true" className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              {/* Pista exterior */}
              <circle className="stroke-[#06151e]" cx="60" cy="60" fill="none" r="50" strokeWidth="7" />
              <circle 
                className="stroke-white/80 transition-all duration-700 ease-out" 
                cx="60" 
                cy="60" 
                fill="none" 
                r="50" 
                strokeDasharray="314.16" 
                strokeDashoffset={outerOffset} 
                strokeLinecap="round" 
                strokeWidth="7" 
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-metric-stat text-metric-stat text-white leading-none font-bold">
                {formScore}%
              </span>
              <span className="font-label-caps text-label-caps text-[#898a8c] uppercase mt-1 font-bold">
                {formScore === 100 ? 'SELLADO' : 'FORM'}
              </span>
            </div>
          </div>

          {/* Métricas y Estado */}
          <div className="flex flex-col flex-1 gap-2 text-left w-full">
            <div className="flex items-baseline justify-between">
              <span className="font-headline-md text-headline-md text-white font-bold">
                {completedCount} de {totalObjectivesCount} objetivos
              </span>
              <span className="font-body-sm text-[#d6d6d6] font-semibold">Meta 80%+</span>
            </div>
            
            <p className="font-body-sm text-[#d6d6d6] leading-relaxed">
              {isBrandNewAccount ? (
                <>
                  Tus objetivos están listos. <span className="text-white font-semibold">Completa el primero</span> para registrar tu progreso y activar tu racha.
                </>
              ) : formScore >= 80 ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  ¡Excelente! Form diaria sellada y bonus de racha asegurado.
                </span>
              ) : (
                <>
                  Te faltan <span className="text-white font-semibold">{totalObjectivesCount - completedCount} objetivos</span> para sellar tu Form diaria.
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Sección: Objetivos de Hoy */}
      <section className="flex flex-col space-y-2">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-label-caps uppercase text-[#898a8c] tracking-wider font-bold">
              OBJETIVOS DE HOY
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffffff] animate-ping"></span>
          </div>
          <span className="font-body-sm text-[#898a8c]">Actualizado en tiempo real</span>
        </div>

        {/* Tarjeta 1: Entrenamiento */}
        <div className="flex items-center justify-between p-4 bg-[#06151e] rounded-xl border border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#ffffff]/20 flex items-center justify-center text-[#d6d6d6] flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">fitness_center</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-headline-md text-headline-md text-white truncate font-semibold">
                  Entrenamiento
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#06151e] text-white font-label-caps text-label-caps uppercase font-bold">
                  +25 XP
                </span>
              </div>
              <span className="font-body-sm text-[#898a8c]">45 min pesas · Empuje & Tríceps</span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-zinc-200 flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">done</span>
          </div>
        </div>

        {/* Tarjeta 2: Proteína */}
        <div className="flex flex-col p-4 bg-[#06151e] rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#06151e] flex items-center justify-center text-[#d6d6d6] flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">restaurant</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-white font-semibold">
                  Proteína Diaria
                </span>
                <span className="font-body-sm text-[#898a8c]">Meta metabólica: 150 g</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-headline-md text-headline-md text-white font-bold">
                128 / 150 g
              </span>
              <span className="block font-body-sm text-zinc-300 font-medium">
                Faltan 22 g
              </span>
            </div>
          </div>
          <div className="w-full bg-[#06151e] h-2 rounded-full overflow-hidden">
            <div className="bg-white/70 h-full rounded-full transition-all duration-500" style={{ width: '85.3%' }}></div>
          </div>
        </div>

        {/* Tarjeta 3: Hidratación (Interactiva) */}
        <div className="flex flex-col p-4 bg-[#06151e] rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#06151e] flex items-center justify-center text-[#d6d6d6] flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">water_drop</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-headline-md text-headline-md text-white font-semibold">
                    Hidratación
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-label-caps text-label-caps uppercase font-bold ${
                    isHydrationDone ? 'bg-white/15 text-white' : 'bg-[#06151e] text-[#898a8c]'
                  }`}>
                    {isHydrationDone ? '¡Completado!' : 'En curso'}
                  </span>
                </div>
                <span className="font-body-sm text-[#898a8c]">Meta basal: 3,0 L</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-headline-md text-headline-md text-white font-bold">
                {hydration.toFixed(1).replace('.', ',')} / 3,0 L
              </span>
              <span className="block font-body-sm text-[#d6d6d6] font-medium">
                {hydrationPct}% completado
              </span>
            </div>
          </div>

          <div className="w-full bg-[#06151e] h-2 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 bg-white/70" 
              style={{ width: `${hydrationPct}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="font-body-sm text-[#898a8c]">
              {isHydrationDone ? '¡Excelente hidratación diaria lograda (+15 XP)!' : 'Agrega un vaso de agua tras tu sesión'}
            </span>
            <button
              type="button"
              onClick={onAddWater}
              disabled={isHydrationDone}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-body-sm text-body-sm font-bold transition-all shadow-md active:scale-95 ${
                isHydrationDone 
                  ? 'bg-[#06151e] text-[#898a8c] cursor-not-allowed opacity-60' 
                  : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>+250 ml</span>
            </button>
          </div>
        </div>

        {/* Tarjeta 4: Suplementación */}
        <div className="flex items-center justify-between p-4 bg-[#06151e] rounded-xl border border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#ffffff]/20 flex items-center justify-center text-[#d6d6d6] flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">medication</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-headline-md text-headline-md text-white truncate font-semibold">
                  Suplementación
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#06151e] text-white font-label-caps text-label-caps uppercase font-bold">
                  +10 XP
                </span>
              </div>
              <span className="font-body-sm text-[#898a8c] truncate">
                Whey Isolada (30g) & Creatina Creapure (5g) listos
              </span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#ffffff]/30 flex items-center justify-center text-[#d6d6d6] flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">done</span>
          </div>
        </div>

        {/* Tarjeta 5: Sueño */}
        <div className="flex items-center justify-between p-4 bg-[#06151e] rounded-xl border border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#06151e] flex items-center justify-center text-[#d6d6d6] flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">bedtime</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-headline-md text-headline-md text-white font-semibold">
                  Sueño & Recuperación
                </span>
              </div>
              <span className="font-body-sm text-[#898a8c]">Meta: 8h · Eficiencia 89%</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="font-headline-md text-headline-md text-white font-bold">
              7 h 20 min
            </span>
            <span className="block font-body-sm text-zinc-300 font-medium">
              En rango óptimo
            </span>
          </div>
        </div>
      </section>

      {/* Tip del Día Personalizado */}
      <section className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#06151e] border border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center text-zinc-300 flex-shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-[18px]">lightbulb</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-extrabold text-[#898a8c] uppercase tracking-wider block mb-0.5">
            TIP DEL DÍA · {personalized.nutritionCardLabel.toUpperCase()}
          </span>
          <p className="text-xs text-[#d6d6d6] leading-relaxed">{personalized.dailyTip}</p>
          <p className="text-[11px] text-[#898a8c] italic mt-1">{personalized.coachQuote}</p>
        </div>
      </section>

      {/* Desafío Activo Personalizado */}
      <section className="relative overflow-hidden rounded-xl p-4 border"
        style={{
          background: `linear-gradient(135deg, #06151e 60%, ${personalized.modeBadgeColor}15)`,
          borderColor: `${personalized.modeBadgeColor}30`,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[18px]" style={{ color: personalized.modeBadgeColor }}>emoji_events</span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: personalized.modeBadgeColor }}>
            DESAFÍO ACTIVO
          </span>
        </div>
        <p className="text-sm font-bold text-white leading-snug">{personalized.challengeTitle}</p>
        <p className="text-xs text-[#d6d6d6] mt-1 leading-relaxed">{personalized.challengeDescription}</p>
        <button
          type="button"
          onClick={() => onNavigateTab('retos')}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
          style={{ background: `${personalized.modeBadgeColor}20`, color: personalized.modeBadgeColor, border: `1px solid ${personalized.modeBadgeColor}30` }}
        >
          <span>Ver mis retos</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </section>

      {/* Tarjeta Vista Previa "MAX AI" */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#06151e] via-[#06151e] to-white/5 p-5 shadow-lg border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-zinc-200">
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            </div>
            <span className="font-label-caps text-label-caps uppercase text-zinc-300 tracking-wider font-bold">
              MAX AI · COACH METABÓLICO
            </span>
          </div>
          <span className="font-body-sm text-[#898a8c] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse"></span>
            En vivo
          </span>
        </div>

        <blockquote className="my-2 pl-3 border-l-2 border-white/30 py-0.5">
          <p className="font-body-md text-body-md text-white leading-snug italic">
            «{personalized.aiWelcomeMessage}»
          </p>
        </blockquote>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => onNavigateTab('max-ai', `Dame un plan de ${userGoal.toLowerCase()} para mi nivel ${userLevel}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#06151e] hover:bg-[#06151e] text-white font-body-sm transition-colors active:scale-95 border border-white/10"
          >
            <span className="material-symbols-outlined text-[16px] text-zinc-300">lunch_dining</span>
            <span>Plan para {userGoal}</span>
          </button>
          
          <button
            type="button"
            onClick={() => onNavigateTab('nutricion')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#06151e] hover:bg-[#06151e] text-white font-body-sm transition-colors active:scale-95 border border-white/10"
          >
            <span className="material-symbols-outlined text-[16px] text-zinc-300">photo_camera</span>
            <span>Analizar mi comida</span>
          </button>
        </div>

        <div className="pt-3">
          <button
            type="button"
            onClick={() => onNavigateTab('max-ai')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black hover:bg-zinc-100 font-headline-md font-bold transition-all active:scale-[0.99] shadow-md"
          >
            <span>Abrir MAX AI</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Sugerencia de Comida Inteligente con Desglose Expandible de Micronutrientes */}
      <ExpandableMealSuggestionCard
        mealSuggestion={mealSuggestion}
        onApplyMeal={(p) => (onAddProtein ? onAddProtein(p) : onNavigateTab('nutricion'))}
        onNavigateTab={onNavigateTab}
        isDark={true}
      />

      {/* Resumen Gráfico del Cumplimiento de la Meta de Proteínas (Últimos 7 Días) */}
      <ProteinWeeklyChart
        currentProtein={protein}
        targetProtein={150}
        streakDays={streakDays}
        isDark={true}
        onNavigateNutrition={() => onNavigateTab('nutricion')}
      />

      {/* Tarjeta: RANKING GLOBAL */}
      <section className="rounded-xl bg-[#06151e] p-5 shadow-md border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#d6d6d6] text-[20px]">leaderboard</span>
            <span className="font-label-caps text-label-caps uppercase text-[#898a8c] tracking-wider font-bold">
              RANKING GLOBAL
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#06151e] text-white font-label-caps text-label-caps border border-white/10 font-semibold">
            Liga Diamante
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="font-metric-stat text-metric-stat text-white tracking-tight font-bold">#127</span>
            <span className="font-body-md text-[#898a8c] ml-1">de 5.284 atletas</span>
          </div>
          <span className="font-body-sm text-zinc-300 font-bold">38 XP para el Top 100</span>
        </div>

        <div className="space-y-1.5 pt-1">
          {/* #126 Mateo R. */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#06151e]/60 border border-white/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-label-caps text-label-caps text-[#898a8c] w-6">#126</span>
              <div className="w-6 h-6 rounded-full bg-[#06151e] flex items-center justify-center text-[#898a8c] text-xs font-bold">M</div>
              <span className="font-body-md text-white truncate font-medium">Mateo R.</span>
            </div>
            <span className="font-body-sm text-[#898a8c] font-medium flex-shrink-0">4.872 XP</span>
          </div>

          {/* #127 Santiago (Tú) */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/8 border border-white/18">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-label-caps text-label-caps text-zinc-200 font-bold w-6">#127</span>
              <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">TÚ</div>
              <span className="font-body-md text-white font-bold truncate">Santiago (Tú)</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="font-body-md text-zinc-100 font-bold">
                {xp.toLocaleString('es-ES')} XP
              </span>
              <span className="material-symbols-outlined text-[16px] text-zinc-300">arrow_drop_up</span>
            </div>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => onNavigateTab('retos')}
            className="inline-flex items-center gap-1 font-body-sm text-zinc-300 hover:text-white hover:underline font-bold transition-colors"
          >
            <span>Ver ranking completo</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  );
};
