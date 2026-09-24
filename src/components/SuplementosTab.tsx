import React, { useState } from 'react';
import { SupplementPot, PlanType } from '../types/maxSuplementosV1';
import { calculateRemainingStats, computeDailyIngredientsIntake, SummedIngredient } from '../lib/maxSuplementosV1Service';
import { RegisterPotModal } from './RegisterPotModal';
import { WhatsAppReorderModal } from './WhatsAppReorderModal';
import { NutritionistSummaryModal } from './NutritionistSummaryModal';
import { GoogleMapsExplorer } from './GoogleMapsExplorer';

interface SuplementosTabProps {
  userName?: string;
  isDark?: boolean;
  onNavigateTab?: (tab: string) => void;
}

export const SuplementosTab: React.FC<SuplementosTabProps> = ({
  userName = 'Atleta',
  isDark = true,
  onNavigateTab,
}) => {
  // Plan Grátis o VIP
  const [currentPlan, setCurrentPlan] = useState<PlanType>('vip'); // Por defecto VIP activo para poder gestionar toda la rutina
  const [activeSubTab, setActiveSubTab] = useState<'hoje' | 'vitrine' | 'historico' | 'maps'>('hoje');

  // Potes registrados por el cliente
  const [pots, setPots] = useState<SupplementPot[]>([
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
        { name: 'Calorias', amount: 0, unit: 'kcal' },
      ],
      dosesHistory: [
        new Date().toISOString().slice(0, 10), // Tomada hoy
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
        { name: 'Carboidratos', amount: 1, unit: 'g' },
        { name: 'Gorduras', amount: 0.5, unit: 'g' },
        { name: 'Calorias', amount: 116, unit: 'kcal' },
        { name: 'BCAA', amount: 6.2, unit: 'g' },
      ],
      dosesHistory: [
        new Date().toISOString().slice(0, 10), // Tomada hoy
      ],
      warningDaysBefore: 7,
    },
    {
      id: 'pot-pretreino-max',
      name: 'Pré-Treino Insane Focus',
      brand: 'MAX Suplementos',
      category: 'pre-treino',
      totalSize: 300,
      sizeUnit: 'g',
      dailyDose: 10,
      openingDate: '2026-09-10',
      status: 'ativo',
      isStoreVerified: true,
      barcode: '7891234455667',
      nutritionFactsPerDose: [
        { name: 'Cafeína', amount: 200, unit: 'mg' },
        { name: 'Beta-alanina', amount: 1600, unit: 'mg' },
        { name: 'Creatina', amount: 3, unit: 'g' },
        { name: 'Taurina', amount: 1000, unit: 'mg' },
        { name: 'Vitamina C', amount: 45, unit: 'mg' },
        { name: 'Vitamina B12', amount: 2.4, unit: 'mcg' },
      ],
      dosesHistory: [], // Pendiente de tomar hoy
      warningDaysBefore: 4,
    },
  ]);

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
          ? pot.dosesHistory.filter((d) => d !== todayIso) // Deshacer
          : [...pot.dosesHistory, todayIso]; // Marcar dose
        return {
          ...pot,
          dosesHistory: nextHistory,
        };
      })
    );
  };

  // Guardar nuevo pote desde el modal (flujo 1 o 3)
  const handleSavePot = (newPot: SupplementPot) => {
    // Si está en plano Grátis y ya tiene 1 pote, pedir VIP
    if (currentPlan === 'gratis' && pots.length >= 1) {
      setShowVipUpgradeModal(true);
      return;
    }
    setPots((prev) => [newPot, ...prev]);
  };

  // Abrir pedido en WhatsApp para 1 pote o agrupado
  const handleOpenReorder = (potList: SupplementPot[]) => {
    setReorderPotsQueue(potList);
    setIsReorderModalOpen(true);
  };

  // Calcular métricas
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
      <div className="bg-[#191c20] p-4 sm:p-5 rounded-2xl border border-[#282a2f] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2563eb] to-[#3b82f6] text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[26px]">medication</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                MAX Suplementos · Tracker
              </h2>
              <button
                type="button"
                onClick={() => setCurrentPlan(currentPlan === 'vip' ? 'gratis' : 'vip')}
                className={`text-[10px] font-black px-2 py-0.5 rounded-full border transition-all ${
                  currentPlan === 'vip'
                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-700/50 text-slate-300 border-slate-600'
                }`}
                title="Alternar entre plano Grátis e VIP"
              >
                {currentPlan === 'vip' ? '👑 VIP ATIVO' : 'Plano Grátis (1 pote)'}
              </button>
            </div>
            <p className="text-xs text-[#8d90a0]">
              Acompanha sua rotina, avisa antes do pote acabar e abre o pedido no WhatsApp da MAX.
            </p>
          </div>
        </div>

        {/* Acciones principales de cabecera */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsSummaryModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#111318] hover:bg-[#20242b] border border-[#282a2f] text-xs font-bold text-[#c3c6d7] transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-400">clinical_notes</span>
            <span>Resumo Nutricionista</span>
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
            className="px-3.5 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-600 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Cadastrar Pote</span>
          </button>
        </div>
      </div>

      {/* 2. Banner VIP: Pedido Agrupado (si hay potes terminando) */}
      {urgentEndingPots.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-[#131b2c] to-[#191c20] border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>{urgentEndingPots.length} {urgentEndingPots.length === 1 ? 'item acaba' : 'itens acabam'} nos próximos 10 dias</span>
                {currentPlan === 'vip' && (
                  <span className="text-[10px] font-extrabold bg-[#2563eb]/20 text-[#adc6ff] px-2 py-0.5 rounded-full border border-blue-500/30">
                    VIP Agrupado
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-[#8d90a0]">
                {urgentEndingPots.map((p) => p.name).join(', ')}. Não deixe cortar sua rotina.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setActiveSubTab('maps')}
              className="px-3 py-2 rounded-xl bg-[#111318] hover:bg-[#20242b] border border-[#282a2f] text-xs font-bold text-[#c3c6d7] transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[15px] text-rose-500">pin_drop</span>
              <span>Lojas Próximas (Maps)</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenReorder(urgentEndingPots)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
              <span>Pedir Tudo no WhatsApp ({urgentEndingPots.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Sub-navegação: Hoje (rotina diária) | Vitrine de Potes | Composição | Lojas Maps */}
      <div className="flex items-center gap-2 border-b border-[#282a2f] pb-1 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSubTab('hoje')}
          className={`pb-2 px-3 text-xs font-bold transition-all relative whitespace-nowrap ${
            activeSubTab === 'hoje' ? 'text-[#2563eb] dark:text-[#adc6ff]' : 'text-[#8d90a0] hover:text-white'
          }`}
        >
          <span>Hoje · Doses ({takenCountToday}/{activePots.length})</span>
          {activeSubTab === 'hoje' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#2563eb] rounded-full"></div>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('vitrine')}
          className={`pb-2 px-3 text-xs font-bold transition-all relative whitespace-nowrap ${
            activeSubTab === 'vitrine' ? 'text-[#2563eb] dark:text-[#adc6ff]' : 'text-[#8d90a0] hover:text-white'
          }`}
        >
          <span>Vitrine de Potes ({activePots.length} ativos)</span>
          {activeSubTab === 'vitrine' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#2563eb] rounded-full"></div>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('historico')}
          className={`pb-2 px-3 text-xs font-bold transition-all relative whitespace-nowrap ${
            activeSubTab === 'historico' ? 'text-[#2563eb] dark:text-[#adc6ff]' : 'text-[#8d90a0] hover:text-white'
          }`}
        >
          <span>Composição do Dia</span>
          {activeSubTab === 'historico' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#2563eb] rounded-full"></div>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('maps')}
          className={`pb-2 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'maps' ? 'text-[#2563eb] dark:text-[#adc6ff]' : 'text-[#8d90a0] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[15px] text-rose-500">pin_drop</span>
          <span>Lojas & Pontos (Google Maps)</span>
          {activeSubTab === 'maps' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#2563eb] rounded-full"></div>
          )}
        </button>
      </div>

      {/* VISTA 1: HOJE (Marcar doses com um toque + Previsão de fim) */}
      {activeSubTab === 'hoje' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-[#8d90a0] tracking-wider">
              Seus Potes de Suplemento (Ordenados por urgência de fim)
            </span>
            <span className="text-[11px] text-[#adc6ff]">
              1 toque para marcar a dose de hoje
            </span>
          </div>

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
                      : 'bg-[#191c20] border-[#282a2f]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Linha superior: Marca, Nome e Selo de Loja */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d90a0]">
                            {pot.brand}
                          </span>
                          {pot.isStoreVerified ? (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 text-[9px] font-extrabold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[10px]">verified</span>
                              MAX
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 text-[9px] font-bold">
                              Não conferido
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-sm text-white leading-snug mt-0.5">
                          {pot.name}
                        </h4>
                        <p className="text-[11px] text-[#8d90a0]">
                          {pot.dailyDose} {pot.sizeUnit} por dose
                        </p>
                      </div>

                      {/* Dias restantes destacados */}
                      <div className="text-right">
                        <span className={`text-xl font-black block leading-none ${
                          stats.isLowStock ? 'text-rose-400' : 'text-white'
                        }`}>
                          {stats.daysLeft}d
                        </span>
                        <span className="text-[10px] text-[#8d90a0] block mt-0.5">
                          restantes
                        </span>
                      </div>
                    </div>

                    {/* Previsão exata calculada pelo consumo real */}
                    <div className="p-2.5 rounded-xl bg-[#111318] border border-[#282a2f] flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-[#8d90a0] block">Previsão de término:</span>
                        <span className="font-bold text-white">{stats.formattedEndDate}</span>
                      </div>
                      <span className="text-[11px] text-[#8d90a0]">
                        {stats.dosesTaken}/{stats.totalDosesCapacity} tomas
                      </span>
                    </div>
                  </div>

                  {/* Ações da Dose do Dia */}
                  <div className="pt-3 mt-3 border-t border-[#282a2f] space-y-2">
                    <button
                      type="button"
                      onClick={() => handleToggleDoseToday(pot.id)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-95 ${
                        tookToday
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-[#2563eb] text-white hover:bg-blue-600 shadow-md'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {tookToday ? 'check_circle' : 'circle'}
                      </span>
                      <span>
                        {tookToday ? 'Dose de hoje marcada (toque para desfazer)' : 'Marcar que tomei hoje'}
                      </span>
                    </button>

                    {/* Botão de Reposição WhatsApp se estiver com aviso */}
                    {stats.isLowStock && (
                      <button
                        type="button"
                        onClick={() => handleOpenReorder([pot])}
                        className="w-full py-1.5 px-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
                        <span>Pedir no WhatsApp da MAX</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Convite discreto para adicionar outro suplemento no plano Grátis */}
          {currentPlan === 'gratis' && (
            <div className="p-4 rounded-2xl bg-[#111318] border border-dashed border-[#282a2f] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <h5 className="font-bold text-xs text-white">
                  + Adicionar outro suplemento à rotina
                </h5>
                <p className="text-[11px] text-[#8d90a0]">
                  Whey, pré-treino e mais disponíveis no plano VIP (gratuito para quem compra na MAX).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowVipUpgradeModal(true)}
                className="px-3 py-1.5 rounded-lg bg-[#2563eb] text-white text-xs font-bold hover:bg-blue-600 transition-all shrink-0"
              >
                Ver o que o VIP libera →
              </button>
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: VITRINE DE POTES (Ativos e Finalizados com foto/marca) */}
      {activeSubTab === 'vitrine' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-[#8d90a0] tracking-wider">
              Vitrine de Potes do Cliente ({activePots.length} ativos, {finalizedPots.length} finalizados)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activePots.map((pot) => {
              const stats = calculateRemainingStats(pot);
              return (
                <div
                  key={pot.id}
                  className="bg-[#191c20] p-4 rounded-2xl border border-[#282a2f] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-full h-24 rounded-xl bg-[#111318] border border-[#282a2f] flex flex-col items-center justify-center p-2 text-center">
                      <span className="material-symbols-outlined text-[32px] text-[#2563eb]">
                        {pot.category === 'creatina' ? 'science' : pot.category === 'proteina' ? 'nutrition' : 'bolt'}
                      </span>
                      <span className="text-[10px] font-bold text-white mt-1 truncate max-w-full">
                        {pot.name}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-[#8d90a0]">{pot.brand}</span>
                        <span className="text-xs font-black text-white">{stats.daysLeft} dias</span>
                      </div>
                      <h4 className="font-bold text-xs text-white truncate">{pot.name}</h4>
                      <p className="text-[11px] text-[#8d90a0]">
                        {pot.totalSize} {pot.sizeUnit} · Aberto em {pot.openingDate}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#282a2f] flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenReorder([pot])}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">chat</span>
                      <span>Repor</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA 3: COMPOSIÇÃO DO DIA (O que você tomou hoje - Fluxo 4 do PDF) */}
      {activeSubTab === 'historico' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#191c20] border border-[#282a2f] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  O que você tomou hoje
                  <span className="text-[11px] font-medium text-[#8d90a0]">
                    (Soma das doses marcadas)
                  </span>
                </h3>
                <p className="text-xs text-[#8d90a0]">
                  Soma cada ingrediente declarado nos rótulos de creatina, whey e pré-treino.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSummaryModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#2563eb] text-white text-xs font-bold hover:bg-blue-600 transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
                <span>Gerar Resumo Nutricionista (PDF)</span>
              </button>
            </div>

            {/* Lista de ingredientes somados em valores absolutos */}
            <div className="divide-y divide-[#282a2f] pt-2">
              {dailyIngredients.length === 0 ? (
                <p className="text-xs text-[#8d90a0] py-4 text-center">
                  Nenhuma dose marcada hoje ainda. Marque seus potes na aba "Hoje" para somar a composição.
                </p>
              ) : (
                dailyIngredients.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedIngredientDetail(item)}
                    className="py-2.5 flex items-center justify-between hover:bg-[#111318] px-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-white">{item.name}</span>
                        <span className="text-[10px] text-[#8d90a0]">
                          {item.sources.length} {item.sources.length === 1 ? 'produto' : 'produtos'}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8d90a0]">
                        Toque para ver de onde vem cada grama
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-[#adc6ff]">
                        {item.totalAmount} {item.unit}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-[#8d90a0]">
                        chevron_right
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Modal / Card detalhado: De onde vem cada grama (Fluxo 4 tela 40) */}
          {selectedIngredientDetail && (
            <div className="p-4 rounded-2xl bg-[#111318] border border-[#2563eb]/40 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#adc6ff]">Detalhamento de Ingrediente</span>
                  <h4 className="font-black text-base text-white">
                    {selectedIngredientDetail.name}: {selectedIngredientDetail.totalAmount} {selectedIngredientDetail.unit}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedIngredientDetail(null)}
                  className="text-xs text-[#8d90a0] hover:text-white"
                >
                  Fechar
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[#8d90a0] block">DE ONDE VEM:</span>
                {selectedIngredientDetail.sources.map((src, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-[#191c20] border border-[#282a2f] flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-white block">{src.potName}</span>
                      <span className="text-[10px] text-[#8d90a0]">{src.brand}</span>
                    </div>
                    <span className="font-mono font-black text-xs text-[#adc6ff]">
                      {src.amount} {src.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VISTA 4: LOJAS & PONTOS PRÓXIMOS (GOOGLE MAPS GROUNDING COM GEMINI 3.5 FLASH) */}
      {activeSubTab === 'maps' && (
        <GoogleMapsExplorer
          isDark={isDark}
          defaultCategory="supplements"
          title="Pontos de Venda MAX & Suplementação Esportiva"
          subtitle="Busca verificada com Google Maps em tempo real via Gemini 3.5 Flash para compra ou reposição"
        />
      )}

      {/* Modales integrados del sistema */}
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

      {/* Modal Comparativo Honestamente Grátis vs VIP (PDF página 3 e 5) */}
      {showVipUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#191c20] text-white rounded-2xl max-w-md w-full border border-[#282a2f] shadow-2xl p-5 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#282a2f] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">👑</span>
                <h3 className="font-black text-base">Plano Grátis vs VIP MAX</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVipUpgradeModal(false)}
                className="text-[#8d90a0] hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#8d90a0]">
              O plano VIP é gratuito no mês em que você compra qualquer suplemento na MAX Suplementos. Quem compra todo mês nunca paga!
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#111318] border border-[#282a2f] flex justify-between items-center">
                <span>Potes acompanhados</span>
                <span className="font-bold text-white">Grátis: 1 | <strong className="text-amber-400">VIP: Ilimitados</strong></span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#111318] border border-[#282a2f] flex justify-between items-center">
                <span>Previsão de fim e WhatsApp</span>
                <span className="font-bold text-emerald-400">Sim (ambos)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#111318] border border-[#282a2f] flex justify-between items-center">
                <span>Pedido Agrupado com 1 toque</span>
                <span className="font-bold text-white">Grátis: Não | <strong className="text-amber-400">VIP: Sim</strong></span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#111318] border border-[#282a2f] flex justify-between items-center">
                <span>Resumo para Nutricionista em PDF</span>
                <span className="font-bold text-emerald-400">Sim (ambos)</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowVipUpgradeModal(false)}
                className="w-1/3 py-2 px-3 rounded-xl bg-[#282a2f] text-xs font-bold text-[#c3c6d7]"
              >
                Fechar
              </button>
              <a
                href={`https://wa.me/5491100000000?text=${encodeURIComponent(
                  'Olá MAX Suplementos! Gostaria de ativar meu plano VIP no app MAX Tracker para acompanhar minha rotina completa de suplementos.'
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
                <span>Ativar VIP pelo WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
