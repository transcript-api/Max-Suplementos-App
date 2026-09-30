import React, { useState, useEffect } from 'react';
import { SupplementPot, PlanType } from '../types/maxSuplementosV1';
import { calculateRemainingStats, computeDailyIngredientsIntake, SummedIngredient } from '../lib/maxSuplementosV1Service';
import { RegisterPotModal } from './RegisterPotModal';
import { WhatsAppReorderModal } from './WhatsAppReorderModal';
import { NutritionistSummaryModal } from './NutritionistSummaryModal';
import { GoogleMapsExplorer } from './GoogleMapsExplorer';

interface SuplementosTabProps {
  userName?: string;
  isDark?: boolean;
  isDemoMode?: boolean;
  onNavigateTab?: (tab: string) => void;
}

export const SuplementosTab: React.FC<SuplementosTabProps> = ({
  userName = 'Atleta',
  isDark = true,
  isDemoMode = false,
  onNavigateTab,
}) => {
  // Plan Gratuito o VIP
  const [currentPlan, setCurrentPlan] = useState<PlanType>('vip'); // Por defecto VIP activo para poder gestionar toda la rutina
  const [activeSubTab, setActiveSubTab] = useState<'hoy' | 'suplementos' | 'composicion' | 'tiendas'>('hoy');

  const DEMO_POTS: SupplementPot[] = [
    {
      id: 'pot-creatina-max',
      name: 'Creatina Creapure 300g',
      brand: 'MAX Suplementos',
      category: 'creatina',
      totalSize: 300,
      sizeUnit: 'g',
      dailyDose: 5,
      openingDate: '2026-09-02',
      status: 'ativo',
      isStoreVerified: true,
      barcode: '7898123456789',
      nutritionFactsPerDose: [
        { name: 'Creatina Monohidratada', amount: 5, unit: 'g' },
        { name: 'Calorías', amount: 0, unit: 'kcal' },
      ],
      dosesHistory: [
        new Date().toISOString().slice(0, 10),
      ],
      warningDaysBefore: 5,
    },
    {
      id: 'pot-whey-max',
      name: 'Whey Protein Isolado 900g',
      brand: 'MAX Suplementos',
      category: 'proteina',
      totalSize: 900,
      sizeUnit: 'g',
      dailyDose: 30,
      openingDate: '2026-09-05',
      status: 'ativo',
      isStoreVerified: true,
      barcode: '7898999887766',
      nutritionFactsPerDose: [
        { name: 'Proteína', amount: 27, unit: 'g' },
        { name: 'Carbohidratos', amount: 1, unit: 'g' },
        { name: 'Grasas', amount: 0.5, unit: 'g' },
        { name: 'Calorías', amount: 116, unit: 'kcal' },
        { name: 'BCAA', amount: 6.2, unit: 'g' },
      ],
      dosesHistory: [
        new Date().toISOString().slice(0, 10),
      ],
      warningDaysBefore: 7,
    },
  ];

  // Potes registrados por el cliente (aislados por usuario en localStorage)
  const [pots, setPots] = useState<SupplementPot[]>(() => {
    if (isDemoMode) return DEMO_POTS;
    try {
      const saved = localStorage.getItem('maxform_supplement_pots');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[SuplementosTab] Error leyendo suplementos locales:', e);
    }
    return [];
  });

  // Persistir cambios en localStorage para usuarios reales
  useEffect(() => {
    if (!isDemoMode) {
      try {
        localStorage.setItem('maxform_supplement_pots', JSON.stringify(pots));
      } catch (e) {
        console.warn('[SuplementosTab] Error guardando suplementos:', e);
      }
    }
  }, [pots, isDemoMode]);

  // Si cambia el modo demo, sincronizar
  useEffect(() => {
    if (isDemoMode) {
      setPots(DEMO_POTS);
    } else {
      try {
        const saved = localStorage.getItem('maxform_supplement_pots');
        if (saved) {
          const parsed = JSON.parse(saved);
          setPots(Array.isArray(parsed) ? parsed : []);
        } else {
          setPots([]);
        }
      } catch (e) {
        setPots([]);
      }
    }
  }, [isDemoMode]);

  // Modales
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [reorderPotsQueue, setReorderPotsQueue] = useState<SupplementPot[]>([]);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedIngredientDetail, setSelectedIngredientDetail] = useState<SummedIngredient | null>(null);
  const [showVipUpgradeModal, setShowVipUpgradeModal] = useState(false);

  // Fecha actual
  const todayIso = new Date().toISOString().slice(0, 10);

  // Marcar dosis de hoy (1 toque)
  const handleToggleDoseToday = (potId: string) => {
    setPots((prev) =>
      prev.map((pot) => {
        if (pot.id !== potId) return pot;
        const alreadyTaken = pot.dosesHistory.includes(todayIso);
        const nextHistory = alreadyTaken
          ? pot.dosesHistory.filter((d) => d !== todayIso)
          : [...pot.dosesHistory, todayIso];
        return {
          ...pot,
          dosesHistory: nextHistory,
        };
      })
    );
  };

  // Guardar nuevo suplemento desde el modal
  const handleSavePot = (newPot: SupplementPot) => {
    if (currentPlan === 'gratis' && pots.length >= 1) {
      setShowVipUpgradeModal(true);
      return;
    }
    setPots((prev) => [...prev, newPot]);
    setIsRegisterOpen(false);
  };

  // Abrir reorden de WhatsApp
  const handleOpenReorder = (potsToReorder: SupplementPot[]) => {
    setReorderPotsQueue(potsToReorder);
    setIsReorderModalOpen(true);
  };

  // Filtrar activos y finalizados
  const activePots = pots.filter((p) => p.status === 'ativo');
  const finalizedPots = pots.filter((p) => p.status === 'finalizado');

  // Ordenar por urgencia (días restantes calculados por consumo real)
  const sortedPots = [...activePots].sort((a, b) => {
    const statsA = calculateRemainingStats(a);
    const statsB = calculateRemainingStats(b);
    return statsA.daysLeft - statsB.daysLeft;
  });

  // Potes que terminan en los próximos 10 días
  const urgentEndingPots = sortedPots.filter((p) => {
    const stats = calculateRemainingStats(p);
    return stats.daysLeft <= 10;
  });

  // Composición total ingerida hoy (ingrediente por ingrediente)
  const dailyIngredients = computeDailyIngredientsIntake(activePots, todayIso);

  // Dosis tomadas hoy
  const takenCountToday = activePots.filter((p) => p.dosesHistory.includes(todayIso)).length;

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* 1. Header Oficial MAX Suplementos Tracker */}
      <div className="bg-white dark:bg-[#0a0a0a] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-white dark:from-[#0a0a0a] to-slate-300 dark:to-[#545a5b] text-slate-900 dark:text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[26px]">medication</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                MAX Suplementos · Control & Reposición
              </h2>
              <button
                type="button"
                onClick={() => setCurrentPlan(currentPlan === 'vip' ? 'gratis' : 'vip')}
                className={`text-[10px] font-black px-2 py-0.5 rounded-full border transition-all ${
                  currentPlan === 'vip'
                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-700/50 text-slate-300 border-slate-600'
                }`}
                title="Alternar entre plan Gratuito y VIP"
              >
                {currentPlan === 'vip' ? '👑 VIP ACTIVO' : 'Plan Estándar'}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#898a8c]">
              Controla tus tomas diarias, calcula días restantes de stock y solicita reposición directa en WhatsApp.
            </p>
          </div>
        </div>

        {/* Acciones principales de cabecera */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsSummaryModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#0a0a0a] hover:bg-white dark:hover:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-[#d6d6d6] transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-900 dark:text-white">clinical_notes</span>
            <span>Ficha Nutricionista</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (currentPlan === 'gratis' && activePots.length >= 1) {
                setShowVipUpgradeModal(true);
              } else {
                setIsRegisterOpen(true);
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0a0a0a] hover:bg-[#545a5b] text-slate-900 dark:text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Registrar Suplemento</span>
          </button>
        </div>
      </div>

      {/* 2. Banner VIP: Pedido Agrupado (si hay potes terminando) */}
      {urgentEndingPots.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-white dark:from-[#0a0a0a] via-white dark:via-[#0a0a0a] to-white dark:to-[#0a0a0a] border border-slate-300 dark:border-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{urgentEndingPots.length} {urgentEndingPots.length === 1 ? 'suplemento se termina' : 'suplementos se terminan'} en los próximos 10 días</span>
                {currentPlan === 'vip' && (
                  <span className="text-[10px] font-extrabold bg-[#ffffff]/20 text-slate-700 dark:text-[#d6d6d6] px-2 py-0.5 rounded-full border border-slate-300 dark:border-white/30">
                    VIP Agrupado
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-[#898a8c]">
                {urgentEndingPots.map((p) => p.name).join(', ')}. No cortes tu protocolo de suplementación.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setActiveSubTab('tiendas')}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#0a0a0a] hover:bg-white dark:hover:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-[#d6d6d6] transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[15px] text-rose-500">pin_drop</span>
              <span>Tiendas Cercanas</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenReorder(urgentEndingPots)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
              <span>Pedir Reposición en WhatsApp ({urgentEndingPots.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Sub-navegación: Hoy | Mis Suplementos | Composición del Día | Tiendas Cercanas */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-1 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSubTab('hoy')}
          className={`pb-2 px-3 text-xs font-bold transition-all relative whitespace-nowrap ${
            activeSubTab === 'hoy' ? 'text-[#ffffff] dark:text-[#d6d6d6]' : 'text-[#898a8c] hover:text-white'
          }`}
        >
          <span>Hoy · Tomas ({takenCountToday}/{activePots.length})</span>
          {activeSubTab === 'hoy' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#ffffff] rounded-full"></div>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('suplementos')}
          className={`pb-2 px-3 text-xs font-bold transition-all relative whitespace-nowrap ${
            activeSubTab === 'suplementos' ? 'text-[#ffffff] dark:text-[#d6d6d6]' : 'text-[#898a8c] hover:text-white'
          }`}
        >
          <span>Mis Suplementos ({activePots.length} activos)</span>
          {activeSubTab === 'suplementos' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#ffffff] rounded-full"></div>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('composicion')}
          className={`pb-2 px-3 text-xs font-bold transition-all relative whitespace-nowrap ${
            activeSubTab === 'composicion' ? 'text-[#ffffff] dark:text-[#d6d6d6]' : 'text-[#898a8c] hover:text-white'
          }`}
        >
          <span>Composición Diaria</span>
          {activeSubTab === 'composicion' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#ffffff] rounded-full"></div>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('tiendas')}
          className={`pb-2 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'tiendas' ? 'text-[#ffffff] dark:text-[#d6d6d6]' : 'text-[#898a8c] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[15px] text-rose-500">pin_drop</span>
          <span>Tiendas Oficiales</span>
          {activeSubTab === 'tiendas' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#ffffff] rounded-full"></div>
          )}
        </button>
      </div>

      {/* VISTA 1: HOY (Tomas diarias con 1 toque + Cálculo de fin) */}
      {activeSubTab === 'hoy' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-[#898a8c] tracking-wider">
              Tus Suplementos (Ordenados por fecha estimada de fin)
            </span>
            <span className="text-[11px] text-slate-700 dark:text-[#d6d6d6]">
              1 toque para registrar la toma de hoy
            </span>
          </div>

          {activePots.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#ffffff]/20 text-slate-900 dark:text-[#ffffff] flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[32px]">medication</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Sin suplementos en tu protocolo</h3>
              <p className="text-xs text-slate-500 dark:text-[#898a8c] max-w-sm mx-auto">
                Agrega tus suplementos o escanea el envase para llevar el control diario y predecir cuándo necesitas reponer.
              </p>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="px-4 py-2 bg-white dark:bg-[#0a0a0a] hover:bg-[#545a5b] text-slate-900 dark:text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Registrar Suplemento</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedPots.map((pot) => {
                const stats = calculateRemainingStats(pot);
                const tookToday = pot.dosesHistory.includes(todayIso);

                return (
                  <div
                    key={pot.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      stats.isLowStock
                        ? 'bg-rose-950/20 border-rose-500/40 shadow-sm'
                        : 'bg-[#0a0a0a] border-white/10'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#898a8c]">
                              {pot.brand}
                            </span>
                            {pot.isStoreVerified ? (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 text-[9px] font-extrabold flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[10px]">verified</span>
                                MAX
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 text-[9px] font-bold">
                                Manual
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug mt-0.5">
                            {pot.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-[#898a8c]">
                            {pot.dailyDose} {pot.sizeUnit} por toma
                          </p>
                        </div>

                        <div className="text-right">
                          <span className={`text-xl font-black block leading-none ${
                            stats.isLowStock ? 'text-rose-400' : 'text-white'
                          }`}>
                            {stats.daysLeft}d
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-[#898a8c] block mt-0.5">
                            restantes
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-500 dark:text-[#898a8c] block">Fecha estimada de fin:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{stats.formattedEndDate}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-[#898a8c]">
                          {stats.dosesTaken}/{stats.totalDosesCapacity} tomas
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
                      <button
                        type="button"
                        onClick={() => handleToggleDoseToday(pot.id)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${
                          tookToday
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-[#0a0a0a] text-slate-900 dark:text-white hover:bg-[#545a5b] shadow-md'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {tookToday ? 'check_circle' : 'circle'}
                        </span>
                        <span>
                          {tookToday ? 'Toma de hoy registrada (toca para deshacer)' : 'Marcar toma de hoy'}
                        </span>
                      </button>

                      {stats.isLowStock && (
                        <button
                          type="button"
                          onClick={() => handleOpenReorder([pot])}
                          className="w-full py-1.5 px-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-slate-900 dark:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
                          <span>Pedir reposición en WhatsApp</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {currentPlan === 'gratis' && (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-dashed border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                  + Agregar otro suplemento a tu rutina
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-[#898a8c]">
                  Whey, creatina, pre-entreno y vitaminas disponibles en el plan VIP.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowVipUpgradeModal(true)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white text-xs font-bold hover:bg-[#545a5b] transition-all shrink-0 cursor-pointer"
              >
                Ver beneficios VIP →
              </button>
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: MIS SUPLEMENTOS (Activos y Finalizados) */}
      {activeSubTab === 'suplementos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-[#898a8c] tracking-wider">
              Tus Suplementos ({activePots.length} activos, {finalizedPots.length} finalizados)
            </span>
          </div>

          {activePots.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] space-y-2">
              <span className="material-symbols-outlined text-3xl text-slate-400">medication</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No tienes suplementos activos</h4>
              <p className="text-xs text-slate-500 dark:text-[#898a8c]">Toca en "Registrar Suplemento" para comenzar tu protocolo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activePots.map((pot) => {
                const stats = calculateRemainingStats(pot);
                return (
                  <div
                    key={pot.id}
                    className="bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="w-full h-24 rounded-xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center p-2 text-center">
                        <span className="material-symbols-outlined text-[32px] text-slate-900 dark:text-[#ffffff]">
                          {pot.category === 'creatina' ? 'science' : pot.category === 'proteina' ? 'nutrition' : 'bolt'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-900 dark:text-white mt-1 truncate max-w-full">
                          {pot.name}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-[#898a8c]">{pot.brand}</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">{stats.daysLeft} días</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{pot.name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-[#898a8c]">
                          {pot.totalSize} {pot.sizeUnit} · Abierto el {pot.openingDate}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenReorder([pot])}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        <span>Pedir Reposición</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VISTA 3: COMPOSICIÓN DIARIA */}
      {activeSubTab === 'composicion' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  Lo que tomaste hoy
                  <span className="text-[11px] font-medium text-slate-500 dark:text-[#898a8c]">
                    (Suma de tomas marcadas)
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#898a8c]">
                  Suma de cada principio activo declarado en tus suplementos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSummaryModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white text-xs font-bold hover:bg-[#545a5b] transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
                <span>Ficha para Nutricionista</span>
              </button>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-white/10 pt-2">
              {dailyIngredients.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-[#898a8c] py-4 text-center">
                  Ninguna toma registrada hoy aún. Marca tus suplementos en la pestaña "Hoy" para ver la composición acumulada.
                </p>
              ) : (
                dailyIngredients.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedIngredientDetail(item)}
                    className="py-2.5 flex items-center justify-between hover:bg-white dark:hover:bg-[#0a0a0a] px-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{item.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-[#898a8c]">
                          {item.sources.length} {item.sources.length === 1 ? 'producto' : 'productos'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-[#898a8c]">
                        Toca para ver el desglose
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-700 dark:text-[#d6d6d6]">
                        {item.totalAmount} {item.unit}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-slate-500 dark:text-[#898a8c]">
                        chevron_right
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedIngredientDetail && (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-[#ffffff]/40 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-700 dark:text-[#d6d6d6]">Desglose de Ingrediente</span>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">
                    {selectedIngredientDetail.name}: {selectedIngredientDetail.totalAmount} {selectedIngredientDetail.unit}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedIngredientDetail(null)}
                  className="text-xs text-slate-500 dark:text-[#898a8c] hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-[#898a8c] block">FUENTES:</span>
                {selectedIngredientDetail.sources.map((src, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">{src.potName}</span>
                      <span className="text-[10px] text-slate-500 dark:text-[#898a8c]">{src.brand}</span>
                    </div>
                    <span className="font-mono font-black text-xs text-slate-700 dark:text-[#d6d6d6]">
                      {src.amount} {src.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VISTA 4: TIENDAS OFICIALES */}
      {activeSubTab === 'tiendas' && (
        <GoogleMapsExplorer
          isDark={isDark}
          defaultCategory="supplements"
          title="Tiendas MAX & Suplementación Deportiva"
          subtitle="Puntos de venta oficiales y tiendas cercanas verificadas con Google Maps"
        />
      )}

      {/* Modales del sistema */}
      <RegisterPotModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSavePot={handleSavePot}
        isDark={isDark}
      />

      <WhatsAppReorderModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        potsToOrder={reorderPotsQueue}
        isVip={currentPlan === 'vip'}
      />

      <NutritionistSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        pots={activePots}
        userName={userName}
        isDark={isDark}
      />

      {/* Modal Comparativo Estándar vs VIP */}
      {showVipUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white rounded-2xl max-w-md w-full border border-slate-200 dark:border-white/10 shadow-2xl p-5 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">👑</span>
                <h3 className="font-black text-base">Plan Estándar vs VIP MAX</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVipUpgradeModal(false)}
                className="text-slate-500 dark:text-[#898a8c] hover:text-slate-900 dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-[#898a8c]">
              El plan VIP es gratuito para atletas que adquieren sus suplementos en MAX Suplementos. ¡Mantén tu fidelidad activa y disfruta todos los beneficios!
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 flex justify-between items-center">
                <span>Suplementos monitoreados</span>
                <span className="font-bold text-slate-900 dark:text-white">Estándar: 1 | <strong className="text-amber-400">VIP: Ilimitados</strong></span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 flex justify-between items-center">
                <span>Cálculo de fin y reposición</span>
                <span className="font-bold text-emerald-400">Incluido en ambos</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 flex justify-between items-center">
                <span>Pedido en WhatsApp con 1 toque</span>
                <span className="font-bold text-slate-900 dark:text-white">Estándar: No | <strong className="text-amber-400">VIP: Sí</strong></span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 flex justify-between items-center">
                <span>Ficha para Nutricionista en PDF</span>
                <span className="font-bold text-emerald-400">Incluido en ambos</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowVipUpgradeModal(false)}
                className="w-1/3 py-2 px-3 rounded-xl bg-white dark:bg-[#0a0a0a] text-xs font-bold text-slate-700 dark:text-[#d6d6d6]"
              >
                Cerrar
              </button>
              <a
                href={`https://wa.me/59899000000?text=${encodeURIComponent(
                  'Hola MAX Suplementos! Quisiera activar mi beneficio VIP en la app para monitorear mi protocolo completo de suplementos.'
                )}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  setCurrentPlan('vip');
                  setShowVipUpgradeModal(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-[#25d366] hover:bg-[#20ba59] text-black text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                <span>Activar VIP por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
