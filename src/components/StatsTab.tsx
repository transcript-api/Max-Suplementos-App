import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface StatsTabProps {
  streakDays: number;
  formScore: number;
  isDark?: boolean;
}

export const StatsTab: React.FC<StatsTabProps> = ({
  streakDays,
  formScore,
  isDark = true,
}) => {
  const [metricView, setMetricView] = useState<'semanal' | 'racha'>('semanal');

  // Datos de cumplimiento porcentual semanal
  const weeklyComplianceData = [
    { day: 'Lun', cumplimiento: 82, meta: 80, agua: 100, entrenamiento: 100, sueno: 75 },
    { day: 'Mar', cumplimiento: 100, meta: 80, agua: 100, entrenamiento: 100, sueno: 100 },
    { day: 'Mié', cumplimiento: 76, meta: 80, agua: 80, entrenamiento: 100, sueno: 60 },
    { day: 'Jue', cumplimiento: 100, meta: 80, agua: 100, entrenamiento: 100, sueno: 100 },
    { day: 'Vie', cumplimiento: 88, meta: 80, agua: 90, entrenamiento: 100, sueno: 80 },
    { day: 'Sáb', cumplimiento: 92, meta: 80, agua: 100, entrenamiento: 100, sueno: 85 },
    { day: 'Hoy', cumplimiento: formScore, meta: 80, agua: 90, entrenamiento: 100, sueno: 92 },
  ];

  // Datos de evolución histórica de la racha de días cumplidos
  const streakHistoryData = [
    { periodo: 'Sem 1', rachaDias: 4, consistencia: 70 },
    { periodo: 'Sem 2', rachaDias: 7, consistencia: 85 },
    { periodo: 'Sem 3', rachaDias: 10, consistencia: 90 },
    { periodo: 'Actual', rachaDias: streakDays, consistencia: 94 },
  ];

  const averageWeekly = Math.round(
    weeklyComplianceData.reduce((acc, curr) => acc + curr.cumplimiento, 0) / weeklyComplianceData.length
  );

  return (
    <div className="flex flex-col w-full px-4 space-y-5 max-w-[1280px] mx-auto pb-24">
      {/* Encabezado */}
      <div className="flex flex-col space-y-1 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] animate-pulse"></span>
            <span className="font-label-caps text-label-caps text-[#2563eb] dark:text-[#b4c5ff] uppercase tracking-widest font-bold">
              Telemetría y Rendimiento
            </span>
          </div>
          <span className="font-label-caps text-xs px-2.5 py-1 rounded-full dark:bg-[#1d2024] bg-slate-100 dark:text-[#8d90a0] text-slate-600 border dark:border-[#282a2f] border-slate-200 font-semibold">
            Motor Recharts
          </span>
        </div>
        <h1 className="font-headline-xl-mobile text-2xl sm:text-3xl font-bold dark:text-white text-slate-900 tracking-tight">
          Estadísticas de Consistencia
        </h1>
        <p className="text-sm dark:text-[#8d90a0] text-slate-500">
          Visualización analítica de tu racha activa y cumplimiento porcentual semanal.
        </p>
      </div>

      {/* Selector de Vista de Estadísticas */}
      <div className="p-1 rounded-xl flex items-center justify-between gap-1 border dark:bg-[#191c20] bg-slate-100 dark:border-[#282a2f] border-slate-200">
        <button
          type="button"
          onClick={() => setMetricView('semanal')}
          className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-center transition-all ${
            metricView === 'semanal'
              ? 'bg-[#2563eb] text-white shadow-md'
              : 'dark:text-[#8d90a0] text-slate-600 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Cumplimiento Porcentual Semanal
        </button>
        <button
          type="button"
          onClick={() => setMetricView('racha')}
          className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-center transition-all ${
            metricView === 'racha'
              ? 'bg-[#2563eb] text-white shadow-md'
              : 'dark:text-[#8d90a0] text-slate-600 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Racha de Días Cumplidos
        </button>
      </div>

      {/* Tarjetas de Resumen Rápido */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 shadow-sm">
          <span className="text-[11px] uppercase font-bold dark:text-[#8d90a0] text-slate-400 block">
            Racha Activa
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-[#2563eb] dark:text-[#b4c5ff]">
              🔥 {streakDays}
            </span>
            <span className="text-xs dark:text-[#8d90a0] text-slate-500">días</span>
          </div>
          <span className="text-[11px] text-emerald-500 dark:text-emerald-400 font-semibold block mt-1">
            100% consistencia
          </span>
        </div>

        <div className="p-4 rounded-xl border dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 shadow-sm">
          <span className="text-[11px] uppercase font-bold dark:text-[#8d90a0] text-slate-400 block">
            Promedio Semanal
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold dark:text-white text-slate-900">
              {averageWeekly}%
            </span>
            <span className="text-xs dark:text-[#8d90a0] text-slate-500">cumplido</span>
          </div>
          <span className="text-[11px] text-blue-500 dark:text-[#b4c5ff] font-semibold block mt-1">
            Meta superada (+8%)
          </span>
        </div>

        <div className="p-4 rounded-xl border dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 shadow-sm">
          <span className="text-[11px] uppercase font-bold dark:text-[#8d90a0] text-slate-400 block">
            Días Perfectos (100%)
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-amber-500">
              2
            </span>
            <span className="text-xs dark:text-[#8d90a0] text-slate-500">esta semana</span>
          </div>
          <span className="text-[11px] dark:text-[#8d90a0] text-slate-500 block mt-1">
            Martes y Jueves
          </span>
        </div>

        <div className="p-4 rounded-xl border dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 shadow-sm">
          <span className="text-[11px] uppercase font-bold dark:text-[#8d90a0] text-slate-400 block">
            Energía Hoy
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-emerald-500 dark:text-emerald-400">
              {formScore}%
            </span>
          </div>
          <span className="text-[11px] dark:text-[#8d90a0] text-slate-500 block mt-1">
            Form Diaria
          </span>
        </div>
      </div>

      {/* Gráficos Recharts */}
      {metricView === 'semanal' ? (
        <div className="p-5 rounded-2xl border dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-headline-md text-base font-bold dark:text-white text-slate-900">
                Cumplimiento Porcentual Semanal
              </h2>
              <p className="text-xs dark:text-[#8d90a0] text-slate-500">
                Porcentaje de ejecución diaria de metas (Agua, Entrenamiento, Suplementos y Sueño).
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-[#2563eb] font-bold">
                <span className="w-3 h-3 rounded bg-[#2563eb]"></span> % Cumplimiento
              </span>
              <span className="flex items-center gap-1 dark:text-[#8d90a0] text-slate-500">
                <span className="w-3 h-0.5 bg-dashed bg-amber-500"></span> Meta 80%
              </span>
            </div>
          </div>

          <div className="w-full h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyComplianceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  domain={[0, 100]}
                  stroke={isDark ? '#8d90a0' : '#64748b'}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl shadow-xl text-xs border dark:bg-[#111318] bg-white dark:border-[#282a2f] border-slate-200">
                          <p className="font-bold text-sm dark:text-white text-slate-900 mb-1">
                            {data.day} · {data.cumplimiento}% completado
                          </p>
                          <div className="space-y-0.5 dark:text-[#c3c6d7] text-slate-600">
                            <p>• Hidratación: {data.agua}%</p>
                            <p>• Entrenamiento: {data.entrenamiento}%</p>
                            <p>• Sueño: {data.sueno}%</p>
                          </div>
                          <span className={`inline-block mt-2 font-bold px-2 py-0.5 rounded text-[10px] ${
                            data.cumplimiento >= 80 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
                          }`}>
                            {data.cumplimiento >= 80 ? 'Meta Cumplida' : 'Bajo Meta'}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="cumplimiento"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl border dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-headline-md text-base font-bold dark:text-white text-slate-900">
                Evolución de Racha de Días Cumplidos
              </h2>
              <p className="text-xs dark:text-[#8d90a0] text-slate-500">
                Acumulación progresiva de días ininterrumpidos de metas cumplidas.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 self-start sm:self-auto">
              🔥 Récord histórico: 18 días
            </span>
          </div>

          <div className="w-full h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={streakHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="streakGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#282a2f' : '#e2e8f0'}
                  vertical={false}
                />
                <XAxis
                  dataKey="periodo"
                  stroke={isDark ? '#8d90a0' : '#64748b'}
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#282a2f' : '#e2e8f0' }}
                />
                <YAxis
                  domain={[0, 20]}
                  stroke={isDark ? '#8d90a0' : '#64748b'}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}d`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl shadow-xl text-xs border dark:bg-[#111318] bg-white dark:border-[#282a2f] border-slate-200">
                          <p className="font-bold text-sm dark:text-white text-slate-900">
                            {data.periodo}: {data.rachaDias} días seguidos
                          </p>
                          <p className="text-xs text-blue-500 dark:text-[#b4c5ff] mt-1">
                            Consistencia metabólica: {data.consistencia}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rachaDias"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#streakGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
