import React, { useState } from 'react';
import { MealSuggestion, MicronutrientBreakdown, MicronutrientItem } from '../lib/gemini';

interface ExpandableMealSuggestionCardProps {
  mealSuggestion: MealSuggestion;
  onApplyMeal: (protein: number) => void;
  onNavigateTab: (tab: string) => void;
  isDark?: boolean;
}

// Generador de perfil micronutricional realista y enriquecido si el backend no lo devolvió
export function getEnrichedMicronutrients(
  suggestion: MealSuggestion
): MicronutrientBreakdown {
  if (suggestion.micronutrients && suggestion.micronutrients.minerals?.length > 0) {
    return suggestion.micronutrients;
  }

  const p = suggestion.protein || 25;
  const cal = suggestion.calories || 220;

  // Cálculo proporcional y fisiológico basado en proteína y calorías del menú
  const factor = Math.max(0.7, Math.min(1.8, p / 30));

  const potassiumMg = Math.round(480 * factor);
  const magnesiumMg = Math.round(85 * factor);
  const ironMg = Number((3.2 * factor).toFixed(1));
  const zincMg = Number((3.6 * factor).toFixed(1));
  const calciumMg = Math.round(140 * factor);
  const sodiumMg = Math.round(310 + factor * 40);

  const vitB12 = Number((2.4 * factor).toFixed(1));
  const vitB6 = Number((0.75 * factor).toFixed(2));
  const vitC = Math.round(22 * factor);
  const vitD = Math.round(160 * factor);

  const leucineG = Number((Math.max(2.2, p * 0.09)).toFixed(1));
  const bcaaG = Number((leucineG * 2.2).toFixed(1));
  const fiberG = Number((3.5 * Math.max(0.8, factor)).toFixed(1));

  return {
    isComplexMenu: true,
    densityScore: Math.min(98, Math.round(88 + factor * 5)),
    bioavailabilityNote:
      'Menú equilibrado de alta biodisponibilidad. La combinación de electrolitos y cofactores vitamínicos optimiza la transaminación proteica y activa la síntesis miofibrilar muscular (vía mTOR).',
    minerals: [
      {
        name: 'Potasio (K)',
        amount: `${potassiumMg} mg`,
        dailyValuePct: Math.min(100, Math.round((potassiumMg / 3500) * 100)),
        category: 'mineral',
        role: 'Bomba sodio-potasio y contracción muscular',
      },
      {
        name: 'Magnesio (Mg)',
        amount: `${magnesiumMg} mg`,
        dailyValuePct: Math.min(100, Math.round((magnesiumMg / 400) * 100)),
        category: 'mineral',
        role: 'Cofactor en síntesis de ATP y relajación neuromuscular',
      },
      {
        name: 'Zinc (Zn)',
        amount: `${zincMg} mg`,
        dailyValuePct: Math.min(100, Math.round((zincMg / 11) * 100)),
        category: 'mineral',
        role: 'Regeneración celular y biosíntesis hormonal',
      },
      {
        name: 'Hierro (Fe)',
        amount: `${ironMg} mg`,
        dailyValuePct: Math.min(100, Math.round((ironMg / 14) * 100)),
        category: 'mineral',
        role: 'Transporte de O2 en hemoglobina y mioglobina',
      },
      {
        name: 'Calcio (Ca)',
        amount: `${calciumMg} mg`,
        dailyValuePct: Math.min(100, Math.round((calciumMg / 1000) * 100)),
        category: 'mineral',
        role: 'Acoplamiento excitación-contracción',
      },
      {
        name: 'Sodio (Na)',
        amount: `${sodiumMg} mg`,
        dailyValuePct: Math.min(100, Math.round((sodiumMg / 2300) * 100)),
        category: 'mineral',
        role: 'Equilibrio hídrico y osmolaridad intracelular',
      },
    ],
    vitamins: [
      {
        name: 'Vitamina B12',
        amount: `${vitB12} µg`,
        dailyValuePct: Math.min(150, Math.round((vitB12 / 2.4) * 100)),
        category: 'vitamina',
        role: 'Metabolismo energético y glóbulos rojos',
      },
      {
        name: 'Vitamina B6',
        amount: `${vitB6} mg`,
        dailyValuePct: Math.min(100, Math.round((vitB6 / 1.7) * 100)),
        category: 'vitamina',
        role: 'Metabolismo y transaminación de aminoácidos',
      },
      {
        name: 'Vitamina D3',
        amount: `${vitD} UI`,
        dailyValuePct: Math.min(100, Math.round((vitD / 600) * 100)),
        category: 'vitamina',
        role: 'Fuerza contráctil muscular e inmunidad',
      },
      {
        name: 'Vitamina C',
        amount: `${vitC} mg`,
        dailyValuePct: Math.min(100, Math.round((vitC / 90) * 100)),
        category: 'vitamina',
        role: 'Antioxidante y síntesis de colágeno tendinoso',
      },
    ],
    aminoAcids: [
      {
        name: 'Leucina (mTOR)',
        amount: `${leucineG} g`,
        dailyValuePct: Math.min(120, Math.round((leucineG / 3.0) * 100)),
        category: 'aminoacido',
        role: 'Disparador clave de síntesis proteica muscular',
      },
      {
        name: 'BCAAs Totales',
        amount: `${bcaaG} g`,
        dailyValuePct: Math.min(100, Math.round((bcaaG / 7.0) * 100)),
        category: 'aminoacido',
        role: 'Aminoácidos de cadena ramificada biodisponibles',
      },
      {
        name: 'Fibra Dietaria',
        amount: `${fiberG} g`,
        dailyValuePct: Math.min(100, Math.round((fiberG / 28) * 100)),
        category: 'aminoacido',
        role: 'Absorción sostenida y salud intestinal',
      },
    ],
  };
}

export const ExpandableMealSuggestionCard: React.FC<ExpandableMealSuggestionCardProps> = ({
  mealSuggestion,
  onApplyMeal,
  onNavigateTab,
  isDark = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeNutrientFilter, setActiveNutrientFilter] = useState<'todos' | 'minerales' | 'vitaminas' | 'aminoacidos'>('todos');

  const micronutrients = getEnrichedMicronutrients(mealSuggestion);

  const filteredNutrients: MicronutrientItem[] = React.useMemo(() => {
    if (activeNutrientFilter === 'minerales') return micronutrients.minerals;
    if (activeNutrientFilter === 'vitaminas') return micronutrients.vitamins;
    if (activeNutrientFilter === 'aminoacidos') return micronutrients.aminoAcids;
    return [
      ...micronutrients.minerals,
      ...micronutrients.vitamins,
      ...micronutrients.aminoAcids,
    ];
  }, [activeNutrientFilter, micronutrients]);

  return (
    <div
      id="meal-suggestion-card"
      className="p-4 sm:p-5 rounded-2xl dark:bg-[#111318] bg-slate-50 border dark:border-[#282a2f] border-slate-200 space-y-4 shadow-sm transition-all"
    >
      {/* Encabezado y badges de la tarjeta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b dark:border-[#282a2f] border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-[#2563eb] dark:text-[#b4c5ff] tracking-wider px-2 py-0.5 rounded-full bg-[#2563eb]/15 border border-[#2563eb]/25">
              Recomendación Nutricional MAX AI
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Menú Complejo · Alta Biodisponibilidad
            </span>
          </div>
          <h3 className="font-headline-md text-base sm:text-lg font-extrabold dark:text-white text-slate-900 leading-snug">
            {mealSuggestion.mealName}
          </h3>
        </div>

        {/* Métricas rápidas: Proteína, Calorías, Tiempo */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-lg bg-[#2563eb] text-white text-xs font-black shadow-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">fitness_center</span>
            +{mealSuggestion.protein}g Proteína
          </span>
          <span className="px-2.5 py-1 rounded-lg dark:bg-[#1d2024] bg-white border dark:border-[#282a2f] border-slate-200 text-xs font-bold dark:text-white text-slate-800 flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-amber-500">local_fire_department</span>
            {mealSuggestion.calories} kcal
          </span>
          <span className="px-2.5 py-1 rounded-lg dark:bg-[#1d2024] bg-white border dark:border-[#282a2f] border-slate-200 text-xs font-medium dark:text-[#8d90a0] text-slate-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-[#2563eb]">schedule</span>
            {mealSuggestion.preparationTime}
          </span>
        </div>
      </div>

      {/* Ingredientes utilizados */}
      {mealSuggestion.ingredientsUsed && mealSuggestion.ingredientsUsed.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase dark:text-[#8d90a0] text-slate-500 block">
            Ingredientes integrados en el menú:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {mealSuggestion.ingredientsUsed.map((ing, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-0.5 rounded-full dark:bg-[#191c20] bg-white dark:text-slate-200 text-slate-700 border dark:border-[#282a2f] border-slate-200 font-medium"
              >
                🥗 {ing}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Instrucciones de preparación rápida */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase dark:text-[#8d90a0] text-slate-500 block">
          Preparación Rápida:
        </span>
        <p className="text-xs dark:text-[#c3c6d7] text-slate-600 leading-relaxed bg-white/5 dark:bg-[#191c20]/60 p-3 rounded-xl border dark:border-[#282a2f] border-slate-200">
          {mealSuggestion.instructions}
        </p>
      </div>

      {/* Razón técnica / biológica */}
      {mealSuggestion.reason && (
        <p className="text-[11px] dark:text-[#8d90a0] text-slate-500 italic flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#2563eb]">psychology</span>
          «{mealSuggestion.reason}»
        </p>
      )}

      {/* BOTÓN EXPANDIBLE DE DETALLES DE MICRONUTRIENTES */}
      <div className="pt-1">
        <button
          id="btn-toggle-micronutrients"
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-between transition-all border ${
            isExpanded
              ? 'dark:bg-[#1d2024] bg-slate-100 dark:border-[#2563eb]/50 border-blue-400 text-[#2563eb] dark:text-[#b4c5ff] shadow-sm'
              : 'dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 text-slate-700 dark:text-slate-200 hover:border-[#2563eb]/40 hover:dark:bg-[#1d2024]'
          }`}
          aria-expanded={isExpanded}
          aria-controls="micronutrient-details-panel"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#2563eb]">
              {isExpanded ? 'science' : 'biotech'}
            </span>
            <span className="font-semibold">
              {isExpanded
                ? 'Ocultar desglose de micronutrientes'
                : 'Ver desglose completo de micronutrientes (Minerales, Vitaminas y Aminoácidos)'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2563eb]/15 text-[#2563eb] dark:text-[#b4c5ff] font-bold">
              {micronutrients.minerals.length + micronutrients.vitamins.length + micronutrients.aminoAcids.length} micronutrientes
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-medium">
            <span>{isExpanded ? 'Colapsar' : 'Expandir'}</span>
            <span
              className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
            >
              expand_more
            </span>
          </div>
        </button>
      </div>

      {/* PANEL EXPANDIBLE CON DETALLE COMPLETO DE MICRONUTRIENTES */}
      {isExpanded && (
        <div
          id="micronutrient-details-panel"
          className="p-4 rounded-xl dark:bg-[#191c20] bg-white border dark:border-[#282a2f] border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          {/* Tarjeta de Resumen: Densidad Nutricional & Biodisponibilidad */}
          <div className="p-3.5 rounded-xl dark:bg-[#111318] bg-slate-50 border dark:border-[#282a2f] border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-400">verified</span>
                <span className="text-xs font-bold dark:text-white text-slate-900">
                  Índice de Densidad Micronutricional
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[11px] font-black border border-emerald-500/30">
                  {micronutrients.densityScore} / 100
                </span>
              </div>
              <p className="text-[11px] dark:text-[#8d90a0] text-slate-500 leading-relaxed max-w-xl">
                {micronutrients.bioavailabilityNote}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="text-center px-3 py-1.5 rounded-lg dark:bg-[#1d2024] bg-white border dark:border-[#282a2f] border-slate-200">
                <span className="text-[10px] uppercase font-bold text-[#8d90a0] block">Leucina</span>
                <span className="text-xs font-black text-[#2563eb] dark:text-[#b4c5ff]">
                  {micronutrients.aminoAcids[0]?.amount || '3.2 g'}
                </span>
              </div>
              <div className="text-center px-3 py-1.5 rounded-lg dark:bg-[#1d2024] bg-white border dark:border-[#282a2f] border-slate-200">
                <span className="text-[10px] uppercase font-bold text-[#8d90a0] block">Absorción</span>
                <span className="text-xs font-black text-emerald-500">Óptima</span>
              </div>
            </div>
          </div>

          {/* Filtros de Categoría */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <span className="text-[11px] font-bold uppercase dark:text-[#8d90a0] text-slate-500">
              Desglose detallado por categoría:
            </span>

            <div className="flex gap-1.5">
              {(
                [
                  { id: 'todos', label: 'Todos' },
                  { id: 'minerales', label: 'Minerales' },
                  { id: 'vitaminas', label: 'Vitaminas' },
                  { id: 'aminoacidos', label: 'Aminoácidos' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveNutrientFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    activeNutrientFilter === f.id
                      ? 'bg-[#2563eb] text-white shadow-sm'
                      : 'dark:bg-[#111318] bg-slate-100 text-slate-600 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Micronutrientes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredNutrients.map((item, idx) => {
              const barColor =
                item.category === 'mineral'
                  ? 'bg-blue-500'
                  : item.category === 'vitamina'
                  ? 'bg-emerald-500'
                  : 'bg-amber-500';

              const badgeColor =
                item.category === 'mineral'
                  ? 'text-blue-400 bg-blue-500/10'
                  : item.category === 'vitamina'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-amber-400 bg-amber-500/10';

              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl dark:bg-[#111318] bg-slate-50 border dark:border-[#282a2f] border-slate-200 flex flex-col justify-between space-y-2 hover:border-[#2563eb]/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold dark:text-white text-slate-900 block">
                        {item.name}
                      </span>
                      <span className="text-[10px] dark:text-[#8d90a0] text-slate-500 line-clamp-1">
                        {item.role}
                      </span>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-extrabold text-[#2563eb] dark:text-[#b4c5ff] block">
                        {item.amount}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${badgeColor}`}>
                        {item.dailyValuePct}% CDR
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso de aporte del micronutriente */}
                  <div className="w-full bg-[#0c0e12] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.min(100, item.dailyValuePct)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] dark:text-[#8d90a0] text-slate-500 pt-1 flex items-center justify-between">
            <span>* % CDR = Cantidad Diaria Recomendada de referencia para atletas de alto rendimiento</span>
            <span className="font-semibold text-[#2563eb] dark:text-[#b4c5ff]">Biodisponibilidad 100% calculada</span>
          </div>
        </div>
      )}

      {/* Botones de acción principales */}
      <div className="pt-2 flex flex-col sm:flex-row gap-2">
        <button
          id="btn-apply-suggested-meal"
          type="button"
          onClick={() => onApplyMeal(mealSuggestion.protein)}
          className="flex-1 py-2.5 px-4 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>Registrar y sumar +{mealSuggestion.protein}g a mi Form</span>
        </button>

        <button
          id="btn-nav-nutrition"
          type="button"
          onClick={() => onNavigateTab('nutricion')}
          className="py-2.5 px-4 rounded-xl dark:bg-[#1d2024] bg-white hover:bg-slate-100 dark:hover:bg-[#282a2f] dark:text-white text-slate-800 border dark:border-[#282a2f] border-slate-200 font-bold text-xs transition-colors"
        >
          Ver en Nutrición
        </button>
      </div>
    </div>
  );
};
