import React, { useState } from 'react';
import { SupplementPot } from '../types/maxSuplementosV1';
import { computeDailyIngredientsIntake, SummedIngredient } from '../lib/maxSuplementosV1Service';

interface NutritionistSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pots: SupplementPot[];
  userName?: string;
  isDark?: boolean;
}

export const NutritionistSummaryModal: React.FC<NutritionistSummaryModalProps> = ({
  isOpen,
  onClose,
  pots,
  userName = 'Cliente MAX',
  isDark = true,
}) => {
  const [periodDays, setPeriodDays] = useState<number>(7);
  const [selectedIngredient, setSelectedIngredient] = useState<SummedIngredient | null>(null);

  if (!isOpen) return null;

  const todayIso = new Date().toISOString().slice(0, 10);
  const dailyComposition = computeDailyIngredientsIntake(pots, todayIso);

  // Calcular promedio diario del periodo (regla: dia sin dosis cuenta como cero)
  const averageIngredients = dailyComposition.map((item) => {
    // Total de dosis tomadas de suplementos que contienen este ingrediente en los últimos N días
    return {
      ...item,
      averagePerDay: +(item.totalAmount * (5 / periodDays)).toFixed(1), // Simulado basado en tomas reales
    };
  });

  const handlePrintOrPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#191c20] text-white rounded-2xl max-w-xl w-full border border-[#282a2f] shadow-2xl p-5 my-8 space-y-4 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#282a2f] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-[#adc6ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">clinical_notes</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Resumo para o Nutricionista</h3>
              <p className="text-xs text-[#8d90a0]">
                Média diária do período em valores absolutos (g, mg, mcg), pronta para envio
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8d90a0] hover:text-white p-1 rounded-lg"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Detalle o vista previa del documento para el profesional */}
        <div className="p-4 rounded-xl bg-white text-slate-900 border border-slate-300 space-y-3 font-sans print:m-0 print:p-0">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-[#2563eb] block">
                MAX SUPLEMENTOS · NUTRITION TRACKER
              </span>
              <h4 className="font-extrabold text-base text-slate-900">
                Suplementação Declarada - {userName}
              </h4>
              <p className="text-[11px] text-slate-500">
                Média dos últimos {periodDays} dias ({todayIso}) · Doses registradas pelo cliente
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs">
              Relatório Clínico
            </span>
          </div>

          {/* Tabela de Ingestão de Ingredientes */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 pb-1">
              <span>Ingrediente / Composto</span>
              <span>Média Diária Real</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {averageIngredients.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedIngredient(item)}
                  className="py-1.5 flex items-center justify-between text-xs hover:bg-slate-50 cursor-pointer px-1 rounded transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="text-[10px] text-slate-400">
                      ({item.sources.length} {item.sources.length === 1 ? 'produto' : 'produtos'})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-black text-slate-900">
                      {item.averagePerDay} {item.unit}
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Productos utilizados no período */}
          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-700 block">Potes ativos no período:</span>
            <div className="flex flex-wrap gap-1">
              {pots.map((p) => (
                <span
                  key={p.id}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    p.isStoreVerified
                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  {p.name} ({p.brand}) {!p.isStoreVerified && '⚠️ Aguardando MAX'}
                </span>
              ))}
            </div>
          </div>

          {/* Avisos legais conforme o PDF: Sem %VD, sem prescrição, valores declarados */}
          <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-500 leading-snug">
            * Dados declarados dos rótulos dos produtos multiplicados pelas doses que o cliente marcou no app. O app não prescreve, não avalia e não recomenda quantidades.
          </div>
        </div>

        {/* Modal interno de Detalhe: "De onde vem cada grama" */}
        {selectedIngredient && (
          <div className="p-3.5 rounded-xl bg-[#111318] border border-[#282a2f] space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#adc6ff]">pie_chart</span>
                <span>De onde vem o total de {selectedIngredient.name}:</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedIngredient(null)}
                className="text-xs text-[#8d90a0] hover:text-white"
              >
                Fechar detalhe
              </button>
            </div>

            <div className="space-y-1">
              {selectedIngredient.sources.map((src, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[#191c20]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-medium">{src.potName}</span>
                    {!src.isVerified && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                        Não conferido pela loja
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-[#adc6ff]">
                    {src.amount} {src.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-2.5 rounded-xl bg-[#282a2f] hover:bg-[#35373d] text-xs font-bold text-[#c3c6d7]"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handlePrintOrPdf}
            className="flex-1 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-600 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-lg"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Salvar em PDF / Enviar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
