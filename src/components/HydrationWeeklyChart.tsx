import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

export type HydrationDateRange = '7days' | '4weeks';

export interface HydrationWeeklyChartProps {
  currentHydration: number; // en Litros
  targetHydration?: number; // en Litros
  streakDays?: number;
  isDark?: boolean;
  onAddWater?: () => void;
  onNavigateNutrition?: () => void;
  hydrationHistory?: Record<string, number>;
  isDemoMode?: boolean;
}

interface HydrationChartItem {
  day: string;
  fullDate: string;
  intake: number; // en Litros
  target: number; // en Litros
  percentage: number;
  totalIntake?: number;
  daysMet?: number;
  isToday?: boolean;
  isCurrentPeriod?: boolean;
  status: 'cumplido' | 'cercano' | 'en_progreso' | 'incompleto';
}

export const HydrationWeeklyChart: React.FC<HydrationWeeklyChartProps> = ({
  currentHydration,
  targetHydration = 2.5,
  streakDays = 5,
  isDark = true,
  onAddWater,
  onNavigateNutrition,
  hydrationHistory = {},
  isDemoMode = false,
}) => {
  const [viewMode, setViewMode] = useState<'liters' | 'percent'>('liters');
  const [dateRange, setDateRange] = useState<HydrationDateRange>('7days');

  // Construcción dinámica de los últimos 7 días terminando en "Hoy"
  const weeklyData: HydrationChartItem[] = useMemo(() => {
    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const now = new Date();
    const result: HydrationChartItem[] = [];

    // Patrón demostrativo realista solo si está en modo demo
    const baseHistoricalLiters = [
      +(targetHydration * 1.05).toFixed(2), // -6 días
      +(targetHydration * 0.92).toFixed(2), // -5 días
      +(targetHydration * 1.10).toFixed(2), // -4 días
      +(targetHydration * 0.98).toFixed(2), // -3 días
      +(targetHydration * 1.04).toFixed(2), // -2 días
      +(targetHydration * 1.02).toFixed(2), // -1 día
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
        intake = +(currentHydration.toFixed(2));
      } else if (isDemoMode) {
        const histIndex = 6 - i;
        intake = streakDays > 0 ? (baseHistoricalLiters[histIndex] || targetHydration) : +(targetHydration * 0.45).toFixed(2);
      } else {
        intake = hydrationHistory[isoDateKey] ? +(hydrationHistory[isoDateKey].toFixed(2)) : 0;
      }

      const percentage = Math.round((intake / targetHydration) * 100);

      let status: HydrationChartItem['status'] = 'incompleto';
      if (percentage >= 100) {
        status = 'cumplido';
      } else if (isToday) {
        status = 'en_progreso';
      } else if (percentage >= 80) {
        status = 'cercano';
      } else {
        status = 'incompleto';
      }

      result.push({
        day: dayName,
        fullDate: `${dayName} (${dateStr})`,
        intake,
        target: targetHydration,
        percentage,
        isToday,
        status,
      });
    }

    return result;
  }, [currentHydration, targetHydration, streakDays, hydrationHistory, isDemoMode]);

  // Construcción dinámica de las últimas 4 semanas (bloques de 7 días)
  const fourWeeksData: HydrationChartItem[] = useMemo(() => {
    const now = new Date();
    const result: HydrationChartItem[] = [];

    const demoWeeklyFactors = [0.94, 0.99, 1.06, 1.02];

    for (let w = 3; w >= 0; w--) {
      const isCurrentWeek = w === 0;
      const weekLabel = isCurrentWeek ? 'Esta Sem' : `Sem -${w}`;

      const startDate = new Date();
      startDate.setDate(now.getDate() - (w * 7 + 6));
      const endDate = new Date();
      endDate.setDate(now.getDate() - (w * 7));

      const startStr = startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      const endStr = endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      const fullDate = `${isCurrentWeek ? 'Semana Actual' : `Semana ${4 - w}`} (${startStr} - ${endStr})`;

      let totalLiters = 0;
      let daysWithData = 0;
      let daysMet = 0;

      for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
        const d = new Date();
        d.setDate(now.getDate() - (w * 7 + dayOffset));
        const isoDate = d.toISOString().slice(0, 10);
        const isTodayDate = w === 0 && dayOffset === 0;

        let dayVal = 0;
        if (isTodayDate) {
          dayVal = currentHydration;
          if (currentHydration > 0) daysWithData++;
        } else if (isDemoMode) {
          const factor = demoWeeklyFactors[3 - w] || 1.0;
          const variance = (dayOffset % 2 === 0 ? 0.15 : -0.15);
          dayVal = streakDays > 0 ? +(targetHydration * factor + variance).toFixed(2) : +(targetHydration * 0.5).toFixed(2);
          daysWithData++;
        } else {
          dayVal = hydrationHistory[isoDate] || 0;
          if (dayVal > 0) daysWithData++;
        }

        totalLiters += dayVal;
        if (dayVal >= targetHydration) {
          daysMet++;
        }
      }

      const denominator = isCurrentWeek ? Math.max(1, daysWithData || 1) : 7;
      const avgDailyIntake = +(totalLiters / denominator).toFixed(2);
      const percentage = Math.round((avgDailyIntake / targetHydration) * 100);

      let status: HydrationChartItem['status'] = 'incompleto';
      if (percentage >= 100) {
        status = 'cumplido';
      } else if (isCurrentWeek) {
        status = 'en_progreso';
      } else if (percentage >= 80) {
        status = 'cercano';
      } else {
        status = 'incompleto';
      }

      result.push({
        day: weekLabel,
        fullDate,
        intake: avgDailyIntake,
        totalIntake: +(totalLiters.toFixed(2)),
        daysMet,
        target: targetHydration,
        percentage,
        isToday: isCurrentWeek,
        isCurrentPeriod: isCurrentWeek,
        status,
      });
    }

    return result;
  }, [currentHydration, targetHydration, streakDays, hydrationHistory, isDemoMode]);

  // Datos activos según selector
  const activeData = dateRange === '7days' ? weeklyData : fourWeeksData;

  // Métricas agregadas
  const daysMetCount = activeData.filter((d) => d.percentage >= 100).length;
  const avgIntake = +(
    activeData.reduce((acc, curr) => acc + curr.intake, 0) / (activeData.length || 1)
  ).toFixed(2);
  const avgPercentage = Math.round((avgIntake / targetHydration) * 100);
  const maxIntake = Math.max(...activeData.map((d) => d.intake));
  const totalHydrationPeriod = +(
    activeData.reduce((acc, curr) => acc + (curr.totalIntake || curr.intake), 0)
  ).toFixed(2);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: HydrationChartItem = payload[0].payload;
      return (
        <div className="p-3 rounded-xl dark:bg-[#191c20] bg-white border dark:border-[#282a2f] border-slate-200 shadow-xl text-xs space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between pb-1 border-b dark:border-[#282a2f] border-slate-200">
            <span className="font-bold dark:text-white text-slate-900">{data.fullDate}</span>
            {data.isToday && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#06b6d4]/20 text-[#06b6d4]">
                HOY
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="dark:text-[#8d90a0] text-slate-500">Ingesta Registrada:</span>
              <span className="font-extrabold text-[#06b6d4] text-sm">
                {data.intake.toFixed(2)} L
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="dark:text-[#8d90a0] text-slate-500">Meta Basal:</span>
              <span className="font-medium dark:text-slate-300 text-slate-700">
                {data.target.toFixed(1)} L
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="dark:text-[#8d90a0] text-slate-500">Cumplimiento:</span>
              <span
                className={`font-bold ${
                  data.percentage >= 100
                    ? 'text-emerald-500'
                    : data.percentage >= 80
                    ? 'text-cyan-500'
                    : 'text-amber-500'
                }`}
              >
                {data.percentage}%
              </span>
            </div>
            {data.daysMet !== undefined && (
              <div className="flex items-center justify-between pt-1 border-t dark:border-[#282a2f] border-slate-200 text-[10px]">
                <span className="dark:text-[#8d90a0] text-slate-500">Días cumplidos:</span>
                <span className="font-bold text-white">{data.daysMet} de 7 días</span>
              </div>
            )}
          </div>

          <div className="pt-1">
            <span
              className={`inline-block w-full text-center px-2 py-0.5 rounded text-[10px] font-bold ${
                data.status === 'cumplido'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : data.status === 'en_progreso'
                  ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                  : data.status === 'cercano'
                  ? 'bg-amber-500/15 text-amber-500'
                  : 'bg-rose-500/15 text-rose-500'
              }`}
            >
              {data.status === 'cumplido'
                ? '✅ Meta Alcanzada'
                : data.status === 'en_progreso'
                ? '💧 En Progreso Hoy'
                : data.status === 'cercano'
                ? '🔶 Rango Óptimo Cercano'
                : '❌ Bajo Meta Basal'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Escala máxima calculada para el eje Y con holgura visual
  const yAxisMax = Math.max(
    viewMode === 'liters' ? Math.ceil(targetHydration + 1.0) : 120,
    viewMode === 'liters' ? Math.ceil(maxIntake + 0.5) : 100
  );

  return (
    <section
      id="hydration-compliance-weekly-section"
      className="p-4 sm:p-5 rounded-2xl dark:bg-[#191c20] bg-white border dark:border-[#282a2f] border-slate-200 shadow-sm space-y-4"
    >
      {/* Encabezado Principal y Selectores */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b dark:border-[#282a2f] border-slate-200">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">water_drop</span>
            </div>
            <h2 className="font-headline-md text-base sm:text-lg font-bold dark:text-white text-slate-900">
              Hidratación Semanal (Litros)
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
            {dateRange === '7days'
              ? 'Monitoreo de ingesta hídrica diaria (L) en los últimos 7 días para volemia y rendimiento celular.'
              : 'Evolución de las últimas 4 semanas para evaluar hidratación sostenida y recuperación de electrolitos.'}
          </p>
        </div>

        {/* Barra de Controles: Selector 7 días / 4 semanas + Switch Litros / % */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Rango */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#111318] p-1 rounded-xl border dark:border-[#282a2f] border-slate-200">
            <button
              type="button"
              onClick={() => setDateRange('7days')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                dateRange === '7days'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'dark:text-[#8d90a0] text-slate-600 hover:text-white'
              }`}
              title="Ver los últimos 7 días detallados"
            >
              <span className="material-symbols-outlined text-[14px]">calendar_view_week</span>
              <span>Últimos 7 días</span>
            </button>
            <button
              type="button"
              onClick={() => setDateRange('4weeks')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                dateRange === '4weeks'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'dark:text-[#8d90a0] text-slate-600 hover:text-white'
              }`}
              title="Ver las últimas 4 semanas"
            >
              <span className="material-symbols-outlined text-[14px]">calendar_month</span>
              <span>Últimas 4 semanas</span>
            </button>
          </div>

          {/* Switch Litros vs % */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#111318] p-1 rounded-xl border dark:border-[#282a2f] border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('liters')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'liters'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'dark:text-[#8d90a0] text-slate-600 hover:text-white'
              }`}
            >
              Litros (L)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('percent')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'percent'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'dark:text-[#8d90a0] text-slate-600 hover:text-white'
              }`}
            >
              Porcentaje (%)
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas de Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {/* Promedio Diario */}
        <div className="p-3 sm:p-3.5 rounded-xl border dark:bg-[#111318] bg-slate-50 dark:border-[#282a2f] border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold dark:text-[#8d90a0] text-slate-400">
              Promedio Diario
            </span>
            <span className="text-cyan-500 text-xs">💧</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black dark:text-white text-slate-900">
              {viewMode === 'liters' ? `${avgIntake} L` : `${avgPercentage}%`}
            </span>
          </div>
          <span
            className={`text-[10px] font-semibold block mt-0.5 ${
              avgIntake >= targetHydration
                ? 'text-emerald-500'
                : avgIntake >= targetHydration * 0.8
                ? 'text-cyan-500'
                : 'text-amber-500'
            }`}
          >
            {avgIntake >= targetHydration
              ? `Meta superada (${targetHydration}L base)`
              : `Faltan ${(targetHydration - avgIntake).toFixed(1)}L prom`}
          </span>
        </div>

        {/* Días Cumplidos */}
        <div className="p-3 sm:p-3.5 rounded-xl border dark:bg-[#111318] bg-slate-50 dark:border-[#282a2f] border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold dark:text-[#8d90a0] text-slate-400">
              Días Cumplidos
            </span>
            <span className="text-emerald-500 text-xs">🎯</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-500">
              {daysMetCount}
            </span>
            <span className="text-xs dark:text-[#8d90a0] text-slate-500">
              / {activeData.length} {dateRange === '7days' ? 'días' : 'semanas'}
            </span>
          </div>
          <span className="text-[10px] text-[#8d90a0] block mt-0.5">
            {Math.round((daysMetCount / (activeData.length || 1)) * 100)}% consistencia hídrica
          </span>
        </div>

        {/* Ingesta Total */}
        <div className="p-3 sm:p-3.5 rounded-xl border dark:bg-[#111318] bg-slate-50 dark:border-[#282a2f] border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold dark:text-[#8d90a0] text-slate-400">
              Volumen Total
            </span>
            <span className="text-blue-500 text-xs">🌊</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-cyan-400">
              {totalHydrationPeriod} L
            </span>
          </div>
          <span className="text-[10px] text-[#8d90a0] block mt-0.5">
            {dateRange === '7days' ? 'En los últimos 7 días' : 'En 4 semanas acumuladas'}
          </span>
        </div>

        {/* Estado Hoy */}
        <div className="p-3 sm:p-3.5 rounded-xl border dark:bg-[#111318] bg-slate-50 dark:border-[#282a2f] border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold dark:text-[#8d90a0] text-slate-400">
              Hoy
            </span>
            <span className="text-cyan-400 text-xs">⚡</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#06b6d4]">
              {currentHydration.toFixed(2)} L
            </span>
            <span className="text-xs dark:text-[#8d90a0] text-slate-500">
              / {targetHydration} L
            </span>
          </div>
          <span
            className={`text-[10px] font-semibold block mt-0.5 ${
              currentHydration >= targetHydration
                ? 'text-emerald-500'
                : 'text-cyan-500'
            }`}
          >
            {currentHydration >= targetHydration
              ? '✅ Meta de hoy completada'
              : `Faltan ${(targetHydration - currentHydration).toFixed(2)} L`}
          </span>
        </div>
      </div>

      {/* Gráfico Recharts LineChart de Hidratación */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold text-cyan-500">
              <span className="w-3 h-1 rounded-full bg-cyan-500"></span>
              {viewMode === 'liters' ? 'Litros consumidos' : '% Cumplimiento'}
            </span>
            <span className="flex items-center gap-1.5 dark:text-[#8d90a0] text-slate-500">
              <span className="w-3 h-0.5 border-t border-dashed border-cyan-400"></span>
              Meta Basal: {targetHydration.toFixed(1)} L
            </span>
          </div>
          <span className="text-[11px] dark:text-[#8d90a0] text-slate-400 hidden sm:inline">
            Puntos interactivos · Toca para detalles
          </span>
        </div>

        <div className="w-full h-64 sm:h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={activeData}
              margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
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
                axisLine={{ stroke: isDark ? '#282a2f' : '#e2e8f0' }}
              />
              <YAxis
                domain={[0, yAxisMax]}
                stroke={isDark ? '#8d90a0' : '#64748b'}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (viewMode === 'liters' ? `${val}L` : `${val}%`)}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={viewMode === 'liters' ? targetHydration : 100}
                stroke="#06b6d4"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Meta ${targetHydration}L`,
                  fill: isDark ? '#67e8f9' : '#0891b2',
                  fontSize: 11,
                  position: 'right',
                }}
              />
              <Line
                type="monotone"
                dataKey={viewMode === 'liters' ? 'intake' : 'percentage'}
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: '#06b6d4',
                  strokeWidth: 2,
                  stroke: isDark ? '#191c20' : '#ffffff',
                }}
                activeDot={{
                  r: 7,
                  fill: '#22d3ee',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Barra de Acción Rápida y Recomendación Fisiológica */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t dark:border-[#282a2f] border-slate-200">
        <div className="flex items-center gap-2 text-xs dark:text-[#8d90a0] text-slate-500">
          <span className="material-symbols-outlined text-cyan-400 text-[18px]">info</span>
          <span>
            La deshidratación celular &gt;2% disminuye la potencia muscular y el transporte de aminoácidos.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onAddWater && (
            <button
              type="button"
              onClick={onAddWater}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">water_drop</span>
              <span>+250 ml agua</span>
            </button>
          )}

          {onNavigateNutrition && (
            <button
              type="button"
              onClick={onNavigateNutrition}
              className="px-3 py-1.5 rounded-xl text-xs font-bold dark:bg-[#111318] bg-slate-100 dark:text-[#c3c6d7] text-slate-700 hover:text-white border dark:border-[#282a2f] border-slate-300 transition-colors"
            >
              Ver Nutrición
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
