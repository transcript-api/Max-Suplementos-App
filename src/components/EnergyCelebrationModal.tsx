import React from 'react';
import { triggerEnergyCelebrationConfetti, playCelebrationSound } from '../lib/celebration';

interface EnergyCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  streakDays: number;
  completedTasksCount: number;
  totalTasksCount: number;
  commitmentLevel: string;
}

export const EnergyCelebrationModal: React.FC<EnergyCelebrationModalProps> = ({
  isOpen,
  onClose,
  userName = 'Atleta',
  streakDays,
  completedTasksCount,
  totalTasksCount,
  commitmentLevel,
}) => {
  if (!isOpen) return null;

  const handleReplayCelebration = () => {
    triggerEnergyCelebrationConfetti();
    playCelebrationSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      {/* Tarjeta de Celebración */}
      <div className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#1e2330] via-[#161a24] to-[#0f1219] border border-amber-500/40 shadow-2xl text-center space-y-5 overflow-hidden">
        {/* Resplandor superior festivo */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-r from-amber-500/25 via-blue-500/20 to-emerald-500/25 blur-3xl pointer-events-none rounded-full" />

        {/* Botón de cierre */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Cerrar modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Ícono animado central con trofeo y destellos */}
        <div className="relative flex justify-center pt-2">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/30 animate-bounce">
            <span className="material-symbols-outlined text-[44px]">emoji_events</span>
            {/* Pequeños destellos decorativos */}
            <span className="absolute -top-1 -right-1 text-base">✨</span>
            <span className="absolute -bottom-1 -left-1 text-base">⚡</span>
          </div>
        </div>

        {/* Título y subtítulo */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <span>🎉 ¡Hito Diario Desbloqueado!</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ¡100% de Energía Diaria!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed px-2">
            Felicitaciones, <strong>{userName}</strong>. Has llevado tu cumplimiento de hoy al
            máximo nivel con protocolo <strong>{commitmentLevel}</strong>.
          </p>
        </div>

        {/* Resumen de logros del día */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-black/30 border border-white/5 text-left">
          <div className="p-2 rounded-xl bg-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Metas
            </span>
            <span className="text-base font-black text-emerald-400">
              {completedTasksCount}/{totalTasksCount}
            </span>
            <span className="text-[9px] text-slate-400 block">Completadas</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Racha
            </span>
            <span className="text-base font-black text-amber-400">
              🔥 {streakDays}
            </span>
            <span className="text-[9px] text-slate-400 block">Días seguidos</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Potencia
            </span>
            <span className="text-base font-black text-blue-400">
              100%
            </span>
            <span className="text-[9px] text-slate-400 block">Metabólica</span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleReplayCelebration}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>🎉 Lanzar Confeti de nuevo</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all border border-slate-700 active:scale-95 cursor-pointer"
          >
            Continuar al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
