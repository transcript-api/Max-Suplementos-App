import React from 'react';
import { calculateLevelFromXP } from '../lib/gamification';

interface HomeTabProps {
  onNavigateTab: (tab: string, prompt?: string) => void;
  hydration: number;
  onAddWater: () => void;
  xp: number;
  completedCount: number;
  totalObjectivesCount?: number;
  formScore: number;
  streakDays: number;
  userName?: string;
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
  userName = 'Atleta',
  firstDashboardSeen = true,
  onDismissFirstDashboard,
  isDemoMode = false,
}) => {
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
        <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-blue-900/80 to-indigo-950/90 border border-[#2563EB]/50 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
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
          <button
            type="button"
            onClick={onDismissFirstDashboard}
            className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 whitespace-nowrap self-end sm:self-center"
          >
            Ver mis objetivos
          </button>
        </div>
      )}

      {/* Saludo y Racha */}
      <section className="flex flex-col gap-2 pt-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-[#8d90a0] uppercase tracking-wider">
              {capitalizedDate}
            </span>
            <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-[#e2e2e8] font-bold">
              Buenos días, {userName}
            </h1>
            {isBrandNewAccount && (
              <p className="text-xs text-blue-400 font-semibold tracking-wide">
                Hoy empieza tu Form.
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#282a2f] text-white border border-[#333539] shadow-sm">
            <span className="text-base select-none">🔥</span>
            <span className="font-label-caps text-label-caps tracking-normal font-bold">
              {streakDays} días de racha
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#2563eb]/20 text-[#b4c5ff] font-label-caps text-label-caps uppercase font-bold border border-[#2563eb]/30">
            Nivel {levelInfo.levelNumber}
          </span>
          <span className="font-body-sm text-[#8d90a0]">·</span>
          <span className="font-body-sm text-[#8d90a0] font-medium">{levelInfo.levelName}</span>
          <span className="font-body-sm text-[#8d90a0]">·</span>
          <span className="font-body-sm text-[#b4c5ff] font-bold">
            {xp.toLocaleString('es-ES')} XP
          </span>
        </div>
      </section>

      {/* Tarjeta Héroe: FORM DIARIA */}
      <section className="relative overflow-hidden rounded-xl bg-[#191c20] p-5 shadow-xl border border-[#282a2f]">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#2563eb]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b4c5ff] text-[20px]">bolt</span>
            <span className="font-label-caps text-label-caps uppercase text-[#8d90a0] tracking-wider font-bold">
              FORM DIARIA
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#1d2024] text-[#b4c5ff] font-label-caps text-label-caps border border-[#282a2f] font-semibold">
            {formScore === 0 ? 'COMIENZA HOY' : `${formScore}% HOY`}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Anillo Circular de Progreso Técnico SVG Concéntrico */}
          <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
            <svg aria-hidden="true" className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              {/* Pista exterior */}
              <circle className="stroke-[#1d2024]" cx="60" cy="60" fill="none" r="50" strokeWidth="7" />
              <circle 
                className="stroke-[#2563eb] transition-all duration-700 ease-out" 
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
              <span className="font-label-caps text-label-caps text-[#8d90a0] uppercase mt-1 font-bold">
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
              <span className="font-body-sm text-[#b4c5ff] font-semibold">Meta 80%+</span>
            </div>
            
            <p className="font-body-sm text-[#c3c6d7] leading-relaxed">
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
            <span className="font-label-caps text-label-caps uppercase text-[#8d90a0] tracking-wider font-bold">
              OBJETIVOS DE HOY
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-ping"></span>
          </div>
          <span className="font-body-sm text-[#8d90a0]">Actualizado en tiempo real</span>
        </div>

        {/* Tarjeta 1: Entrenamiento */}
        <div className="flex items-center justify-between p-4 bg-[#191c20] rounded-xl border border-[#282a2f]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#2563eb]/20 flex items-center justify-center text-[#b4c5ff] flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">fitness_center</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-headline-md text-headline-md text-white truncate font-semibold">
                  Entrenamiento
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#2563eb] text-white font-label-caps text-label-caps uppercase font-bold">
                  +25 XP
                </span>
              </div>
              <span className="font-body-sm text-[#8d90a0]">45 min pesas · Empuje & Tríceps</span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#2563eb]/30 flex items-center justify-center text-[#b4c5ff] flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">done</span>
          </div>
        </div>

        {/* Tarjeta 2: Proteína */}
        <div className="flex flex-col p-4 bg-[#191c20] rounded-xl border border-[#282a2f] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1d2024] flex items-center justify-center text-[#b4c5ff] flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">restaurant</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-white font-semibold">
                  Proteína Diaria
                </span>
                <span className="font-body-sm text-[#8d90a0]">Meta metabólica: 150 g</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-headline-md text-headline-md text-white font-bold">
                128 / 150 g
              </span>
              <span className="block font-body-sm text-[#b4c5ff] font-medium">
                Faltan 22 g
              </span>
            </div>
          </div>
          <div className="w-full bg-[#1d2024] h-2 rounded-full overflow-hidden">
            <div className="bg-[#2563eb] h-full rounded-full transition-all duration-500" style={{ width: '85.3%' }}></div>
          </div>
        </div>

        {/* Tarjeta 3: Hidratación (Interactiva) */}
        <div className="flex flex-col p-4 bg-[#191c20] rounded-xl border border-[#282a2f] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1d2024] flex items-center justify-center text-[#adc6ff] flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">water_drop</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-headline-md text-headline-md text-white font-semibold">
                    Hidratación
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-label-caps text-label-caps uppercase font-bold ${
                    isHydrationDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-[#1d2024] text-[#8d90a0]'
                  }`}>
                    {isHydrationDone ? '¡Completado!' : 'En curso'}
                  </span>
                </div>
                <span className="font-body-sm text-[#8d90a0]">Meta basal: 3,0 L</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-headline-md text-headline-md text-white font-bold">
                {hydration.toFixed(1).replace('.', ',')} / 3,0 L
              </span>
              <span className="block font-body-sm text-[#adc6ff] font-medium">
                {hydrationPct}% completado
              </span>
            </div>
          </div>

          <div className="w-full bg-[#1d2024] h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isHydrationDone ? 'bg-emerald-500' : 'bg-[#0566d9]'
              }`} 
              style={{ width: `${hydrationPct}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="font-body-sm text-[#8d90a0]">
              {isHydrationDone ? '¡Excelente hidratación diaria lograda (+15 XP)!' : 'Agrega un vaso de agua tras tu sesión'}
            </span>
            <button
              type="button"
              onClick={onAddWater}
              disabled={isHydrationDone}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-body-sm text-body-sm font-bold transition-all shadow-md active:scale-95 ${
                isHydrationDone 
                  ? 'bg-[#1d2024] text-[#8d90a0] cursor-not-allowed opacity-60' 
                  : 'bg-[#2563eb] hover:bg-[#3b82f6] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>+250 ml</span>
            </button>
          </div>
        </div>

        {/* Tarjeta 4: Suplementación */}
        <div className="flex items-center justify-between p-4 bg-[#191c20] rounded-xl border border-[#282a2f]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#2563eb]/20 flex items-center justify-center text-[#b4c5ff] flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">medication</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-headline-md text-headline-md text-white truncate font-semibold">
                  Suplementación
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#2563eb] text-white font-label-caps text-label-caps uppercase font-bold">
                  +10 XP
                </span>
              </div>
              <span className="font-body-sm text-[#8d90a0] truncate">
                Whey Isolada (30g) & Creatina Creapure (5g) listos
              </span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#2563eb]/30 flex items-center justify-center text-[#b4c5ff] flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">done</span>
          </div>
        </div>

        {/* Tarjeta 5: Sueño */}
        <div className="flex items-center justify-between p-4 bg-[#191c20] rounded-xl border border-[#282a2f]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#1d2024] flex items-center justify-center text-[#b4c5ff] flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">bedtime</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-headline-md text-headline-md text-white font-semibold">
                  Sueño & Recuperación
                </span>
              </div>
              <span className="font-body-sm text-[#8d90a0]">Meta: 8h · Eficiencia 89%</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="font-headline-md text-headline-md text-white font-bold">
              7 h 20 min
            </span>
            <span className="block font-body-sm text-[#b4c5ff] font-medium">
              En rango óptimo
            </span>
          </div>
        </div>
      </section>

      {/* Tarjeta Vista Previa "MAX AI" */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#191c20] via-[#191c20] to-[#2563eb]/15 p-5 shadow-lg border border-[#282a2f]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2563eb]/30 text-[#b4c5ff]">
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            </div>
            <span className="font-label-caps text-label-caps uppercase text-[#b4c5ff] tracking-wider font-bold">
              MAX AI · COACH METABÓLICO
            </span>
          </div>
          <span className="font-body-sm text-[#8d90a0] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            En vivo
          </span>
        </div>

        <blockquote className="my-2 pl-3 border-l-2 border-[#2563eb] py-0.5">
          <p className="font-body-md text-body-md text-white leading-snug italic">
            «Te falta un objetivo para completar tu Form diaria. Una porción de yogur griego o shake te lleva a los 150 g de proteína.»
          </p>
        </blockquote>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => onNavigateTab('max-ai', '¿Qué debería comer para llegar a mis 150g de proteína?')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1d2024] hover:bg-[#282a2f] text-white font-body-sm transition-colors active:scale-95 border border-[#282a2f]"
          >
            <span className="material-symbols-outlined text-[16px] text-[#b4c5ff]">lunch_dining</span>
            <span>¿Qué debería comer?</span>
          </button>
          
          <button
            type="button"
            onClick={() => onNavigateTab('nutricion')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1d2024] hover:bg-[#282a2f] text-white font-body-sm transition-colors active:scale-95 border border-[#282a2f]"
          >
            <span className="material-symbols-outlined text-[16px] text-[#b4c5ff]">photo_camera</span>
            <span>Analizar mi comida</span>
          </button>
        </div>

        <div className="pt-3">
          <button
            type="button"
            onClick={() => onNavigateTab('max-ai')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#3b82f6] text-white font-headline-md font-bold transition-all active:scale-[0.99] shadow-md"
          >
            <span>Abrir MAX AI</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Tarjeta: RANKING GLOBAL */}
      <section className="rounded-xl bg-[#191c20] p-5 shadow-md border border-[#282a2f] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b4c5ff] text-[20px]">leaderboard</span>
            <span className="font-label-caps text-label-caps uppercase text-[#8d90a0] tracking-wider font-bold">
              RANKING GLOBAL
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#1d2024] text-white font-label-caps text-label-caps border border-[#282a2f] font-semibold">
            Liga Diamante
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="font-metric-stat text-metric-stat text-white tracking-tight font-bold">#127</span>
            <span className="font-body-md text-[#8d90a0] ml-1">de 5.284 atletas</span>
          </div>
          <span className="font-body-sm text-[#b4c5ff] font-bold">38 XP para el Top 100</span>
        </div>

        <div className="space-y-1.5 pt-1">
          {/* #126 Mateo R. */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#1d2024]/60 border border-[#282a2f]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-label-caps text-label-caps text-[#8d90a0] w-6">#126</span>
              <div className="w-6 h-6 rounded-full bg-[#282a2f] flex items-center justify-center text-[#8d90a0] text-xs font-bold">M</div>
              <span className="font-body-md text-white truncate font-medium">Mateo R.</span>
            </div>
            <span className="font-body-sm text-[#8d90a0] font-medium flex-shrink-0">4.872 XP</span>
          </div>

          {/* #127 Santiago (Tú) */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#2563eb]/20 border border-[#2563eb]/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-label-caps text-label-caps text-[#b4c5ff] font-bold w-6">#127</span>
              <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-xs font-bold">TÚ</div>
              <span className="font-body-md text-white font-bold truncate">Santiago (Tú)</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="font-body-md text-[#b4c5ff] font-bold">
                {xp.toLocaleString('es-ES')} XP
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#b4c5ff]">arrow_drop_up</span>
            </div>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => onNavigateTab('retos')}
            className="inline-flex items-center gap-1 font-body-sm text-[#b4c5ff] hover:underline font-bold transition-colors"
          >
            <span>Ver ranking completo</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  );
};
