import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';

interface ProteinWeeklyChartProps {
  currentProtein: number;
  targetProtein?: number;
  streakDays?: number;
  isDark?: boolean;
  onNavigateNutrition?: () => void;
  dailyHistory?: Record<string, number>;
  isDemoMode?: boolean;
}

interface DayData {
  day: string;
  fullDate: string;
  intake: number;
  target: number;
  percentage: number;
  isToday: boolean;
  status: 'cumplido' | 'cercano' | 'en_progreso' | 'incompleto';
}

export const ProteinWeeklyChart: React.FC<ProteinWeeklyChartProps> = ({
  currentProtein,
  targetProtein = 150,
  streakDays = 5,
  isDark = true,
  onNavigateNutrition,
  dailyHistory = {},
  isDemoMode = false,
}) => {
  const [viewMode, setViewMode] = useState<'grams' | 'percent'>('grams');

  // Construcción dinámica de los últimos 7 días terminando en "Hoy"
  const weeklyData: DayData[] = useMemo(() => {
    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const now = new Date();
    const result: DayData[] = [];

    // Patrón demostrativo sólo si el usuario activó explícitamente el Modo Demo
    const baseHistoricalIntakes = [
      Math.round(targetProtein * 1.02), // -6 días
      Math.round(targetProtein * 0.94), // -5 días
      Math.round(targetProtein * 1.05), // -4 días
      Math.round(targetProtein * 0.98), // -3 días
      Math.round(targetProtein * 1.07), // -2 días
      Math.round(targetProtein * 1.01), // -1 día
    ];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = i === 0 ? 'Hoy' : daysOfWeek[d.getDay()];
      const isToday = i === 0;

      const dateStr = d.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      });
      const isoDateKey = d.toISOString().slice(0, 10);

      let intake = 0;
      if (isToday) {
        intake = currentProtein;
      } else if (isDemoMode) {
        const histIndex = 6 - i;
        intake = streakDays > 0 ? (baseHistoricalIntakes[histIndex] || targetProtein) : Math.round(targetProtein * 0.4);
      } else {
        // Modo Real: tomar exclusivamente los datos reales registrados
        intake = dailyHistory[isoDateKey] || 0;
      }

      const percentage = Math.round((intake / targetProtein) * 100);

      let status: DayData['status'] = 'incompleto';
      if (percentage >= 100) {
        status = 'cumplido';
      } else if (isToday) {
        status = 'en_progreso';
      } else if (percentage >= 85) {
        status = 'cercano';
      } else {
        status = 'incompleto';
      }

      result.push({
        day: dayName,
        fullDate: `${dayName} (${dateStr})`,
        intake,
        target: targetProtein,
        percentage,
        isToday,
        status,
      });
    }

    return result;
  }, [currentProtein, targetProtein, streakDays]);

  // Cálculos estadísticos de los 7 días
  const daysMetCount = weeklyData.filter((d) => d.percentage >= 100).length;
  const avgIntake = Math.round(
    weeklyData.reduce((acc, curr) => acc + curr.intake, 0) / weeklyData.length
  );
  const avgPercentage = Math.round((avgIntake / targetProtein) * 100);
  const maxIntake = Math.max(...weeklyData.map((d) => d.intake));
  const totalWeeklyProtein = weeklyData.reduce((acc, curr) => acc + curr.intake, 0);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DayData = payload[0].payload;
      return (
        <div className="p-3 rounded-xl dark:bg-[#191c20] bg-white border dark:border-[#282a2f] border-slate-200 shadow-xl text-xs space-y-1.5 min-w-[170px]">
          <div className="flex items-center justify-between pb-1 border-b dark:border-[#282a2f] border-slate-200">
            <span className="font-bold dark:text-white text-slate-900">{data.fullDate}</span>
            {data.isToday && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2563eb]/20 text-[#b4c5ff] font-extrabold">
                HOY
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="dark:text-[#8d90a0] text-slate-500">Consumo:</span>
            <span className="font-extrabold text-[#2563eb] dark:text-[#b4c5ff]">
              {data.intake} g
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="dark:text-[#8d90a0] text-slate-500">Meta Diaria:</span>
            <span className="font-medium dark:text-white text-slate-800">{data.target} g</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t dark:border-[#282a2f] border-slate-200">
            <span className="dark:text-[#8d90a0] text-slate-500">Cumplimiento:</span>
            <span
              className={`font-black ${
                data.percentage >= 100
                  ? 'text-emerald-500 dark:text-emerald-400'
                  : data.percentage >= 80
                  ? 'text-blue-500'
                  : 'text-amber-500'
              }`}
            >
              {data.percentage}%
            </span>
          </div>

          <div className="pt-0.5">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full inline-block font-bold ${
                data.status === 'cumplido'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : data.status === 'en_progreso'
                  ? 'bg-blue-500/15 text-[#2563eb] dark:text-[#b4c5ff]'
                  : data.status === 'cercano'
                  ? 'bg-amber-500/15 text-amber-500'
                  : 'bg-rose-500/15 text-rose-500'
              }`}
            >
              {data.status === 'cumplido'
                ? '✅ Meta Alcanzada'
                : data.status === 'en_progreso'
                ? '⚡ En Progreso'
                : data.status === 'cercano'
                ? '🔶 Rango Cercano'
                : '❌ Bajo Meta'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section
      id="protein-compliance-weekly-section"
      className="p-4 sm:p-5 rounded-2xl dark:bg-[#191c20] bg-white border dark:border-[#282a2f] border-slate-200 shadow-sm space-y-4"
    >
      {/* Encabezado y Selector de Vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b dark:border-[#282a2f] border-slate-200">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-7 h-7 rounded-lg bg-[#2563eb]/20 text-[#2563eb] dark:text-[#b4c5ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">stacked_bar_chart</span>
            </div>
            <h2 className="font-headline-md text-base sm:text-lg font-bold dark:text-white text-slate-900">
              Cumplimiento de Meta de Proteínas (Últimos 7 Días)
            </h2>
            {isDemoMode ? (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                Datos Demo
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                Registro Real
              </span>
            )}
          </div>
          <p className="text-xs dark:text-[#8d90a0] text-slate-500">
            Monitoreo de consistencia para maximizar la síntesis proteica miofibrilar y recuperación.
          </p>
        </div>

        {/* Switcher de visualización: Gramos vs Porcentaje */}
        <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-100 dark:bg-[#111318] p-1 rounded-xl border dark:border-[#282a2f] border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('grams')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grams'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'dark:text-[#8d90a0] text-slate-600 hover:text-white'
            }`}
          >
            Gramos (g)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('percent')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'percent'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'dark:text-[#8d90a0] text-slate-600 hover:text-white'
            }`}
          >
            % Meta
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* KPI 1: Cumplimiento de Días */}
        <div className="p-3 rounded-xl dark:bg-[#111318] bg-slate-50 border dark:border-[#282a2f] border-slate-200">
          <span className="text-[10px] uppercase font-bold dark:text-[#8d90a0] text-slate-500 block">
            Días en Meta
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-xl font-extrabold dark:text-white text-slate-900">
              {daysMetCount}
            </span>
            <span className="text-xs dark:text-[#8d90a0] text-slate-500">/ 7 días</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 mt-0.5 block">
            {Math.round((daysMetCount / 7) * 100)}% consistencia
          </span>
        </div>

        {/* KPI 2: Promedio Diario */}
        <div className="p-3 rounded-xl dark:bg-[#111318] bg-slate-50 border dark:border-[#282a2f] border-slate-200">
          <span className="text-[10px] uppercase font-bold dark:text-[#8d90a0] text-slate-500 block">
            Promedio Semanal
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-xl font-extrabold text-[#2563eb] dark:text-[#b4c5ff]">
              {avgIntake}
            </span>
            <span className="text-xs dark:text-[#8d90a0] text-slate-500">g / día</span>
          </div>
          <span className="text-[10px] font-medium dark:text-[#8d90a0] text-slate-500 mt-0.5 block">
            {avgPercentage}% de la meta ({targetProtein}g)
          </span>
        </div>

        {/* KPI 3: Mejor Día */}
        <div className="p-3 rounded-xl dark:bg-[#111318] bg-slate-50 border dark:border-[#282a2f] border-slate-200">
          <span className="text-[10px] uppercase font-bold dark:text-[#8d90a0] text-slate-500 block">
            Pico Máximo
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-xl font-extrabold text-emerald-500 dark:text-emerald-400">
              {maxIntake}
            </span>
            <span className="text-xs dark:text-[#8d90a0] text-slate-500">g</span>
          </div>
          <span className="text-[10px] font-medium dark:text-[#8d90a0] text-slate-500 mt-0.5 block">
            Rango anabólico óptimo
          </span>
        </div>

        {/* KPI 4: Hoy en vivo */}
        <div className="p-3 rounded-xl dark:bg-[#111318] bg-slate-50 border dark:border-[#282a2f] border-slate-200">
          <span className="text-[10px] uppercase font-bold dark:text-[#8d90a0] text-slate-500 block">
            Hoy (En Vivo)
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-xl font-extrabold dark:text-white text-slate-900">
              {currentProtein}
            </span>
            <span className="text-xs dark:text-[#8d90a0] text-slate-500">/ {targetProtein}g</span>
          </div>
          <span
            className={`text-[10px] font-bold mt-0.5 block ${
              currentProtein >= targetProtein
                ? 'text-emerald-500 dark:text-emerald-400'
                : 'text-[#2563eb] dark:text-[#b4c5ff]'
            }`}
          >
            {currentProtein >= targetProtein
              ? '¡Meta superada!'
              : `Faltan ${Math.max(0, targetProtein - currentProtein)}g`}
          </span>
        </div>
      </div>

      {/* Gráfico de Barras Recharts con Línea de Referencia */}
      <div className="p-4 rounded-xl dark:bg-[#111318] bg-slate-50 border dark:border-[#282a2f] border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-xs dark:text-[#8d90a0] text-slate-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
              <span>≥100% Meta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#2563eb]"></span>
              <span>85-99%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
              <span>&lt;85%</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-[#2563eb]"></span>
            <span className="font-bold text-[#2563eb] dark:text-[#b4c5ff]">
              Meta diaria: {viewMode === 'grams' ? `${targetProtein}g` : '100%'}
            </span>
          </div>
        </div>

        <div className="w-full h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#282a2f' : '#e2e8f0'}
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke={isDark ? '#8d90a0' : '#64748b'}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: isDark ? '#282a2f' : '#cbd5e1' }}
              />
              <YAxis
                stroke={isDark ? '#8d90a0' : '#64748b'}
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: isDark ? '#282a2f' : '#cbd5e1' }}
                domain={viewMode === 'grams' ? [0, Math.max(180, maxIntake + 20)] : [0, 130]}
                unit={viewMode === 'grams' ? 'g' : '%'}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={viewMode === 'grams' ? targetProtein : 100}
                stroke="#2563eb"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: viewMode === 'grams' ? `Meta ${targetProtein}g` : 'Meta 100%',
                  fill: '#2563eb',
                  fontSize: 11,
                  position: 'insideTopRight',
                  offset: 5,
                }}
              />
              <Bar
                dataKey={viewMode === 'grams' ? 'intake' : 'percentage'}
                radius={[6, 6, 0, 0]}
                animationDuration={800}
              >
                {weeklyData.map((entry, index) => {
                  let fillColor = '#2563eb';
                  if (entry.percentage >= 100) {
                    fillColor = '#10b981'; // Verde Esmeralda si cumplió
                  } else if (entry.percentage >= 85) {
                    fillColor = '#2563eb'; // Azul Eléctrico si estuvo muy cerca
                  } else {
                    fillColor = '#f59e0b'; // Ámbar si faltó
                  }

                  if (entry.isToday) {
                    // Si es hoy y aún no completó la meta, se ve dinámico
                    fillColor = entry.percentage >= 100 ? '#10b981' : '#3b82f6';
                  }

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={fillColor}
                      stroke={entry.isToday ? '#ffffff' : 'transparent'}
                      strokeWidth={entry.isToday ? 2 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Nota de Rendimiento y Acceso Rápido */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl dark:bg-[#111318] bg-slate-50 border dark:border-[#282a2f] border-slate-200">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#2563eb] flex-shrink-0">
            health_and_safety
          </span>
          <p className="text-xs dark:text-[#c3c6d7] text-slate-600 leading-relaxed">
            Total acumulado semanal: <strong className="dark:text-white text-slate-900">{totalWeeklyProtein.toLocaleString('es-ES')}g</strong> de proteína asimilada. Mantener este ritmo previene catabolismo durante descansos.
          </p>
        </div>

        {onNavigateNutrition && (
          <button
            type="button"
            onClick={onNavigateNutrition}
            className="self-start sm:self-auto text-xs font-bold text-[#2563eb] dark:text-[#b4c5ff] hover:underline flex items-center gap-1 whitespace-nowrap"
          >
            <span>Ver dona y desglose de macros</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        )}
      </div>
    </section>
  );
};
