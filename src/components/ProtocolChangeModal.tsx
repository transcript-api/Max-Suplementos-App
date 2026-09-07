import React, { useState } from 'react';
import { CommitmentLevel } from '../types';
import { 
  LEVEL_PROTOCOLS, 
  checkLevelCooldown, 
  COOLDOWN_DAYS,
  CooldownStatus 
} from '../lib/levelProtocols';

interface ProtocolChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: CommitmentLevel;
  levelSelectedAt?: string;
  levelGraceAvailable?: boolean;
  nextLevelChangeAllowedAt?: string;
  onConfirmLevelChange: (newLevel: CommitmentLevel) => void;
}

export const ProtocolChangeModal: React.FC<ProtocolChangeModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  levelSelectedAt,
  levelGraceAvailable = false,
  nextLevelChangeAllowedAt,
  onConfirmLevelChange,
}) => {
  const [selectedTargetLevel, setSelectedTargetLevel] = useState<CommitmentLevel>(currentLevel);
  const [showConfirmStep, setShowConfirmStep] = useState(false);

  if (!isOpen) return null;

  const cooldown: CooldownStatus = checkLevelCooldown(
    levelSelectedAt,
    levelGraceAvailable,
    nextLevelChangeAllowedAt
  );

  const activeProtocol = LEVEL_PROTOCOLS[currentLevel];
  const targetProtocol = LEVEL_PROTOCOLS[selectedTargetLevel];

  const handleApplyChange = () => {
    if (!cooldown.isAllowed) return;
    onConfirmLevelChange(selectedTargetLevel);
    setShowConfirmStep(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl dark:bg-[#12141a] bg-white rounded-2xl border dark:border-[#282a2f] border-slate-200 shadow-2xl overflow-hidden my-6">
        
        {/* Encabezado con degradado del nivel activo */}
        <div className="relative p-5 sm:p-6 border-b dark:border-[#23252a] border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">⚖️</span>
                <h3 className="text-lg sm:text-xl font-black dark:text-white text-slate-900 tracking-tight">
                  Protocolo de Compromiso y Nivel
                </h3>
              </div>
              <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">
                Cada nivel transforma de forma exclusiva las exigencias de tu Daily Form, objetivos diarios y metas nutricionales.
              </p>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg dark:hover:bg-[#1d2027] hover:bg-slate-100 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Banner de Estado del Cooldown de 14 Días */}
          <div className="mt-4 p-3.5 rounded-xl border text-xs sm:text-sm">
            {cooldown.isAllowed ? (
              cooldown.hasGraceOpportunity ? (
                <div className="flex items-start gap-2.5 text-emerald-400 dark:bg-emerald-500/10 bg-emerald-50 border-emerald-500/30 p-2 rounded-lg">
                  <span className="text-base leading-none">⚡</span>
                  <div>
                    <strong className="block font-bold text-emerald-600 dark:text-emerald-300">
                      1 Oportunidad de Calibración Disponible
                    </strong>
                    <span className="text-emerald-700/90 dark:text-emerald-300/80 text-[11px] sm:text-xs">
                      Puedes ajustar tu nivel una vez. Al confirmar, tu protocolo quedará fijado durante <strong>14 días obligatorios</strong> para garantizar tu adaptación biológica.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 text-blue-400 dark:bg-blue-500/10 bg-blue-50 border-blue-500/30 p-2 rounded-lg">
                  <span className="text-base leading-none">✅</span>
                  <div>
                    <strong className="block font-bold text-blue-600 dark:text-blue-300">
                      Ciclo de 14 Días Completado
                    </strong>
                    <span className="text-blue-700/90 dark:text-blue-300/80 text-[11px] sm:text-xs">
                      Has cumplido el período de adaptación. Puedes elegir recalibrar tus exigencias para el próximo ciclo de 14 días o renovar tu nivel actual.
                    </span>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-start gap-2.5 dark:bg-amber-500/10 bg-amber-50 border-amber-500/30 p-2.5 rounded-lg text-amber-800 dark:text-amber-300">
                <span className="text-base leading-none">🔒</span>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="font-black text-amber-700 dark:text-amber-300">
                      Protocolo Bloqueado: Ciclo de Adaptación en Curso
                    </strong>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-200 border border-amber-500/40">
                      Quedan {cooldown.daysRemaining}d {cooldown.hoursRemaining}h
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] sm:text-xs text-amber-800/90 dark:text-amber-200/80 leading-relaxed">
                    Para que ocurran adaptaciones fisiológicas reales (síntesis proteica miofibrilar, tolerancia glucídica y volumen plasmático), se exige mantener el mismo protocolo durante un mínimo de <strong>2 semanas (14 días)</strong> continuas sin alternar a capricho.
                  </p>
                  <p className="mt-1 font-semibold text-[10px] sm:text-[11px] text-amber-700 dark:text-amber-300">
                    Próxima ventana de recalibración: {cooldown.nextAllowedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista comparativa de los 4 niveles */}
        <div className="p-5 sm:p-6 space-y-3.5 max-h-[58vh] overflow-y-auto">
          {(['Básico', 'Intermedio', 'Avanzado', 'Extremo'] as const).map((lvl) => {
            const proto = LEVEL_PROTOCOLS[lvl];
            const isCurrent = currentLevel === lvl;
            const isSelected = selectedTargetLevel === lvl;
            const canSelect = cooldown.isAllowed;

            return (
              <div
                key={lvl}
                onClick={() => {
                  if (canSelect) {
                    setSelectedTargetLevel(lvl);
                  }
                }}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected
                    ? `border-${proto.themeColor} dark:bg-[#181a22] bg-slate-50 shadow-md ring-1 ring-${proto.themeColor}/40`
                    : 'dark:border-[#282a2f] border-slate-200 dark:bg-[#14161c] bg-white opacity-85 hover:opacity-100'
                } ${canSelect ? 'cursor-pointer' : 'cursor-default'}`}
                style={{
                  borderColor: isSelected ? proto.themeColor : undefined,
                }}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: proto.themeColor }}
                    />
                    <h4 className="text-base font-black dark:text-white text-slate-900">
                      Nivel {proto.name}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${proto.badgeClass}`}>
                      {proto.badgeTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isCurrent && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-[#282a2f] dark:text-white text-slate-800">
                        Nivel Activo
                      </span>
                    )}
                    {canSelect && isSelected && !isCurrent && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500 text-white">
                        Seleccionado
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs dark:text-slate-400 text-slate-600 mb-3 italic">
                  "{proto.tagline}"
                </p>

                {/* Grilla de exigencias específicas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t dark:border-[#22242b] border-slate-200/80">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">🏋️‍♂️ Entreno:</span>
                    <strong className="dark:text-slate-200 text-slate-800">
                      {proto.weeklyWorkouts} ({proto.workoutDuration})
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">🥩 Proteína:</span>
                    <strong className="dark:text-slate-200 text-slate-800">
                      {proto.proteinRatio}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">💧 Hidratación:</span>
                    <strong className="dark:text-slate-200 text-slate-800">
                      {proto.hydrationGoal}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">📋 Tareas diarias:</span>
                    <strong className="dark:text-slate-200 text-slate-800">
                      {proto.taskCount} objetivos estrictos
                    </strong>
                  </div>
                </div>

                {/* Tolerancia de Daily Form */}
                <div className="mt-2.5 p-2 rounded-lg bg-black/20 text-[11px] flex items-baseline gap-1.5">
                  <span className="font-bold text-slate-400">Tolerancia Form:</span>
                  <span className="dark:text-slate-300 text-slate-700">
                    {proto.formTolerance}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer y Acciones */}
        <div className="p-4 sm:p-5 border-t dark:border-[#23252a] border-slate-200 dark:bg-[#0f1116] bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs dark:text-slate-400 text-slate-600 text-center sm:text-left">
            {cooldown.isAllowed ? (
              <span>
                Al confirmar, se recalibrarán tus objetivos diarios y comenzará un ciclo de <strong>{COOLDOWN_DAYS} días</strong>.
              </span>
            ) : (
              <span className="text-amber-500 font-medium">
                🔒 Cambio bloqueado hasta que concluya el ciclo de 14 días.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold dark:bg-[#1d2027] bg-slate-200 dark:text-slate-300 text-slate-700 hover:bg-slate-300 dark:hover:bg-[#282c36] transition-colors"
            >
              Cerrar
            </button>

            {cooldown.isAllowed && (
              <button
                type="button"
                onClick={() => {
                  if (!showConfirmStep && selectedTargetLevel !== currentLevel) {
                    setShowConfirmStep(true);
                  } else {
                    handleApplyChange();
                  }
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-lg transition-all"
                style={{
                  backgroundColor: targetProtocol.themeColor,
                }}
              >
                {showConfirmStep
                  ? `¿Confirmar bloqueo de 14 días en ${targetProtocol.name}?`
                  : selectedTargetLevel === currentLevel
                  ? 'Mantener Nivel Actual'
                  : `Cambiar a Nivel ${targetProtocol.name}`}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
