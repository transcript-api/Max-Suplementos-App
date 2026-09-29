import React, { useState, useEffect } from 'react';
import {
  DailyHabitItem,
  DailyHabitsData,
  getTimeUntilMidnightFormatted,
  getCategoryBadge,
  calculateHabitsEnergyBoost,
} from '../lib/dailyHabits';

interface DailyHabitsProps {
  habitsData: DailyHabitsData;
  onToggleHabit: (habitId: string) => void;
  onAddCustomHabit: (habit: Omit<DailyHabitItem, 'id' | 'completed' | 'completedAt'>) => void;
  onDeleteCustomHabit: (habitId: string) => void;
  onForceMidnightReset: () => void;
  energyBoost: number;
  isDark?: boolean;
  isDemoMode?: boolean;
}

export const DailyHabits: React.FC<DailyHabitsProps> = ({
  habitsData,
  onToggleHabit,
  onAddCustomHabit,
  onDeleteCustomHabit,
  onForceMidnightReset,
  energyBoost,
  isDark = true,
  isDemoMode = false,
}) => {
  const [countdown, setCountdown] = useState<string>('');
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSubtitle, setNewSubtitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<DailyHabitItem['category']>('personalizado');
  const [newBoost, setNewBoost] = useState<number>(3);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Reloj regresivo hacia medianoche actualizado cada 10 segundos
  useEffect(() => {
    const updateCountdown = () => {
      const { formatted } = getTimeUntilMidnightFormatted();
      setCountdown(formatted);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 10000);
    return () => clearInterval(interval);
  }, []);

  const completedCount = habitsData.habits.filter((h) => h.completed).length;
  const totalCount = habitsData.habits.length;

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let icon = 'star';
    if (newCategory === 'lectura') icon = 'auto_stories';
    if (newCategory === 'sueno') icon = 'bedtime';
    if (newCategory === 'meditacion') icon = 'self_improvement';
    if (newCategory === 'salud') icon = 'wb_sunny';

    onAddCustomHabit({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Hábito diario personalizado de alto rendimiento',
      category: newCategory,
      icon,
      energyBoost: newBoost,
      xpReward: 15,
      isCustom: true,
    });

    setNewTitle('');
    setNewSubtitle('');
    setIsAddOpen(false);
    setFeedbackNotice('¡Hábito añadido con éxito!');
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  return (
    <section className="flex flex-col space-y-3 w-full">
      {/* Encabezado Principal de Daily Habits */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-lg bg-white/8 text-zinc-200 border border-white/12 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-caps text-label-caps uppercase tracking-wider font-bold dark:text-[#8d90a0] text-slate-500">
                HÁBITOS DIARIOS
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/8 text-zinc-300 border border-white/12">
                No Nutricionales
              </span>
            </div>
            <p className="text-[11px] dark:text-slate-400 text-slate-500">
              Lectura, sueño y meditación que potencian tu energía diaria.
            </p>
          </div>
        </div>

        {/* Indicadores de Boost y Reseteo */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Badge del Impulso de Energía */}
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
              energyBoost > 0
                ? 'bg-white/12 text-zinc-100 border-white/20 shadow-sm'
                : 'dark:bg-[#191c20] bg-slate-100 dark:text-slate-400 text-slate-500 border-slate-300 dark:border-[#282a2f]'
            }`}
            title="Aumento sumado directamente al puntaje de Energía Diaria"
          >
            <span className="text-[14px]">⚡</span>
            <span>+{energyBoost}% Boost</span>
          </div>

          {/* Badge de Reseteo a Medianoche */}
          <div
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold dark:bg-[#191c20] bg-slate-100 dark:text-slate-400 text-slate-600 border dark:border-[#282a2f] border-slate-200 flex items-center gap-1"
            title="Se reinicia automáticamente a las 00:00"
          >
            <span className="material-symbols-outlined text-[14px] dark:text-zinc-400">schedule</span>
            <span>Reset: {countdown || 'medianoche'}</span>
          </div>
        </div>
      </div>

      {/* Banner de progreso */}
      <div className="p-3 rounded-xl border dark:bg-[#191c20]/80 bg-white dark:border-[#282a2f] border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 text-white border border-white/15 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold dark:text-white text-slate-800">
                {completedCount} de {totalCount} hábitos completados hoy
              </span>
              {completedCount === totalCount && totalCount > 0 && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white/15 text-white border border-white/20">
                  ¡Imparable!
                </span>
              )}
            </div>
            <p className="text-[11px] dark:text-slate-400 text-slate-500">
              Cada hábito suma % a tu barra de energía y se reinicia a las 00:00.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold dark:bg-white/8 bg-slate-100 hover:dark:bg-white/15 hover:bg-slate-200 dark:text-zinc-200 text-slate-700 border dark:border-white/12 border-slate-200 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isAddOpen ? 'close' : 'add'}
            </span>
            <span>{isAddOpen ? 'Cancelar' : 'Añadir Hábito'}</span>
          </button>

          {isDemoMode && (
            <button
              type="button"
              onClick={onForceMidnightReset}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium dark:bg-white/5 bg-slate-100 hover:dark:bg-white/10 dark:text-slate-400 text-slate-600 border dark:border-white/8 border-slate-200 active:scale-95 transition-all cursor-pointer"
              title="Simula el paso de la medianoche reseteando las casillas"
            >
              Simular 00:00
            </button>
          )}
        </div>
      </div>

      {/* Formulario desplegable para nuevo hábito */}
      {isAddOpen && (
        <form
          onSubmit={handleCreateCustom}
          className="p-4 rounded-xl border dark:border-white/12 border-slate-200 dark:bg-[#0f1013] bg-slate-50 shadow-md space-y-3 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider dark:text-zinc-200 text-slate-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">add_task</span>
              Crear Nuevo Hábito No Nutricional
            </h4>
            <span className="text-[11px] dark:text-slate-400 text-slate-500">Personalizado</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold dark:text-zinc-300 text-slate-700 mb-1">
                Nombre del Hábito
              </label>
              <input
                type="text"
                placeholder="Ej. Ducha de contraste fría, Diario de gratitud..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg dark:bg-[#1d2024] bg-white border dark:border-white/12 border-slate-300 dark:text-white text-slate-800 focus:outline-none dark:focus:border-white/30 focus:border-slate-400 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold dark:text-zinc-300 text-slate-700 mb-1">
                Descripción breve
              </label>
              <input
                type="text"
                placeholder="Ej. 3 min de agua fría para activación mitocondrial..."
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg dark:bg-[#1d2024] bg-white border dark:border-white/12 border-slate-300 dark:text-white text-slate-800 focus:outline-none dark:focus:border-white/30 focus:border-slate-400 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold dark:text-zinc-300 text-slate-700 mb-1">
                Categoría
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg dark:bg-[#1d2024] bg-white border dark:border-white/12 border-slate-300 dark:text-white text-slate-800 focus:outline-none dark:focus:border-white/30 focus:border-slate-400 transition-colors"
              >
                <option value="lectura">Lectura & Enfoque</option>
                <option value="sueno">Sueño & Descanso</option>
                <option value="meditacion">Meditación & Mindfulness</option>
                <option value="salud">Salud & Ritmo Circadiano</option>
                <option value="personalizado">General / Rendimiento</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold dark:text-zinc-300 text-slate-700 mb-1">
                Aporte al Puntaje de Energía
              </label>
              <select
                value={newBoost}
                onChange={(e) => setNewBoost(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg dark:bg-[#1d2024] bg-white border dark:border-white/12 border-slate-300 dark:text-white text-slate-800 focus:outline-none dark:focus:border-white/30 focus:border-slate-400 transition-colors"
              >
                <option value={2}>+2% Energía</option>
                <option value={3}>+3% Energía (Estándar)</option>
                <option value={4}>+4% Energía</option>
                <option value={5}>+5% Energía (Máximo impacto)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium dark:text-zinc-400 text-slate-600 hover:dark:bg-white/5 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white text-black hover:bg-zinc-100 active:scale-95 shadow-sm transition-all"
            >
              Guardar Hábito
            </button>
          </div>
        </form>
      )}

      {feedbackNotice && (
        <div className="p-2 rounded-lg bg-white/10 border border-white/20 text-zinc-100 text-xs text-center font-bold animate-fadeIn">
          {feedbackNotice}
        </div>
      )}

      {/* Lista de Hábitos */}
      <div className="space-y-2.5">
        {habitsData.habits.map((habit) => {
          const isDone = habit.completed;
          const badge = getCategoryBadge(habit.category);

          return (
            <div
              key={habit.id}
              onClick={() => onToggleHabit(habit.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggleHabit(habit.id);
                }
              }}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.99] group ${
                isDone
                  ? 'dark:bg-white/5 bg-slate-50/90 dark:border-white/18 border-slate-300/60 shadow-sm'
                  : 'dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 hover:dark:border-white/12 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Checkbox monochrome premium */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 border ${
                    isDone
                      ? 'bg-white border-white text-black shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                      : 'dark:bg-[#1d2024] bg-slate-100 dark:border-[#333539] border-slate-300 group-hover:dark:border-white/20'
                  }`}
                >
                  {isDone && (
                    <span className="material-symbols-outlined text-[16px] font-black">
                      check
                    </span>
                  )}
                </div>

                {/* Ícono temático */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isDone
                      ? 'dark:bg-white/10 bg-slate-100 dark:text-white text-slate-700'
                      : 'dark:bg-[#1d2024] bg-slate-100 dark:text-slate-400 text-slate-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {habit.icon}
                  </span>
                </div>

                {/* Información del Hábito */}
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs sm:text-sm font-bold tracking-tight truncate ${
                        isDone
                          ? 'dark:text-zinc-500 text-slate-400 line-through'
                          : 'dark:text-white text-slate-800'
                      }`}
                    >
                      {habit.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.colorClass}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] truncate mt-0.5 ${
                      isDone
                        ? 'dark:text-zinc-600 text-slate-400'
                        : 'dark:text-zinc-400 text-slate-500'
                    }`}
                  >
                    {habit.subtitle}
                  </span>
                </div>
              </div>

              {/* Badges de Boost y XP */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`px-2 py-1 rounded-md text-[11px] font-bold border flex items-center gap-1 ${
                    isDone
                      ? 'bg-white/12 text-white border-white/20'
                      : 'dark:bg-[#14171b] bg-slate-100 dark:text-zinc-500 text-slate-600 border-transparent'
                  }`}
                >
                  <span>⚡</span>
                  <span>+{habit.energyBoost}%</span>
                </span>

                <span
                  className={`hidden sm:inline-flex px-2 py-1 rounded-md text-[11px] font-semibold border ${
                    isDone
                      ? 'bg-white/8 text-zinc-300 border-white/12'
                      : 'dark:bg-[#14171b] bg-slate-100 dark:text-zinc-500 text-slate-600 border-transparent'
                  }`}
                >
                  +{habit.xpReward} XP
                </span>

                {habit.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCustomHabit(habit.id);
                    }}
                    className="p-1 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-zinc-200 transition-colors ml-1"
                    title="Eliminar este hábito personalizado"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
