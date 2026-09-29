import React from 'react';

export interface DailyTaskItem {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  xpReward: number;
  completed: boolean;
  icon: string;
  accentColor: string;
}

interface DailyTasksProps {
  tasks: DailyTaskItem[];
  onToggleTask: (taskId: DailyTaskItem['id']) => void;
  hydration: number;
  onAddWater: () => void;
  onReduceWater?: () => void;
  isDark?: boolean;
}

export const DailyTasks: React.FC<DailyTasksProps> = ({
  tasks,
  onToggleTask,
  hydration,
  onAddWater,
  onReduceWater,
  isDark = true,
}) => {
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <section className="flex flex-col space-y-3 w-full">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="font-label-caps text-label-caps uppercase tracking-wider font-bold dark:text-[#8d90a0] text-slate-500">
            METAS DIARIAS
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold dark:bg-white/10 bg-slate-100 dark:text-zinc-200 text-slate-700 border dark:border-white/15 border-slate-200">
            {completedCount} de {tasks.length} completadas
          </span>
        </div>
        <span className="text-xs dark:text-[#8d90a0] text-slate-400">
          Toca para marcar
        </span>
      </div>

      <div className="space-y-2.5">
        {tasks.map((task) => {
          const isDone = task.completed;

          return (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggleTask(task.id);
                }
              }}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.99] ${
                isDone
                  ? 'dark:bg-white/5 bg-slate-50/90 dark:border-white/20 border-slate-300/60 shadow-sm'
                  : 'dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 hover:dark:border-white/15 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Checkbox monochrome premium */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 border ${
                    isDone
                      ? 'bg-white border-white text-black shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                      : 'dark:bg-[#1d2024] bg-slate-100 dark:border-[#333539] border-slate-300'
                  }`}
                >
                  {isDone && (
                    <span className="material-symbols-outlined text-[16px] font-black">
                      check
                    </span>
                  )}
                </div>

                {/* Ícono de la meta */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isDone
                      ? 'dark:bg-white/10 bg-slate-100 dark:text-white text-slate-700'
                      : 'dark:bg-[#1d2024] bg-slate-100 dark:text-[#8d90a0] text-slate-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {task.icon}
                  </span>
                </div>

                {/* Títulos y detalles */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-headline-md text-sm sm:text-base font-semibold truncate ${
                        isDone
                          ? 'dark:text-zinc-400 text-slate-500 line-through opacity-80'
                          : 'dark:text-white text-slate-800'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isDone
                          ? 'bg-white/15 text-white dark:text-zinc-100'
                          : 'dark:bg-[#1d2024] bg-slate-100 dark:text-[#8d90a0] text-slate-500'
                      }`}
                    >
                      +{task.xpReward} XP
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs">
                    <span className="dark:text-[#8d90a0] text-slate-500 truncate">
                      {task.id === 'agua'
                        ? `${hydration.toFixed(1).replace('.', ',')} / 3,0 L · ${task.subtitle}`
                        : task.subtitle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acción secundaria para Agua (botón rápido +250ml y corrección -250ml) */}
              {task.id === 'agua' && (
                <div className="flex items-center gap-1.5 ml-2">
                  {onReduceWater && hydration > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReduceWater();
                      }}
                      className="px-2 py-1 rounded-lg text-xs font-bold dark:bg-white/5 bg-slate-100 dark:text-zinc-400 text-slate-500 hover:dark:bg-white/10 hover:bg-slate-200 transition-colors flex items-center gap-0.5 border dark:border-white/10 border-slate-200"
                      title="Restar 250ml si te equivocaste"
                    >
                      <span className="material-symbols-outlined text-[13px]">remove</span>
                      <span className="hidden sm:inline">250ml</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddWater();
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold dark:bg-white/10 bg-slate-100 dark:text-white text-slate-700 hover:dark:bg-white/20 hover:bg-slate-200 transition-colors flex items-center gap-1 border dark:border-white/15 border-slate-200 shadow-sm"
                    title="Añadir 250ml de agua"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>250ml</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
