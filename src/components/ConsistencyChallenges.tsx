import React, { useState } from 'react';
import { DailyTaskItem } from './DailyTasks';

export interface ChallengeItem {
  id: string;
  title: string;
  category: 'Racha' | 'Diario' | 'Nutrición' | 'Hidratación';
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  xpReward: number;
  badge: string;
  icon: string;
  accentColor: string;
  completed: boolean;
  claimed?: boolean;
}

interface ConsistencyChallengesProps {
  streakDays: number;
  tasks: DailyTaskItem[];
  hydration: number;
  protein: number;
  onClaimReward: (xp: number, challengeTitle: string) => void;
  isDark?: boolean;
}

export const ConsistencyChallenges: React.FC<ConsistencyChallengesProps> = ({
  streakDays,
  tasks,
  hydration,
  protein,
  onClaimReward,
  isDark = true,
}) => {
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const isAllTasksDone = completedTasksCount === tasks.length;
  const displayedStreak = isAllTasksDone ? streakDays + 1 : streakDays;

  // Estado para la animación de recompensa
  const [activeReward, setActiveReward] = useState<{
    title: string;
    xp: number;
    badge: string;
    description: string;
  } | null>(null);

  const [claimedList, setClaimedList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('maxform_claimed_challenges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Lista de desafíos activos calculados dinámicamente según tareas y hábitos diarios
  const challenges: ChallengeItem[] = [
    {
      id: 'streak-30',
      title: '30 días sin romper la racha',
      category: 'Racha',
      description: 'Mantén tu racha intacta completando tus hábitos diarios sin faltar un solo día.',
      targetValue: 30,
      currentValue: displayedStreak,
      unit: 'días',
      xpReward: 500,
      badge: 'Titán de Acero',
      icon: 'military_tech',
      accentColor: '#f59e0b',
      completed: displayedStreak >= 30,
      claimed: claimedList.includes('streak-30'),
    },
    {
      id: 'daily-consistency',
      title: 'Consistencia Diaria Absoluta',
      category: 'Diario',
      description: 'Completa las 4 metas de tu Form Diaria (Agua, Fuerza, Suplementos, Sueño).',
      targetValue: tasks.length,
      currentValue: completedTasksCount,
      unit: 'metas',
      xpReward: 120,
      badge: 'Maestría Diaria',
      icon: 'verified',
      accentColor: '#2563eb',
      completed: isAllTasksDone,
      claimed: claimedList.includes('daily-consistency'),
    },
    {
      id: 'hydration-mastery',
      title: 'Hidratación Óptima 3.0 Litros',
      category: 'Hidratación',
      description: 'Alcanza la meta biológica de 3 litros de agua pura para potenciar el transporte celular.',
      targetValue: 3.0,
      currentValue: Number(hydration.toFixed(1)),
      unit: 'L',
      xpReward: 60,
      badge: 'Hidratación Pura',
      icon: 'water_drop',
      accentColor: '#0566d9',
      completed: hydration >= 3.0,
      claimed: claimedList.includes('hydration-mastery'),
    },
    {
      id: 'protein-power',
      title: 'Objetivo Anabólico 150g Proteína',
      category: 'Nutrición',
      description: 'Asegura 150g de proteína de alto valor biológico para la regeneración y síntesis muscular.',
      targetValue: 150,
      currentValue: Math.min(150, protein),
      unit: 'g',
      xpReward: 90,
      badge: 'Bloque Constructor',
      icon: 'fitness_center',
      accentColor: '#8b5cf6',
      completed: protein >= 150,
      claimed: claimedList.includes('protein-power'),
    },
  ];

  const handleClaim = (challenge: ChallengeItem) => {
    if (!challenge.completed || challenge.claimed) return;
    
    // Disparar animación de recompensa
    setActiveReward({
      title: challenge.title,
      xp: challenge.xpReward,
      badge: challenge.badge,
      description: challenge.description,
    });

    const nextClaimed = [...claimedList, challenge.id];
    setClaimedList(nextClaimed);
    try {
      localStorage.setItem('maxform_claimed_challenges', JSON.stringify(nextClaimed));
    } catch {}

    onClaimReward(challenge.xpReward, challenge.title);
  };

  return (
    <section className="rounded-2xl p-5 border dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 shadow-md space-y-4 relative overflow-hidden">
      {/* Resplandor sutil de fondo */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#2563eb]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[22px]">emoji_events</span>
          </div>
          <div>
            <h2 className="font-headline-md text-sm sm:text-base font-bold dark:text-white text-slate-900 flex items-center gap-2">
              Desafíos de Consistencia
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                LIGA ACTIVA
              </span>
            </h2>
            <p className="text-xs dark:text-[#8d90a0] text-slate-500">
              Retos calibrados que se actualizan al cumplir tus tareas y registrar tu nutrición diaria.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs font-semibold dark:text-[#8d90a0] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            {challenges.filter((c) => c.completed).length} de {challenges.length} completados hoy
          </span>
        </div>
      </div>

      {/* Cuadrícula de Tarjetas de Retos Activos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {challenges.map((c) => {
          const percent = Math.min(100, Math.round((c.currentValue / c.targetValue) * 100));
          const isJustCompleted = c.completed && !c.claimed;

          return (
            <div
              key={c.id}
              className={`rounded-xl p-4 border transition-all relative overflow-hidden flex flex-col justify-between ${
                isJustCompleted
                  ? 'dark:bg-[#1f232b] bg-amber-50/70 border-amber-500/50 shadow-md ring-2 ring-amber-500/20'
                  : c.claimed
                  ? 'dark:bg-[#16181d] bg-slate-50 dark:border-[#282a2f] border-slate-200 opacity-80'
                  : 'dark:bg-[#1d2024] bg-slate-50/50 dark:border-[#282a2f] border-slate-200 hover:border-slate-300 dark:hover:border-[#383a40]'
              }`}
            >
              {/* Badge superior */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: c.accentColor }}
                  >
                    <span className="material-symbols-outlined text-[18px]">{c.icon}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider dark:text-[#8d90a0] text-slate-500 block">
                      {c.category}
                    </span>
                    <h3 className="font-headline-md text-xs sm:text-sm font-bold dark:text-white text-slate-900 leading-tight">
                      {c.title}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2563eb]/20 text-[#2563eb] dark:text-[#b4c5ff] border border-[#2563eb]/30">
                    +{c.xpReward} XP
                  </span>
                </div>
              </div>

              {/* Descripción breve */}
              <p className="text-[11px] dark:text-[#c3c6d7] text-slate-600 mb-3 leading-relaxed">
                {c.description}
              </p>

              {/* Barra de progreso */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold dark:text-white text-slate-800 text-[11px]">
                    {c.currentValue} / {c.targetValue} {c.unit}
                  </span>
                  <span
                    className="font-bold text-[11px]"
                    style={{ color: c.accentColor }}
                  >
                    {percent}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full overflow-hidden dark:bg-[#111318] bg-slate-200 border dark:border-[#282a2f] border-slate-300">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: c.accentColor,
                    }}
                  ></div>
                </div>
              </div>

              {/* Botón de Reclamar o Estado */}
              <div className="mt-3 pt-2.5 border-t dark:border-[#282a2f] border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-[11px] dark:text-[#8d90a0] text-slate-500 flex items-center gap-1 font-medium">
                  <span className="text-[13px]">🎖️</span> {c.badge}
                </span>

                {isJustCompleted ? (
                  <button
                    type="button"
                    onClick={() => handleClaim(c)}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-[11px] shadow-md flex items-center gap-1 active:scale-95 transition-all animate-bounce"
                  >
                    <span className="material-symbols-outlined text-[14px]">celebration</span>
                    <span>¡Reclamar +{c.xpReward} XP!</span>
                  </button>
                ) : c.claimed ? (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>Reclamado</span>
                  </span>
                ) : (
                  <span className="text-[11px] dark:text-[#8d90a0] text-slate-400 italic">
                    En progreso
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal / Animación de Recompensa al Completar Desafío */}
      {activeReward && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full rounded-2xl dark:bg-[#191c20] bg-white border dark:border-[#282a2f] border-slate-200 p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            {/* Destello de fondo */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/30 rounded-full blur-2xl pointer-events-none"></div>

            {/* Ícono de Trofeo Animado */}
            <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-xl ring-4 ring-amber-500/30">
              <span className="text-4xl select-none animate-pulse">🏆</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 dark:text-amber-400">
                ¡DESAFÍO COMPLETADO!
              </span>
              <h3 className="text-xl font-black dark:text-white text-slate-900">
                {activeReward.title}
              </h3>
              <p className="text-xs dark:text-[#8d90a0] text-slate-600 pt-1">
                {activeReward.description}
              </p>
            </div>

            {/* Recompensa de XP */}
            <div className="p-3.5 rounded-xl dark:bg-[#111318] bg-amber-50 border dark:border-[#282a2f] border-amber-200 space-y-1">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-300 block">
                Recompensa Sumada a tu Cuenta:
              </span>
              <div className="text-2xl font-black text-amber-500 dark:text-amber-400 flex items-center justify-center gap-1.5">
                <span>+{activeReward.xp} XP</span>
                <span className="text-base font-medium text-slate-400">·</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40">
                  {activeReward.badge}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveReward(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white font-extrabold text-sm shadow-lg hover:shadow-blue-500/30 active:scale-98 transition-all"
            >
              ¡Continuar con mi Racha!
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
