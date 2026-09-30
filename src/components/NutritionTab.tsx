import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { MacroNutrients } from '../types';
import { MealIdeasCatalog } from './MealIdeasCatalog';
import { AddRecipeModal } from './AddRecipeModal';
import { getIngredientImage } from '../data/ingredientImages';
import { GoogleMapsExplorer } from './GoogleMapsExplorer';

interface NutritionTabProps {
  hydration: number;
  onAddWater: () => void;
  onReduceWater?: () => void;
  onAddProtein: (amount: number) => void;
  onReduceProtein?: (amount: number) => void;
  onAddMealEntry?: (meal: {
    name: string;
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  }) => void;
  onDeleteMealEntry?: (mealId: string) => void;
  onUpdateDirectIntake?: (protein: number, water: number, carbs?: number, fats?: number) => void;
  foodHistory?: Array<{
    id: string;
    name: string;
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
    timestamp: number | string;
  }>;
  currentProtein: number;
  macros?: MacroNutrients;
  targets?: {
    hydrationLiters: number;
    proteinGrams: number;
    carbsGrams?: number;
    fatsGrams?: number;
    calories: number;
  };
  isDark?: boolean;
}

export const NutritionTab: React.FC<NutritionTabProps> = ({
  hydration,
  onAddWater,
  onReduceWater,
  onAddProtein,
  onReduceProtein,
  onAddMealEntry,
  onDeleteMealEntry,
  onUpdateDirectIntake,
  foodHistory = [],
  currentProtein,
  macros = { protein: currentProtein, carbs: 0, fats: 0, calories: currentProtein * 4 },
  targets,
  isDark = true,
}) => {
  const [activeFilter, setActiveFilter] = useState<'Más proteína' | 'Menos calorías' | 'Más rápido (<10m)'>('Más proteína');
  const [ingredients, setIngredients] = useState<string[]>(['Pollo', 'Huevos', 'Arroz', 'Tomate', 'Cebolla', 'Queso magro']);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [inputFoodText, setInputFoodText] = useState('Comí pollo con arroz y dos huevos');
  const [customInputOpen, setCustomInputOpen] = useState(false);
  const [addedSuccessMessage, setAddedSuccessMessage] = useState<string | null>(null);
  const [showMealIdeas, setShowMealIdeas] = useState(false);
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [showCalibrateModal, setShowCalibrateModal] = useState(false);
  const [showMapsExplorer, setShowMapsExplorer] = useState(false);
  const [isAnalyzingText, setIsAnalyzingText] = useState(false);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Estados para la calibración manual directa
  const [calibProtein, setCalibProtein] = useState<number>(macros.protein || currentProtein);
  const [calibWater, setCalibWater] = useState<number>(hydration);
  const [calibCarbs, setCalibCarbs] = useState<number>(macros.carbs || 210);
  const [calibFats, setCalibFats] = useState<number>(macros.fats || 58);

  const effectiveProtein = macros.protein ?? currentProtein ?? 0;
  const effectiveCarbs = macros.carbs ?? 0;
  const effectiveFats = macros.fats ?? 0;
  const effectiveCalories = macros.calories ?? (effectiveProtein * 4 + effectiveCarbs * 4 + effectiveFats * 9);

  const targetProtein = targets?.proteinGrams || 150;
  const targetCarbs = targets?.carbsGrams || 220;
  const targetFats = targets?.fatsGrams || 65;
  const targetCalories = targets?.calories || (targetProtein * 4 + targetCarbs * 4 + targetFats * 9);
  const targetHydration = targets?.hydrationLiters || 2.5;

  // Cálculo de calorías por macro para la distribución real de energía
  // 1g Proteína = 4 kcal, 1g Carbos = 4 kcal, 1g Grasa = 9 kcal
  const macroChartData = useMemo(() => {
    const proteinKcal = effectiveProtein * 4;
    const carbsKcal = effectiveCarbs * 4;
    const fatsKcal = effectiveFats * 9;
    const totalCalcKcal = Math.max(1, proteinKcal + carbsKcal + fatsKcal);

    return [
      {
        name: 'Proteína',
        grams: effectiveProtein,
        calories: proteinKcal,
        pct: Math.round((proteinKcal / totalCalcKcal) * 100),
        color: '#ffffff',
        target: targetProtein,
      },
      {
        name: 'Carbohidratos',
        grams: effectiveCarbs,
        calories: carbsKcal,
        pct: Math.round((carbsKcal / totalCalcKcal) * 100),
        color: '#10b981', // Verde Esmeralda
        target: targetCarbs,
      },
      {
        name: 'Grasas',
        grams: effectiveFats,
        calories: fatsKcal,
        pct: Math.round((fatsKcal / totalCalcKcal) * 100),
        color: '#f59e0b', // Ámbar Dorado
        target: targetFats,
      },
    ];
  }, [effectiveProtein, effectiveCarbs, effectiveFats, targetProtein, targetCarbs, targetFats]);

  const removeIngredient = (ing: string) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const addIngredientPrompt = () => {
    const ing = prompt('Escribe el ingrediente que tienes en tu heladera:');
    if (ing && ing.trim()) {
      setIngredients([...ingredients, ing.trim()]);
    }
  };

  const handleConfirmPredictiveEntry = (customMeal: {
    name: string;
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  }) => {
    if (onAddMealEntry) {
      onAddMealEntry(customMeal);
    } else {
      onAddProtein(customMeal.protein);
    }

    setAddedSuccessMessage(`¡Comida registrada con éxito! +${customMeal.protein}g Proteína, +${customMeal.carbs}g Carbos y +${customMeal.fats}g Grasas sumadas al gráfico de macros.`);
    setTimeout(() => {
      setAddedSuccessMessage(null);
    }, 4500);
  };

  // Analiza el texto libre con MAX AI (Gemini) y registra la comida con los
  // macros que realmente devuelve el modelo, no valores fijos.
  const handleAnalyzeAndLogText = async () => {
    if (!inputFoodText.trim() || isAnalyzingText) return;
    setIsAnalyzingText(true);
    setAnalysisError(null);
    try {
      const res = await fetch('/api/ai/simple-food-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputFoodText }),
      });
      if (!res.ok) throw new Error(`simple-food-estimate respondió ${res.status}`);
      const data = await res.json();
      handleConfirmPredictiveEntry({
        name: data.foodSummary || inputFoodText,
        protein: data.protein ?? 0,
        carbs: data.carbs ?? 0,
        fats: data.fats ?? 0,
        calories: data.calories ?? 0,
      });
    } catch (err) {
      setAnalysisError('No pudimos analizar esa comida ahora mismo. Probá de nuevo en un momento.');
    } finally {
      setIsAnalyzingText(false);
    }
  };

  // Analiza una foto de plato con MAX AI (Gemini Vision) y registra la
  // comida con los macros reales devueltos por el modelo.
  const handleAnalyzePhoto = async (file: File) => {
    if (isAnalyzingPhoto) return;
    setIsAnalyzingPhoto(true);
    setAnalysisError(null);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/ai/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      if (!res.ok) throw new Error(`analyze-food respondió ${res.status}`);
      const data = await res.json();
      handleConfirmPredictiveEntry({
        name: data.title || 'Plato analizado por MAX AI',
        protein: data.protein ?? 0,
        carbs: data.carbs ?? 0,
        fats: data.fats ?? 0,
        calories: data.calories ?? 0,
      });
    } catch (err) {
      setAnalysisError('No pudimos analizar esa foto ahora mismo. Probá de nuevo en un momento.');
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const maxProtein = targetProtein;
  const proteinPct = Math.min(100, Math.round((effectiveProtein / maxProtein) * 100));
  const missingProtein = Math.max(0, maxProtein - effectiveProtein);

  return (
    <div className="flex flex-col w-full px-4 space-y-5 max-w-[1280px] mx-auto pb-24">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <span className="font-label-caps text-label-caps text-slate-700 dark:text-[#d6d6d6] tracking-wider uppercase block font-bold">
            Optimización Metabólica
          </span>
          <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-slate-900 dark:text-white font-bold">
            Nutrición y Comidas
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón Destacado CREAR PLATO en el Header */}
          <button
            type="button"
            onClick={() => setShowAddRecipeModal(true)}
            className="bg-gradient-to-r from-white dark:from-[#0a0a0a] to-slate-300 dark:to-[#545a5b] hover:from-white dark:hover:from-[#0a0a0a] hover:to-slate-300 dark:hover:to-[#545a5b] text-slate-900 dark:text-white font-bold text-xs px-3.5 py-2 rounded-full shadow-lg border border-slate-300 dark:border-white/30 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span className="whitespace-nowrap font-black">Crear Plato</span>
            <span className="bg-white/20 text-slate-900 dark:text-white text-[10px] px-1.5 py-0.2 rounded-full font-black hidden xs:inline">+30 XP</span>
          </button>

          {/* Date Switcher Pill */}
          <div className="flex items-center bg-white dark:bg-[#0a0a0a] rounded-full px-3 py-1 gap-1 shadow-sm border border-slate-300 dark:border-[#545a5b]">
            <button aria-label="Día anterior" className="text-slate-500 dark:text-[#898a8c] hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center p-0.5">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <div className="flex items-center gap-1.5 px-1">
              <span className="material-symbols-outlined text-[16px] text-slate-700 dark:text-[#d6d6d6]">calendar_today</span>
              <span className="font-label-caps text-label-caps text-slate-900 dark:text-white whitespace-nowrap font-bold">
                Hoy, {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date())}
              </span>
            </div>
            <button aria-label="Día siguiente" className="text-slate-500 dark:text-[#898a8c] hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center p-0.5">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {addedSuccessMessage && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-body-sm flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{addedSuccessMessage}</span>
        </div>
      )}

      {/* Módulo Dual: Ideas de Comida (Uruguay 🇺🇾 & Brasil 🇧🇷) + Crear Plato */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Tarjeta 1: Catálogo de Ideas de Comida */}
        <div 
          onClick={() => setShowMealIdeas(true)}
          className="lg:col-span-8 relative overflow-hidden rounded-2xl bg-white dark:bg-[#0a0a0a] border border-[#ffffff]/40 p-4 sm:p-5 shadow-xl hover:border-[#ffffff] transition-all cursor-pointer group active:scale-[0.99] flex flex-col justify-between"
        >
          <div className="relative z-10 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#ffffff]/30 text-slate-700 dark:text-[#d6d6d6] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#ffffff]/40 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">restaurant_menu</span>
                Catálogo de Rendimiento
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span>🇺🇾 Uruguay & 🇧🇷 Brasil</span>
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                +50 Platos Fitness
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-[#d6d6d6] transition-colors flex items-center gap-2">
              <span>Ideas de Comida</span>
              <span className="text-base sm:text-lg">💡</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-[#d6d6d6] leading-relaxed">
              Explorá más de 50 recetas altas en proteína de Uruguay y Brasil (Chivito fit, Picanha magra, Feijoada proteica, Escondidinho y más) con fotos de alimentos reales, ingredientes y registro en 1 tap.
            </p>
          </div>

          <div className="relative z-10 pt-4 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-[#898a8c] font-semibold hidden sm:inline">
              Toca para abrir la galería completa de recetas
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMealIdeas(true);
              }}
              className="bg-white dark:bg-[#0a0a0a] group-hover:bg-[#545a5b] text-slate-900 dark:text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer ml-auto"
            >
              <span>Ver Catálogo de Platos</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </div>

        {/* Tarjeta 2: Botón/Card MUY VISIBLE de Crear Plato */}
        <div
          onClick={() => setShowAddRecipeModal(true)}
          className="lg:col-span-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-white dark:from-[#0a0a0a] via-white dark:via-[#0a0a0a] to-white dark:to-[#0a0a0a] border-2 border-dashed border-[#ffffff]/60 hover:border-[#ffffff] p-4 sm:p-5 shadow-xl transition-all cursor-pointer group active:scale-[0.99] flex flex-col justify-between"
        >
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <span className="bg-[#ffffff]/30 text-slate-700 dark:text-[#d6d6d6] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#ffffff]/50 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">add_circle</span>
                Tus Recetas
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                +30 XP
              </span>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">soup_kitchen</span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-[#d6d6d6] transition-colors leading-tight">
                  Crear Mi Plato
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-[#898a8c]">
                  Añadí tu comida personalizada
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-[#d6d6d6] leading-relaxed pt-1">
              Subí tus comidas criollas o brasileñas con sus macros exactos e ingredientes para tenerlas siempre en tu catálogo.
            </p>
          </div>

          <div className="relative z-10 pt-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowAddRecipeModal(true);
              }}
              className="w-full bg-gradient-to-r from-white dark:from-[#0a0a0a] to-slate-300 dark:to-[#545a5b] hover:from-white dark:hover:from-[#0a0a0a] hover:to-slate-300 dark:hover:to-[#545a5b] text-slate-900 dark:text-white font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Crear Plato Ahora</span>
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry Overview: Caloric Core & Target Balance */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-5 shadow-md relative overflow-hidden border border-slate-200 dark:border-white/10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="font-label-caps text-label-caps text-slate-500 dark:text-[#898a8c] uppercase tracking-widest block font-bold">
              Balance Energético Diario
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-metric-stat text-metric-stat text-slate-900 dark:text-white font-extrabold tracking-tight">
                {effectiveCalories.toLocaleString('es-ES')}
              </span>
              <span className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c]">/ {targetCalories.toLocaleString('es-ES')} kcal</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="bg-[#ffffff]/20 text-slate-700 dark:text-[#d6d6d6] font-label-caps text-label-caps px-2 py-0.5 rounded-full border border-[#ffffff]/30 font-bold">
              {Math.min(100, Math.round((effectiveCalories / targetCalories) * 100))}% COMPLETADO
            </span>
            <span className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c] mt-1">
              Restante: {Math.max(0, targetCalories - effectiveCalories)} kcal
            </span>
          </div>
        </div>

        {/* Main Calorie Bar */}
        <div className="w-full bg-white dark:bg-[#0a0a0a] h-2 rounded-full overflow-hidden mb-4">
          <div
            className="bg-[#ffffff] h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (effectiveCalories / targetCalories) * 100)}%` }}
          ></div>
        </div>

        {/* Gráfico de Dona Dinámico de Macros */}
        <div className="my-4 p-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-1/2 flex flex-col items-center relative">
            <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="calories"
                  >
                    {macroChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0a0a0a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any, item: any) => [
                      `${item.payload.grams}g (${value} kcal) · ${item.payload.pct}% del total`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: '#0a0a0a',
                      borderColor: '#0a0a0a',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Centro de la dona */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-[#898a8c] uppercase">
                  CALORÍAS
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {effectiveCalories}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  kcal hoy
                </span>
              </div>
            </div>
            <span className="text-xs text-slate-500 dark:text-[#898a8c] mt-1 text-center">
              Distribución calculada dinámicamente con IA
            </span>
          </div>

          {/* Leyenda y desglose de macros del gráfico de dona */}
          <div className="w-full md:w-1/2 space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Distribución de Macros
              </span>
              <span className="text-[11px] text-slate-500 dark:text-[#898a8c]">
                Actualizado en tiempo real
              </span>
            </div>

            {macroChartData.map((macro) => (
              <div
                key={macro.name}
                className="p-2.5 rounded-lg bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: macro.color }}
                  ></span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {macro.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-[#898a8c]">
                      Meta: {macro.target}g
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {macro.grams}g <span className="text-slate-500 dark:text-[#898a8c]">({macro.pct}%)</span>
                  </span>
                  <span className="text-[10px] font-medium" style={{ color: macro.color }}>
                    {macro.calories} kcal
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Macronutrient Grid Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Proteína */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-lg p-3 border border-slate-200 dark:border-white/10">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ffffff]"></span>
                <span className="font-label-caps text-label-caps text-slate-900 dark:text-white font-bold">PROTEÍNA</span>
              </div>
              <span className="font-label-caps text-label-caps text-slate-700 dark:text-[#d6d6d6] font-bold">
                {missingProtein === 0 ? '¡Completada!' : `Faltan ${missingProtein} g`}
              </span>
            </div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-headline-md text-headline-md text-slate-900 dark:text-white font-bold">
                {effectiveProtein} <span className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c]">/ {targetProtein} g</span>
              </span>
              <span className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c] font-medium">{proteinPct}%</span>
            </div>
            <div className="w-full bg-white dark:bg-[#0a0a0a] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#ffffff] h-full rounded-full transition-all duration-500" style={{ width: `${proteinPct}%` }}></div>
            </div>
          </div>

          {/* Carbohidratos */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-lg p-3 border border-slate-200 dark:border-white/10">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                <span className="font-label-caps text-label-caps text-slate-900 dark:text-white font-bold">CARBOS</span>
              </div>
              <span className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c]">Meta: {targetCarbs} g</span>
            </div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-headline-md text-headline-md text-slate-900 dark:text-white font-bold">
                {effectiveCarbs} <span className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c]">/ {targetCarbs} g</span>
              </span>
              <span className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c]">
                {Math.min(100, Math.round((effectiveCarbs / targetCarbs) * 100))}%
              </span>
            </div>
            <div className="w-full bg-white dark:bg-[#0a0a0a] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#10b981] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (effectiveCarbs / targetCarbs) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Grasas */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-lg p-3 border border-slate-200 dark:border-white/10">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                <span className="font-label-caps text-label-caps text-slate-900 dark:text-white font-bold">GRASAS SALUDABLES</span>
              </div>
              <span className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c]">Meta: {targetFats} g</span>
            </div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-headline-md text-headline-md text-slate-900 dark:text-white font-bold">
                {effectiveFats} <span className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c]">/ {targetFats} g</span>
              </span>
              <span className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c]">
                {Math.min(100, Math.round((effectiveFats / targetFats) * 100))}%
              </span>
            </div>
            <div className="w-full bg-white dark:bg-[#0a0a0a] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#f59e0b] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (effectiveFats / targetFats) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Hidratación */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-lg p-3 border border-slate-200 dark:border-white/10">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-slate-700 dark:text-[#d6d6d6]">water_drop</span>
                <span className="font-label-caps text-label-caps text-slate-900 dark:text-white font-bold">HIDRATACIÓN</span>
              </div>
              <button 
                type="button"
                onClick={onAddWater}
                className="font-label-caps text-label-caps text-slate-700 dark:text-[#d6d6d6] hover:underline font-bold"
              >
                +250 ml
              </button>
            </div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-headline-md text-headline-md text-slate-900 dark:text-white font-bold">
                {hydration.toFixed(1).replace('.', ',')} <span className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c]">/ {targetHydration.toFixed(1).replace('.', ',')} L</span>
              </span>
              <span className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c]">
                {Math.min(100, Math.round((hydration / targetHydration) * 100))}%
              </span>
            </div>
            <div className="w-full bg-white dark:bg-[#0a0a0a] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#ffffff] h-full rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(100, (hydration / targetHydration) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de Corrección Rápida y Deshacer Errores de Consumo */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-4 border border-slate-200 dark:border-white/10 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Corrección de Consumo & Deshacer
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                  ¿Te equivocaste?
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#898a8c]">
                Ajustá o restá si agregaste más gramos o líquido de lo que realmente consumiste.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setCalibProtein(effectiveProtein);
              setCalibWater(hydration);
              setCalibCarbs(effectiveCarbs);
              setCalibFats(effectiveFats);
              setShowCalibrateModal(true);
            }}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[#ffffff]/20 hover:bg-[#ffffff]/30 border border-[#ffffff]/40 text-slate-700 dark:text-[#d6d6d6] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">edit_calendar</span>
            <span>Calibrar Valores Exactos</span>
          </button>
        </div>

        {/* Botones Rápidos para Restar o Sumar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200 dark:border-white/10">
          <span className="text-[11px] font-bold text-slate-500 dark:text-[#898a8c] uppercase tracking-wider block mr-1">
            Ajustes Rápidos:
          </span>

          {onReduceProtein && effectiveProtein > 0 && (
            <>
              <button
                type="button"
                onClick={() => onReduceProtein(10)}
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                title="Restar 10g de proteína"
              >
                <span className="material-symbols-outlined text-[14px]">remove</span>
                <span>-10g Prot</span>
              </button>

              <button
                type="button"
                onClick={() => onReduceProtein(25)}
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                title="Restar 25g de proteína"
              >
                <span className="material-symbols-outlined text-[14px]">remove</span>
                <span>-25g Prot</span>
              </button>
            </>
          )}

          {onReduceWater && hydration > 0 && (
            <button
              type="button"
              onClick={onReduceWater}
              className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-slate-300 dark:border-white/30 text-slate-900 dark:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              title="Restar 250ml de agua"
            >
              <span className="material-symbols-outlined text-[14px]">remove</span>
              <span>-250ml Agua</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onAddProtein(25)}
            className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-slate-300 dark:border-white/30 text-slate-900 dark:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ml-auto"
            title="Sumar 25g de proteína"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            <span>+25g Prot</span>
          </button>

          <button
            type="button"
            onClick={onAddWater}
            className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-slate-300 dark:border-white/30 text-slate-900 dark:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            title="Sumar 250ml de agua"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            <span>+250ml Agua</span>
          </button>
        </div>
      </div>

      {/* Historial de Comidas Registradas de Hoy con Opción de Eliminar / Deshacer */}
      {foodHistory && foodHistory.length > 0 && (
        <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-4 border border-slate-200 dark:border-white/10 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-900 dark:text-[#ffffff] text-[20px]">receipt_long</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Comidas Registradas Hoy ({foodHistory.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-[#898a8c]">
              Tocá eliminar para descontar los macros de cualquier comida
            </span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {foodHistory.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-[#898a8c] mt-0.5">
                    <span className="text-slate-700 dark:text-[#d6d6d6] font-bold">+{item.protein}g P</span>
                    <span>·</span>
                    <span>{item.carbs}g C</span>
                    <span>·</span>
                    <span>{item.fats}g G</span>
                    <span>·</span>
                    <span>{item.calories} kcal</span>
                  </div>
                </div>

                {onDeleteMealEntry && (
                  <button
                    type="button"
                    onClick={() => onDeleteMealEntry(item.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 active:scale-95"
                    title="Eliminar comida y restar sus macros"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    <span>Deshacer</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Calibración Exacta de Totales */}
      {showCalibrateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-white/10 shadow-2xl space-y-4 text-slate-900 dark:text-white animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-900 dark:text-[#ffffff]">tune</span>
                <h3 className="text-base font-bold">Corregir Totales de Hoy</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCalibrateModal(false)}
                className="text-slate-500 dark:text-[#898a8c] hover:text-slate-900 dark:hover:text-white p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-[#898a8c]">
              Ingresá los valores exactos acumulados que realmente consumiste hoy para calibrar tu balance:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-[#d6d6d6] block mb-1">Proteína total de hoy (gramos):</label>
                <input
                  type="number"
                  min="0"
                  max="350"
                  value={calibProtein}
                  onChange={(e) => setCalibProtein(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:border-[#ffffff] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-[#d6d6d6] block mb-1">Agua total de hoy (Litros):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={calibWater}
                  onChange={(e) => setCalibWater(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:border-[#ffffff] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-emerald-400 block mb-1">Carbos (g):</label>
                  <input
                    type="number"
                    min="0"
                    value={calibCarbs}
                    onChange={(e) => setCalibCarbs(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:border-[#ffffff] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-amber-400 block mb-1">Grasas (g):</label>
                  <input
                    type="number"
                    min="0"
                    value={calibFats}
                    onChange={(e) => setCalibFats(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:border-[#ffffff] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowCalibrateModal(false)}
                className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-[#0a0a0a] hover:bg-[#545a5b] text-xs font-bold text-slate-700 dark:text-[#d6d6d6] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onUpdateDirectIntake) {
                    onUpdateDirectIntake(calibProtein, calibWater, calibCarbs, calibFats);
                  }
                  setShowCalibrateModal(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-[#0a0a0a] hover:bg-[#545a5b] text-xs font-bold text-slate-900 dark:text-white transition-colors shadow-md"
              >
                Guardar Corrección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Logging Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-slate-900 dark:text-white font-bold">Registro Rápido</h2>
          <span className="font-label-caps text-label-caps text-slate-500 dark:text-[#898a8c] uppercase font-bold">Potenciado por MAX AI</span>
        </div>

        {/* Acciones de Registro Rápido: 5 opciones con Google Maps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button 
            type="button"
            onClick={() => setCustomInputOpen(!customInputOpen)}
            className="bg-white dark:bg-[#0a0a0a] hover:bg-[#545a5b] active:scale-[0.98] transition-all p-3.5 sm:p-4 rounded-xl text-left flex flex-col justify-between h-32 shadow-sm border border-slate-300 dark:border-[#545a5b]"
          >
            <div className="w-8 h-8 rounded-lg bg-[#ffffff]/20 text-slate-700 dark:text-[#d6d6d6] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">edit_note</span>
            </div>
            <div>
              <span className="font-body-md text-body-md font-bold text-slate-900 dark:text-white block">Escribir comida</span>
              <span className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c]">Voz o texto libre</span>
            </div>
          </button>

          <label className={`bg-white dark:bg-[#0a0a0a] hover:bg-[#545a5b] active:scale-[0.98] transition-all p-3.5 sm:p-4 rounded-xl text-left flex flex-col justify-between h-32 shadow-sm border border-slate-300 dark:border-[#545a5b] cursor-pointer ${isAnalyzingPhoto ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-[#ffffff]/30 text-slate-700 dark:text-[#d6d6d6] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">{isAnalyzingPhoto ? 'hourglass_top' : 'photo_camera'}</span>
            </div>
            <div>
              <span className="font-body-md text-body-md font-bold text-slate-900 dark:text-white block">
                {isAnalyzingPhoto ? 'Analizando...' : 'Analizar foto'}
              </span>
              <span className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c]">Visión artificial AI</span>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isAnalyzingPhoto}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file) {
                  handleAnalyzePhoto(file);
                }
              }}
            />
          </label>

          {/* Tarjeta 3: Ideas de Comida (Uruguay 🇺🇾 & Brasil 🇧🇷) */}
          <button 
            type="button"
            onClick={() => setShowMealIdeas(true)}
            className="bg-gradient-to-br from-white dark:from-[#0a0a0a] to-white dark:to-[#0a0a0a] hover:from-white dark:hover:from-[#0a0a0a] hover:to-white dark:hover:to-[#0a0a0a] active:scale-[0.98] transition-all p-3.5 sm:p-4 rounded-xl text-left flex flex-col justify-between h-32 shadow-sm border border-[#ffffff]/40 group cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
              </div>
              <span className="text-[10px] font-extrabold bg-[#ffffff]/30 text-slate-700 dark:text-[#d6d6d6] px-1.5 py-0.5 rounded border border-[#ffffff]/40">
                +54 Platos
              </span>
            </div>
            <div>
              <span className="font-body-md text-body-md font-bold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-[#d6d6d6] transition-colors block">
                Ideas de Comida
              </span>
              <span className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c]">
                🇺🇾 Uruguay & 🇧🇷 Brasil
              </span>
            </div>
          </button>

          {/* Tarjeta 4: Crear Mi Plato */}
          <button 
            type="button"
            onClick={() => setShowAddRecipeModal(true)}
            className="bg-gradient-to-br from-white dark:from-[#0a0a0a] to-white dark:to-[#0a0a0a] hover:from-white dark:hover:from-[#0a0a0a] hover:to-white dark:hover:to-[#0a0a0a] active:scale-[0.98] transition-all p-3.5 sm:p-4 rounded-xl text-left flex flex-col justify-between h-32 shadow-lg border-2 border-[#ffffff]/70 group cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-400 text-black flex items-center justify-center shadow-md font-black">
                <span className="material-symbols-outlined text-[20px] font-bold">add</span>
              </div>
              <span className="text-[10px] font-black bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
                +30 XP
              </span>
            </div>
            <div>
              <span className="font-body-md text-body-md font-black text-slate-900 dark:text-white group-hover:text-amber-300 transition-colors block">
                Crear Plato
              </span>
              <span className="font-body-sm text-body-sm text-slate-700 dark:text-[#d6d6d6]">
                Subir receta
              </span>
            </div>
          </button>

          {/* Tarjeta 5: Comida Fit Cerca (Google Maps) */}
          <button 
            type="button"
            onClick={() => setShowMapsExplorer(!showMapsExplorer)}
            className={`bg-gradient-to-br from-[#2a1725] to-white dark:to-[#0a0a0a] hover:from-[#3a2034] hover:to-white dark:hover:to-[#0a0a0a] active:scale-[0.98] transition-all p-3.5 sm:p-4 rounded-xl text-left flex flex-col justify-between h-32 shadow-sm border transition-colors group cursor-pointer ${
              showMapsExplorer ? 'border-rose-400 ring-2 ring-rose-400/30' : 'border-rose-500/40'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-lg bg-rose-500 text-slate-900 dark:text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[18px]">pin_drop</span>
              </div>
              <span className="text-[10px] font-extrabold bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">
                Maps
              </span>
            </div>
            <div>
              <span className="font-body-md text-body-md font-bold text-slate-900 dark:text-white group-hover:text-rose-300 transition-colors block">
                Comida Fit Cerca
              </span>
              <span className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c]">
                Google Maps & AI
              </span>
            </div>
          </button>
        </div>

        {/* Sección interactiva de Google Maps Grounding para Comida Fit */}
        {showMapsExplorer && (
          <div className="animate-fadeIn">
            <GoogleMapsExplorer
              isDark={isDark}
              defaultCategory="healthy_food"
              title="Restaurantes Fit & Comida Proteica Cercana"
              subtitle="Lugares y locales fitness verificados con Google Maps en tiempo real"
            />
          </div>
        )}

        {/* Registro por texto libre, analizado en el momento con MAX AI */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-4 shadow-md space-y-3 border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-slate-700 dark:text-[#d6d6d6]">auto_awesome</span>
              <span className="font-label-caps text-label-caps text-slate-900 dark:text-white uppercase font-bold">Registrar con MAX AI</span>
            </div>
            <span className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c]">Análisis en tiempo real</span>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] p-3 rounded-lg flex items-center gap-2 border border-slate-200 dark:border-white/10">
            <span className="material-symbols-outlined text-[20px] text-slate-500 dark:text-[#898a8c]">keyboard</span>
            <input
              type="text"
              value={inputFoodText}
              onChange={(e) => setInputFoodText(e.target.value)}
              placeholder="Ej: Comí pollo con arroz y dos huevos"
              disabled={isAnalyzingText}
              className="bg-transparent text-slate-900 dark:text-white font-body-md w-full focus:outline-none disabled:opacity-60"
            />
          </div>

          {analysisError && (
            <p className="text-xs text-rose-400 font-medium">{analysisError}</p>
          )}

          <button
            type="button"
            onClick={handleAnalyzeAndLogText}
            disabled={isAnalyzingText || !inputFoodText.trim()}
            className="w-full bg-white dark:bg-[#0a0a0a] hover:bg-[#545a5b] disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white font-body-md font-bold py-2.5 rounded-lg text-center transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isAnalyzingText ? 'hourglass_top' : 'add_task'}
            </span>
            <span>{isAnalyzingText ? 'Analizando con MAX AI...' : 'Analizar y registrar con MAX AI'}</span>
          </button>
        </div>
      </div>

      {/* Feature: "¿Qué tengo para comer? (Refrigerador AI)" */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-5 shadow-md space-y-4 relative overflow-hidden border border-slate-200 dark:border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#ffffff]/20 text-slate-700 dark:text-[#d6d6d6]">
              <span className="material-symbols-outlined text-[16px]">kitchen</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-slate-900 dark:text-white font-bold">¿Qué tengo para comer?</h2>
          </div>
          <p className="font-body-sm text-body-sm text-slate-500 dark:text-[#898a8c]">
            Mostrale a MAX AI lo que tenés en tu heladera o alacena y encontrá algo óptimo para tus metas.
          </p>
        </div>

        {/* Detected Ingredient Chips */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-label-caps text-label-caps text-slate-900 dark:text-white uppercase font-bold">Ingredientes escaneados</span>
            <button 
              type="button"
              onClick={addIngredientPrompt}
              className="font-label-caps text-label-caps text-slate-700 dark:text-[#d6d6d6] hover:underline flex items-center gap-1 font-bold"
            >
              <span className="material-symbols-outlined text-[14px]">add</span> Añadir ingrediente
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing) => (
              <span 
                key={ing} 
                className="inline-flex items-center gap-1.5 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white px-3 py-1 rounded-full text-body-sm font-medium border border-slate-300 dark:border-[#545a5b]"
              >
                {ing}
                <button 
                  type="button"
                  onClick={() => removeIngredient(ing)}
                  className="material-symbols-outlined text-[14px] text-slate-500 dark:text-[#898a8c] hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  close
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Quick Adjustment Pills */}
        <div className="space-y-1.5">
          <span className="font-label-caps text-label-caps text-slate-500 dark:text-[#898a8c] uppercase block font-bold">Filtrar combinación</span>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(['Más proteína', 'Menos calorías', 'Más rápido (<10m)'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-full font-label-caps text-label-caps whitespace-nowrap transition-all ${
                  activeFilter === filter 
                    ? 'bg-[#0a0a0a] text-slate-900 dark:text-white font-bold shadow-sm' 
                    : 'bg-[#0a0a0a] text-slate-500 dark:text-[#898a8c] hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* AI Chef Card Recommendation */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-4 relative space-y-3 shadow-sm border border-slate-200 dark:border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <span className="bg-[#ffffff]/20 text-slate-700 dark:text-[#d6d6d6] font-label-caps text-label-caps px-2 py-0.5 rounded-full inline-block mb-1 border border-[#ffffff]/30 font-bold">
                Recomendación Activa
              </span>
              <h3 className="font-headline-md text-headline-md text-slate-900 dark:text-white font-bold">Bowl de pollo alto en proteína</h3>
            </div>
            <span className="material-symbols-outlined text-[24px] text-slate-700 dark:text-[#d6d6d6]">restaurant_menu</span>
          </div>

          {/* Meal Highlight Visual Placeholder */}
          <div className="relative w-full h-40 rounded-lg overflow-hidden bg-white dark:bg-[#0a0a0a]">
            <img 
              alt="Bowl de pollo fitness gourmet" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOYOwBlFK-nzMQxIR43ITpFgsaULNCvZVinCJWJ56uhkPYQKP6VcmHC9ovAO6Xnv8Uely-JDMnkWhvGQPm-MCxAo26HNM7cdvfotqbFrpVm57rWBG0ADcHCxr-IbkKfKOhG6g2KsoNypaEnEonXMO9DoQe6v6kFMWC03y75tVe_szrhwvIvZ_YFiNMBfxB-YDbBrzbMaagThL2ZsYWMdT8F3dJvO4Duj2VGQTbwlbbyalZBgghJSWdAg"
            />
            <div className="absolute bottom-2 left-2 flex gap-1.5">
              <span className="bg-[#0a0a0a]/85 backdrop-blur-md text-slate-900 dark:text-white text-body-sm px-2.5 py-0.5 rounded font-bold border border-slate-200 dark:border-white/10">
                ≈ 42 g proteína
              </span>
              <span className="bg-[#0a0a0a]/85 backdrop-blur-md text-slate-900 dark:text-white text-body-sm px-2.5 py-0.5 rounded font-medium flex items-center gap-1 border border-slate-200 dark:border-white/10">
                <span className="material-symbols-outlined text-[13px]">timer</span> 15 min
              </span>
            </div>
          </div>

          <p className="font-body-sm text-body-sm text-slate-700 dark:text-[#d6d6d6] leading-relaxed">
            Combina el pollo salteado con cebolla y tomate en cubos sobre el arroz templado, coronado con clara/huevo poché para maximizar el aporte biológico de aminoácidos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowRecipeModal(true)}
              className="bg-white dark:bg-[#0a0a0a] hover:bg-[#545a5b] text-slate-900 dark:text-white font-body-md font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span>Ver receta guiada</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddRecipeModal(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-body-md font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] font-black">add_circle</span>
              <span>Crear Mi Plato (+30 XP)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowMealIdeas(true)}
            className="w-full bg-white dark:bg-[#0a0a0a] hover:bg-white dark:hover:bg-[#0a0a0a] text-slate-700 dark:text-[#d6d6d6] hover:text-slate-900 dark:hover:text-white font-body-sm font-black py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all border border-[#ffffff]/40 cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-900 dark:text-[#ffffff]">restaurant_menu</span>
            <span>Ver Catálogo Completo: +54 Ideas de Comida (Uruguay 🇺🇾 & Brasil 🇧🇷)</span>
          </button>
        </div>
      </div>

      {/* Daily Meal Intake Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-slate-900 dark:text-white font-bold">Registro Diario</h2>
          <span className="font-label-caps text-label-caps text-slate-700 dark:text-[#d6d6d6] font-bold">3 / 4 Ingestas</span>
        </div>

        {/* Grid de 2 columnas en móvil para las comidas del día */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Desayuno */}
          <div className="bg-white dark:bg-[#0a0a0a] hover:bg-white dark:hover:bg-[#0a0a0a] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between shadow-sm border border-slate-200 dark:border-white/10 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white dark:bg-[#0a0a0a] text-slate-700 dark:text-[#d6d6d6] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">wb_twilight</span>
                </div>
                <span className="bg-white dark:bg-[#0a0a0a] text-slate-500 dark:text-[#898a8c] font-label-caps text-[10px] px-1.5 py-0.5 rounded font-bold">
                  08:15
                </span>
              </div>
              <div>
                <span className="font-body-md text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                  Desayuno
                </span>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#898a8c] line-clamp-1 leading-snug">
                  Omelette de claras y avena
                </p>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black text-slate-700 dark:text-[#d6d6d6]">32g P</span>
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-[#898a8c] font-medium">480 kcal</span>
            </div>
          </div>

          {/* Almuerzo */}
          <div className="bg-white dark:bg-[#0a0a0a] hover:bg-white dark:hover:bg-[#0a0a0a] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between shadow-sm border border-slate-200 dark:border-white/10 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white dark:bg-[#0a0a0a] text-slate-700 dark:text-[#d6d6d6] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">sunny</span>
                </div>
                <span className="bg-white dark:bg-[#0a0a0a] text-slate-500 dark:text-[#898a8c] font-label-caps text-[10px] px-1.5 py-0.5 rounded font-bold">
                  13:30
                </span>
              </div>
              <div>
                <span className="font-body-md text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                  Almuerzo
                </span>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#898a8c] line-clamp-1 leading-snug">
                  Pechuga con batata asada
                </p>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black text-slate-700 dark:text-[#d6d6d6]">48g P</span>
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-[#898a8c] font-medium">690 kcal</span>
            </div>
          </div>

          {/* Merienda */}
          <div className="bg-white dark:bg-[#0a0a0a] hover:bg-white dark:hover:bg-[#0a0a0a] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between shadow-sm border border-slate-200 dark:border-white/10 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white dark:bg-[#0a0a0a] text-slate-700 dark:text-[#d6d6d6] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">bolt</span>
                </div>
                <span className="bg-white dark:bg-[#0a0a0a] text-slate-500 dark:text-[#898a8c] font-label-caps text-[10px] px-1.5 py-0.5 rounded font-bold">
                  17:10
                </span>
              </div>
              <div>
                <span className="font-body-md text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                  Merienda
                </span>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#898a8c] line-clamp-1 leading-snug">
                  Shake de proteína y nueces
                </p>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black text-slate-700 dark:text-[#d6d6d6]">30g P</span>
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-[#898a8c] font-medium">350 kcal</span>
            </div>
          </div>

          {/* Cena (Pendiente) */}
          <div className="bg-slate-50 dark:bg-[#0a0a0a]/70 hover:bg-white dark:hover:bg-[#0a0a0a] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between shadow-sm border border-dashed border-[#ffffff]/50 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white dark:bg-[#0a0a0a] text-slate-500 dark:text-[#898a8c] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">bedtime</span>
                </div>
                <span className="bg-[#ffffff]/20 text-slate-700 dark:text-[#d6d6d6] text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded uppercase font-extrabold">
                  Pendiente
                </span>
              </div>
              <div>
                <span className="font-body-md text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                  Cena
                </span>
                <p className="text-[11px] sm:text-xs text-slate-700 dark:text-[#d6d6d6] line-clamp-1 leading-snug">
                  Sugerencia: +22g proteína
                </p>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-[#898a8c]">Meta hoy</span>
              <button
                type="button"
                onClick={() =>
                  handleConfirmPredictiveEntry({ name: 'Cena sugerida', protein: 22, carbs: 0, fats: 0, calories: 22 * 4 })
                }
                className="bg-white dark:bg-[#0a0a0a] hover:bg-[#545a5b] text-slate-900 dark:text-white text-[11px] sm:text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center gap-0.5 font-bold active:scale-95 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>Cargar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Acciones Flotante Persistente */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-8 z-30 flex items-center gap-2 animate-fadeIn">
        <button
          type="button"
          onClick={() => setShowMealIdeas(true)}
          className="bg-white/95 dark:bg-[#0a0a0a]/95 hover:bg-white dark:hover:bg-[#0a0a0a] text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-full shadow-2xl border border-[#ffffff]/50 backdrop-blur-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] text-slate-700 dark:text-[#d6d6d6]">restaurant_menu</span>
          <span className="hidden sm:inline">Ideas de Comida</span>
          <span className="bg-[#ffffff]/30 text-slate-700 dark:text-[#d6d6d6] text-[10px] px-1.5 py-0.2 rounded-full font-black">54+</span>
        </button>

        <button
          type="button"
          onClick={() => setShowAddRecipeModal(true)}
          className="bg-gradient-to-r from-white dark:from-[#0a0a0a] via-slate-300 dark:via-[#545a5b] to-slate-300 dark:to-[#545a5b] hover:scale-105 text-slate-900 dark:text-white text-xs font-black px-4 py-2.5 rounded-full shadow-2xl border border-slate-400 dark:border-white/40 backdrop-blur-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ring-2 ring-slate-300 dark:ring-white/30"
        >
          <span className="material-symbols-outlined text-[20px] font-black">add_circle</span>
          <span>Crear Plato</span>
          <span className="bg-amber-400 text-black text-[10px] px-1.5 py-0.2 rounded-full font-black ml-0.5">+30 XP</span>
        </button>
      </div>

      {/* Modal de Receta Guiada Paso a Paso */}
      {showRecipeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-headline-lg text-slate-900 dark:text-white font-bold">Bowl de pollo alto en proteína</h3>
              <button 
                type="button" 
                onClick={() => setShowRecipeModal(false)}
                className="text-slate-500 dark:text-[#898a8c] hover:text-slate-900 dark:hover:text-white p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 font-body-md text-slate-700 dark:text-[#d6d6d6]">
              <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl flex justify-around text-center">
                <div>
                  <span className="text-slate-900 dark:text-white font-bold block">42g</span>
                  <span className="text-[11px] text-slate-500 dark:text-[#898a8c] uppercase">Proteína</span>
                </div>
                <div>
                  <span className="text-slate-900 dark:text-white font-bold block">480</span>
                  <span className="text-[11px] text-slate-500 dark:text-[#898a8c] uppercase">Calorías</span>
                </div>
                <div>
                  <span className="text-slate-900 dark:text-white font-bold block">15 min</span>
                  <span className="text-[11px] text-slate-500 dark:text-[#898a8c] uppercase">Preparación</span>
                </div>
              </div>

              {/* Alimentos con Fotos Reales */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-700 dark:text-[#d6d6d6] uppercase tracking-wider block">
                  Alimentos Reales del Plato:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Pechuga de pollo (180g)', query: 'pechuga de pollo' },
                    { name: 'Huevos / Claras (2 u)', query: 'huevo' },
                    { name: 'Arroz integral (150g)', query: 'arroz integral' },
                    { name: 'Tomate y Cebolla fresca', query: 'tomate' },
                  ].map((item, i) => {
                    const visual = getIngredientImage(item.query);
                    return (
                      <div key={i} className="flex items-center gap-2 bg-white dark:bg-[#0a0a0a] p-2 rounded-xl border border-slate-200 dark:border-white/10">
                        <img 
                          src={visual.image} 
                          alt={item.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-300 dark:border-[#545a5b]" 
                        />
                        <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                          {item.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <h4 className="text-slate-900 dark:text-white font-bold pt-2">Pasos guiados:</h4>
              <ol className="space-y-2 list-decimal list-inside text-sm">
                <li>Corta 180g de pechuga de pollo en cubos y saltea con gotas de aceite de oliva, orégano y sal baja en sodio.</li>
                <li>Pica tomate fresco y cebolla en cubos pequeños; calienta 150g de arroz integral como base en el bowl.</li>
                <li>Coloca un huevo o 2 claras al punto poché encima de la preparación para crear la salsa cremosa natural rica en aminoácidos.</li>
              </ol>
            </div>

            <button
              type="button"
              onClick={() => {
                handleConfirmPredictiveEntry({
                  name: 'Bowl de pollo alto en proteína',
                  protein: 42,
                  carbs: 0,
                  fats: 0,
                  calories: 480,
                });
                setShowRecipeModal(false);
              }}
              className="w-full bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-bold py-3 rounded-xl shadow-lg active:scale-95"
            >
              Marcar comida como consumida (+42g Prot)
            </button>
          </div>
        </div>
      )}

      {/* Catálogo de Ideas de Comida Completo (Uruguay 🇺🇾 & Brasil 🇧🇷) */}
      {showMealIdeas && (
        <MealIdeasCatalog
          onClose={() => setShowMealIdeas(false)}
          onLogMeal={(meal) => {
            handleConfirmPredictiveEntry({
              name: meal.name,
              protein: meal.protein,
              carbs: meal.carbs,
              fats: meal.fats,
              calories: meal.calories,
            });
          }}
        />
      )}

      {/* Modal para Crear Plato Directamente */}
      <AddRecipeModal
        isOpen={showAddRecipeModal}
        onClose={() => setShowAddRecipeModal(false)}
        onRecipeAdded={(recipe) => {
          setAddedSuccessMessage(`¡Plato "${recipe.name}" creado con éxito! +30 XP sumados a tu perfil.`);
          setTimeout(() => {
            setAddedSuccessMessage(null);
          }, 4000);
        }}
      />
    </div>
  );
};
