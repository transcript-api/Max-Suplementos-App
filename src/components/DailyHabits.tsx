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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-caps text-label-caps uppercase tracking-wider font-bold dark:text-[#8d90a0] text-slate-500">
                HÁBITOS DIARIOS · DAILY HABITS
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                No Nutricionales
              </span>
            </div>
            <p className="text-[11px] dark:text-slate-400 text-slate-500">
              Lectura, sueño y meditación que potencian tu energía diaria.
            </p>
          </div>
        </div>

        {/* Indicadores de Boost y Reseteo a Medianoche */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Badge del Impulso de Energía */}
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
              energyBoost > 0
                ? 'bg-amber-500/15 text-amber-500 dark:text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                : 'dark:bg-[#191c20] bg-slate-100 dark:text-slate-400 text-slate-500 border-slate-300 dark:border-[#282a2f]'
            }`}
            title="Aumento sumado directamente al puntaje de Energía Diaria"
          >
            <span className="text-[14px]">⚡</span>
            <span>+{energyBoost}% Boost de Energía</span>
          </div>

          {/* Badge de Reseteo a Medianoche */}
          <div
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold dark:bg-[#191c20] bg-slate-100 dark:text-slate-400 text-slate-600 border dark:border-[#282a2f] border-slate-200 flex items-center gap-1"
            title="Se reinicia automáticamente a las 00:00 cada noche"
          >
            <span className="material-symbols-outlined text-[14px] text-indigo-400">
              schedule
            </span>
            <span>Reseteo en: {countdown || 'medianoche'}</span>
          </div>
        </div>
      </div>

      {/* Banner de progreso y aviso de medianoche */}
      <div className="p-3 rounded-xl border dark:bg-[#191c20]/80 bg-white dark:border-[#282a2f] border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold dark:text-white text-slate-800">
                {completedCount} de {totalCount} hábitos completados hoy
              </span>
              {completedCount === totalCount && totalCount > 0 && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                  ¡Imparable!
                </span>
              )}
            </div>
            <p className="text-[11px] dark:text-slate-400 text-slate-500">
              Cada hábito suma porcentaje directo a tu barra de energía y se reinicia a las 00:00.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold dark:bg-[#2563eb]/20 bg-blue-50 hover:bg-blue-100 dark:hover:bg-[#2563eb]/30 dark:text-[#b4c5ff] text-blue-600 border dark:border-[#2563eb]/30 border-blue-200 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
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
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-500/10 hover:bg-slate-500/20 dark:text-slate-300 text-slate-600 border border-slate-300 dark:border-slate-700 active:scale-95 transition-all cursor-pointer"
              title="Simula el paso de la medianoche reseteando las casillas a desmarcadas"
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
          className="p-4 rounded-xl border border-blue-500/30 dark:bg-[#14171b] bg-blue-50/50 shadow-md space-y-3 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider dark:text-blue-300 text-blue-700 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">add_task</span>
              Crear Nuevo Hábito No Nutricional
            </h4>
            <span className="text-[11px] dark:text-slate-400 text-slate-500">
              Personalizado
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold dark:text-slate-300 text-slate-700 mb-1">
                Nombre del Hábito
              </label>
              <input
                type="text"
                placeholder="Ej. Ducha de contraste fría, Diario de gratitud..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg dark:bg-[#1d2024] bg-white border dark:border-[#282a2f] border-slate-300 dark:text-white text-slate-800 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold dark:text-slate-300 text-slate-700 mb-1">
                Descripción / Detalle breve
              </label>
              <input
                type="text"
                placeholder="Ej. 3 min de agua fría para activación mitocondrial..."
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg dark:bg-[#1d2024] bg-white border dark:border-[#282a2f] border-slate-300 dark:text-white text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold dark:text-slate-300 text-slate-700 mb-1">
                Categoría
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg dark:bg-[#1d2024] bg-white border dark:border-[#282a2f] border-slate-300 dark:text-white text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="lectura">Lectura & Enfoque</option>
                <option value="sueno">Sueño & Descanso</option>
                <option value="meditacion">Meditación & Mindfulness</option>
                <option value="salud">Salud & Ritmo Circadiano</option>
                <option value="personalizado">General / Rendimiento</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold dark:text-slate-300 text-slate-700 mb-1">
                Aporte al Puntaje de Energía
              </label>
              <select
                value={newBoost}
                onChange={(e) => setNewBoost(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg dark:bg-[#1d2024] bg-white border dark:border-[#282a2f] border-slate-300 dark:text-white text-slate-800 focus:outline-none focus:border-blue-500"
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
              className="px-3 py-1.5 rounded-lg text-xs font-medium dark:text-slate-400 text-slate-600 hover:bg-slate-200 dark:hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#2563eb] text-white hover:bg-blue-600 active:scale-95 shadow-sm"
            >
              Guardar Hábito
            </button>
          </div>
        </form>
      )}

      {feedbackNotice && (
        <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs text-center font-bold animate-fadeIn">
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
                  ? 'dark:bg-[#191c20]/90 bg-slate-50/90 dark:border-indigo-500/40 border-indigo-400/40 shadow-sm'
                  : 'dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 hover:border-slate-300 dark:hover:border-[#3a3d44] shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Checkbox personalizado animado */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 border ${
                    isDone
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-500 text-white shadow-sm'
                      : 'dark:bg-[#1d2024] bg-slate-100 dark:border-[#333539] border-slate-300 group-hover:border-indigo-400/50'
                  }`}
                >
                  {isDone && (
                    <span className="material-symbols-outlined text-[18px] font-bold">
                      check
                    </span>
                  )}
                </div>

                {/* Ícono temático */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isDone
                      ? 'dark:bg-indigo-500/20 bg-indigo-100 text-indigo-500 dark:text-indigo-300'
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
                          ? 'dark:text-slate-400 text-slate-500 line-through'
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
                        ? 'dark:text-slate-500 text-slate-400'
                        : 'dark:text-slate-400 text-slate-500'
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
                      ? 'bg-amber-500/20 text-amber-500 dark:text-amber-300 border-amber-500/30'
                      : 'dark:bg-[#14171b] bg-slate-100 dark:text-slate-400 text-slate-600 border-transparent'
                  }`}
                >
                  <span>⚡</span>
                  <span>+{habit.energyBoost}%</span>
                </span>

                <span
                  className={`hidden sm:inline-flex px-2 py-1 rounded-md text-[11px] font-semibold border ${
                    isDone
                      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                      : 'dark:bg-[#14171b] bg-slate-100 dark:text-slate-400 text-slate-600 border-transparent'
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
                    className="p-1 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors ml-1"
                    title="Eliminar este hábito personalizado"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      delete
                    </span>
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
