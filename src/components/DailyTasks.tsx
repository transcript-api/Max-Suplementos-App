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
  isDark?: boolean;
}

export const DailyTasks: React.FC<DailyTasksProps> = ({
  tasks,
  onToggleTask,
  hydration,
  onAddWater,
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
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold dark:bg-[#2563eb]/20 bg-blue-50 dark:text-[#b4c5ff] text-blue-600 border dark:border-[#2563eb]/30 border-blue-200">
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
                  ? 'dark:bg-[#191c20]/90 bg-slate-50/90 dark:border-[#2563eb]/40 border-blue-400/40 shadow-sm'
                  : 'dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 hover:border-slate-300 dark:hover:border-[#3a3d44] shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Checkbox personalizado */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 border ${
                    isDone
                      ? 'bg-[#2563eb] border-[#2563eb] text-white shadow-sm'
                      : 'dark:bg-[#1d2024] bg-slate-100 dark:border-[#333539] border-slate-300'
                  }`}
                >
                  {isDone && (
                    <span className="material-symbols-outlined text-[18px] font-bold">
                      check
                    </span>
                  )}
                </div>

                {/* Ícono de la meta */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isDone
                      ? 'dark:bg-[#2563eb]/20 bg-blue-100 text-[#2563eb] dark:text-[#b4c5ff]'
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
                          ? 'dark:text-white text-slate-900 line-through opacity-90'
                          : 'dark:text-white text-slate-800'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-300'
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

              {/* Acción secundaria para Agua (botón rápido +250ml) */}
              {task.id === 'agua' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddWater();
                  }}
                  className="ml-2 px-2.5 py-1 rounded-lg text-xs font-bold dark:bg-[#2563eb]/20 bg-blue-50 dark:text-[#b4c5ff] text-blue-600 hover:bg-blue-100 dark:hover:bg-[#2563eb]/30 transition-colors flex items-center gap-1 border dark:border-[#2563eb]/30 border-blue-200"
                  title="Añadir 250ml de agua"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>250ml</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
