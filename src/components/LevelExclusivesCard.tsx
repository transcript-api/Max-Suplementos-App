import React from 'react';
import { CommitmentLevel } from '../types';
import { 
  LEVEL_PROTOCOLS, 
  checkLevelCooldown,
  CooldownStatus 
} from '../lib/levelProtocols';

interface LevelExclusivesCardProps {
  level: CommitmentLevel;
  levelSelectedAt?: string;
  levelGraceAvailable?: boolean;
  nextLevelChangeAllowedAt?: string;
  onOpenLevelModal: () => void;
  completedTasksCount: number;
  totalTasksCount: number;
  formScore: number;
}

export const LevelExclusivesCard: React.FC<LevelExclusivesCardProps> = ({
  level,
  levelSelectedAt,
  levelGraceAvailable = false,
  nextLevelChangeAllowedAt,
  onOpenLevelModal,
  completedTasksCount,
  totalTasksCount,
  formScore,
}) => {
  const protocol = LEVEL_PROTOCOLS[level] || LEVEL_PROTOCOLS.Básico;
  const cooldown: CooldownStatus = checkLevelCooldown(
    levelSelectedAt,
    levelGraceAvailable,
    nextLevelChangeAllowedAt
  );

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all ${protocol.bgTint} ${protocol.borderTint} shadow-lg`}
      style={{
        borderColor: `${protocol.themeColor}33`,
      }}
    >
      {/* Fondo con brillo sutil temático */}
      <div 
        className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: protocol.themeColor }}
      />

      {/* Cabecera del Protocolo Activo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-base font-black text-white shadow-md"
            style={{ backgroundColor: protocol.themeColor }}
          >
            {level === 'Básico' ? '🌱' : level === 'Intermedio' ? '⚡' : level === 'Avanzado' ? '🔥' : '👑'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full border ${protocol.badgeClass}`}>
                {protocol.badgeTitle}
              </span>
              <span className="text-xs font-bold dark:text-slate-400 text-slate-500">
                · Protocolo {protocol.name}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold dark:text-white text-slate-900 mt-0.5">
              {protocol.tagline}
            </p>
          </div>
        </div>

        {/* Botón de Estado del Cooldown / Recalibrar */}
        <button
          onClick={onOpenLevelModal}
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all self-start sm:self-auto border dark:bg-[#15171e] bg-white shadow-sm hover:scale-[1.02]"
          style={{
            borderColor: cooldown.isAllowed ? `${protocol.themeColor}55` : '#f59e0b55',
          }}
        >
          {cooldown.isAllowed ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="dark:text-slate-200 text-slate-700">
                {cooldown.hasGraceOpportunity ? '⚡ 1 Recalibración libre' : '🔄 Recalibrar ciclo'}
              </span>
            </>
          ) : (
            <>
              <span className="text-amber-500 text-xs">🔒</span>
              <span className="dark:text-amber-300 text-amber-800 font-semibold text-[11px]">
                Bloqueado: {cooldown.daysRemaining}d {cooldown.hoursRemaining}h
              </span>
            </>
          )}
        </button>
      </div>

      {/* Grid de Exigencias Específicas del Nivel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
        <div className="p-2.5 rounded-xl dark:bg-[#12141a]/80 bg-white/80 border dark:border-[#22242b] border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Sesiones
          </span>
          <p className="text-xs font-black dark:text-white text-slate-900">
            {protocol.weeklyWorkouts}
          </p>
          <span className="text-[10px] text-slate-500 block truncate">
            {protocol.workoutDuration}
          </span>
        </div>

        <div className="p-2.5 rounded-xl dark:bg-[#12141a]/80 bg-white/80 border dark:border-[#22242b] border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Proteína / kg
          </span>
          <p className="text-xs font-black dark:text-white text-slate-900">
            {protocol.proteinRatio.split(' ')[0]}
          </p>
          <span className="text-[10px] text-slate-500 block truncate">
            {level === 'Extremo' ? 'Pesado al gramo' : level === 'Avanzado' ? 'Alto valor biológico' : 'Distribución flexible'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl dark:bg-[#12141a]/80 bg-white/80 border dark:border-[#22242b] border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Hidratación
          </span>
          <p className="text-xs font-black dark:text-white text-slate-900">
            {protocol.hydrationGoal.split(' ')[0]}
          </p>
          <span className="text-[10px] text-slate-500 block truncate">
            {level === 'Extremo' ? 'Con electrolitos' : 'Consumo continuo'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl dark:bg-[#12141a]/80 bg-white/80 border dark:border-[#22242b] border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Exigencia Form
          </span>
          <p className="text-xs font-black dark:text-white text-slate-900">
            {completedTasksCount} / {totalTasksCount} tareas
          </p>
          <span className="text-[10px] font-semibold block truncate" style={{ color: protocol.themeColor }}>
            Form actual: {formScore}%
          </span>
        </div>
      </div>

      {/* Regla exclusiva de tolerancia y aviso de nivel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2.5 border-t dark:border-[#22242b] border-slate-200/80 text-[11px]">
        <div className="flex items-center gap-1.5 dark:text-slate-300 text-slate-600">
          <span className="font-bold text-slate-400">Tolerancia del Nivel:</span>
          <span>{protocol.formTolerance}</span>
        </div>
        <span className="italic dark:text-slate-400 text-slate-500 font-medium">
          "{protocol.motto}"
        </span>
      </div>

      {/* Alerta de Nivel Extremo si corresponde */}
      {protocol.warningNotice && (
        <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{protocol.warningNotice}</span>
        </div>
      )}
    </div>
  );
};
