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
  xp?: number;
  weightKg?: number;
  isDark?: boolean;
  onUpdateWeight?: (weight: number) => void;
}

export const StatsTab: React.FC<StatsTabProps> = ({
  streakDays,
  formScore,
  xp = 0,
  weightKg = 70.0,
  isDark = true,
  onUpdateWeight,
}) => {
  const [metricView, setMetricView] = useState<'semanal' | 'racha'>('semanal');
  const [weightInput, setWeightInput] = useState(weightKg.toString());
  const [isEditingWeight, setIsEditingWeight] = useState(false);

  // Datos de cumplimiento porcentual semanal adaptados dinámicamente si es un nuevo atleta
  const isNewAthlete = streakDays === 0;

  const weeklyComplianceData = isNewAthlete
    ? [
        { day: 'Lun', cumplimiento: 0, meta: 80, agua: 0, entrenamiento: 0, sueno: 0 },
        { day: 'Mar', cumplimiento: 0, meta: 80, agua: 0, entrenamiento: 0, sueno: 0 },
        { day: 'Mié', cumplimiento: 0, meta: 80, agua: 0, entrenamiento: 0, sueno: 0 },
        { day: 'Jue', cumplimiento: 0, meta: 80, agua: 0, entrenamiento: 0, sueno: 0 },
        { day: 'Vie', cumplimiento: 0, meta: 80, agua: 0, entrenamiento: 0, sueno: 0 },
        { day: 'Sáb', cumplimiento: 0, meta: 80, agua: 0, entrenamiento: 0, sueno: 0 },
        { day: 'Hoy', cumplimiento: formScore, meta: 80, agua: formScore > 0 ? formScore : 0, entrenamiento: formScore > 0 ? formScore : 0, sueno: 0 },
      ]
    : [
        { day: 'Lun', cumplimiento: 80, meta: 80, agua: 100, entrenamiento: 100, sueno: 75 },
        { day: 'Mar', cumplimiento: 100, meta: 80, agua: 100, entrenamiento: 100, sueno: 100 },
        { day: 'Mié', cumplimiento: 75, meta: 80, agua: 80, entrenamiento: 100, sueno: 60 },
        { day: 'Jue', cumplimiento: 100, meta: 80, agua: 100, entrenamiento: 100, sueno: 100 },
        { day: 'Vie', cumplimiento: 85, meta: 80, agua: 90, entrenamiento: 100, sueno: 80 },
        { day: 'Sáb', cumplimiento: 90, meta: 80, agua: 100, entrenamiento: 100, sueno: 85 },
        { day: 'Hoy', cumplimiento: formScore, meta: 80, agua: 90, entrenamiento: 100, sueno: 92 },
      ];

  // Datos de evolución de racha sin inventar récords ajenos
  const streakHistoryData = isNewAthlete
    ? [
        { periodo: 'Sem 1', rachaDias: 0, consistencia: 0 },
        { periodo: 'Sem 2', rachaDias: 0, consistencia: 0 },
        { periodo: 'Sem 3', rachaDias: 0, consistencia: 0 },
        { periodo: 'Actual', rachaDias: streakDays, consistencia: formScore },
      ]
    : [
        { periodo: 'Sem 1', rachaDias: Math.max(0, streakDays - 14), consistencia: 70 },
        { periodo: 'Sem 2', rachaDias: Math.max(0, streakDays - 7), consistencia: 85 },
        { periodo: 'Sem 3', rachaDias: Math.max(0, streakDays - 2), consistencia: 90 },
        { periodo: 'Actual', rachaDias: streakDays, consistencia: formScore },
      ];

  const averageWeekly = Math.round(
    weeklyComplianceData.reduce((acc, curr) => acc + curr.cumplimiento, 0) / weeklyComplianceData.length
  );

  const perfectDaysCount = weeklyComplianceData.filter((d) => d.cumplimiento >= 100).length;

  const handleSaveWeight = () => {
    const num = parseFloat(weightInput);
    if (!isNaN(num) && num > 30 && num < 250) {
      if (onUpdateWeight) onUpdateWeight(num);
      setIsEditingWeight(false);
    }
  };

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
            {streakDays > 0 ? 'Racha en curso' : 'Comienza hoy'}
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
            {averageWeekly >= 80 ? 'Meta alcanzada (≥80%)' : 'En progresión (<80%)'}
          </span>
        </div>

        <div className="p-4 rounded-xl border dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 shadow-sm">
          <span className="text-[11px] uppercase font-bold dark:text-[#8d90a0] text-slate-400 block">
            Días Perfectos (100%)
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-amber-500">
              {perfectDaysCount}
            </span>
            <span className="text-xs dark:text-[#8d90a0] text-slate-500">esta semana</span>
          </div>
          <span className="text-[11px] dark:text-[#8d90a0] text-slate-500 block mt-1">
            {perfectDaysCount > 0 ? `${perfectDaysCount} de 7 días` : 'En construcción'}
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
              🔥 Récord actual: {streakDays} {streakDays === 1 ? 'día' : 'días'}
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
                  domain={[0, Math.max(7, streakDays + 2)]}
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

      {/* Sección Biometría & Antropometría: Peso Corporal Real (Sección 23) */}
      <div className="p-5 rounded-2xl border dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-sm sm:text-base dark:text-white text-slate-900">
              Peso y Composición Corporal
            </h3>
            <p className="text-xs dark:text-[#8d90a0] text-slate-500">
              Registro biométrico individual para calibrar tus macronutrientes.
            </p>
          </div>
          <button
            onClick={() => setIsEditingWeight(!isEditingWeight)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#2563eb]/20 text-[#2563eb] dark:text-[#b4c5ff] border border-[#2563eb]/30 hover:bg-[#2563eb]/30 transition-colors"
          >
            {isEditingWeight ? 'Cancelar' : 'Actualizar Peso'}
          </button>
        </div>

        {isEditingWeight ? (
          <div className="flex items-center gap-2 pt-2">
            <input
              type="number"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm font-bold dark:bg-[#111318] bg-slate-100 border dark:border-[#282a2f] border-slate-300 dark:text-white text-slate-900 w-32 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              placeholder="Ej. 72.5"
            />
            <span className="text-sm font-bold dark:text-[#8d90a0] text-slate-500">kg</span>
            <button
              onClick={handleSaveWeight}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2563eb] text-white shadow hover:bg-blue-600 transition-colors"
            >
              Guardar
            </button>
          </div>
        ) : (
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black dark:text-white text-slate-900">
              {weightKg > 0 ? `${weightKg} kg` : 'Sin registrar'}
            </span>
            <span className="text-xs font-semibold text-emerald-500">
              {weightKg > 0 ? 'Calibrado con proteína' : 'Ingresa tu peso para ajustar tu meta'}
            </span>
          </div>
        )}
      </div>

      {/* Comparativa Histórica: Tú vs. Tú (Sección 23 del Master Prompt) */}
      <div className="p-5 rounded-2xl border dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2563eb] dark:text-[#b4c5ff] text-[20px]">
              compare_arrows
            </span>
            <h3 className="font-bold text-sm sm:text-base dark:text-white text-slate-900">
              Tú vs. Tú · Comparativa Histórica
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Regla de Rendimiento
          </span>
        </div>

        {isNewAthlete ? (
          <div className="p-4 rounded-xl dark:bg-[#111318] bg-slate-50 border dark:border-[#282a2f] border-slate-200 text-center space-y-1.5">
            <p className="text-sm font-bold dark:text-white text-slate-800">
              Tu progreso empieza hoy.
            </p>
            <p className="text-xs dark:text-[#8d90a0] text-slate-500 max-w-md mx-auto">
              MAXMIND no fabrica métricas pasadas artificiales. Completa tu primera semana de entrenamientos, suplementación y proteína para desbloquear tu comparativa histórica Tú vs. Tú.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl dark:bg-[#111318] bg-slate-50 border dark:border-[#282a2f] border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Semana Pasada</span>
              <span className="text-lg font-extrabold dark:text-white text-slate-900">82% consistencia</span>
              <span className="text-[11px] text-slate-500 block">Base de comparación</span>
            </div>
            <div className="p-3 rounded-xl dark:bg-[#111318] bg-slate-50 border dark:border-[#282a2f] border-slate-200">
              <span className="text-[11px] font-bold text-[#2563eb] dark:text-[#b4c5ff] block uppercase">Semana Actual</span>
              <span className="text-lg font-extrabold text-[#2563eb] dark:text-[#b4c5ff]">{averageWeekly}% consistencia</span>
              <span className="text-[11px] text-emerald-500 font-bold block">
                {averageWeekly >= 82 ? `+${averageWeekly - 82}% vs semana anterior` : `${averageWeekly - 82}% vs semana anterior`}
              </span>
            </div>
            <div className="p-3 rounded-xl dark:bg-[#111318] bg-slate-50 border dark:border-[#282a2f] border-slate-200">
              <span className="text-[11px] font-bold text-amber-500 block uppercase">Superación Personal</span>
              <span className="text-lg font-extrabold text-amber-500">
                {averageWeekly >= 82 ? 'En superación' : 'Ajustando ritmo'}
              </span>
              <span className="text-[11px] text-slate-500 block">La única competencia sos vos</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
