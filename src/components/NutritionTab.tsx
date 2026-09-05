import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { MacroNutrients } from '../types';

interface NutritionTabProps {
  hydration: number;
  onAddWater: () => void;
  onAddProtein: (amount: number) => void;
  onAddMealEntry?: (meal: {
    name: string;
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  }) => void;
  currentProtein: number;
  macros?: MacroNutrients;
  isDark?: boolean;
}

export const NutritionTab: React.FC<NutritionTabProps> = ({
  hydration,
  onAddWater,
  onAddProtein,
  onAddMealEntry,
  currentProtein,
  macros = { protein: currentProtein, carbs: 210, fats: 58, calories: 1920 },
  isDark = true,
}) => {
  const [activeFilter, setActiveFilter] = useState<'Más proteína' | 'Menos calorías' | 'Más rápido (<10m)'>('Más proteína');
  const [ingredients, setIngredients] = useState<string[]>(['Pollo', 'Huevos', 'Arroz', 'Tomate', 'Cebolla', 'Queso magro']);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [inputFoodText, setInputFoodText] = useState('Comí pollo con arroz y dos huevos');
  const [customInputOpen, setCustomInputOpen] = useState(false);
  const [addedSuccessMessage, setAddedSuccessMessage] = useState<string | null>(null);

  const effectiveProtein = macros.protein || currentProtein;
  const effectiveCarbs = macros.carbs || 210;
  const effectiveFats = macros.fats || 58;
  const effectiveCalories = macros.calories || 1920;

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
        color: '#2563eb', // Azul MAXFORM
        target: 150,
      },
      {
        name: 'Carbohidratos',
        grams: effectiveCarbs,
        calories: carbsKcal,
        pct: Math.round((carbsKcal / totalCalcKcal) * 100),
        color: '#10b981', // Verde Esmeralda
        target: 280,
      },
      {
        name: 'Grasas',
        grams: effectiveFats,
        calories: fatsKcal,
        pct: Math.round((fatsKcal / totalCalcKcal) * 100),
        color: '#f59e0b', // Ámbar Dorado
        target: 75,
      },
    ];
  }, [effectiveProtein, effectiveCarbs, effectiveFats]);

  const removeIngredient = (ing: string) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const addIngredientPrompt = () => {
    const ing = prompt('Escribe el ingrediente que tienes en tu heladera:');
    if (ing && ing.trim()) {
      setIngredients([...ingredients, ing.trim()]);
    }
  };

  const handleConfirmPredictiveEntry = (customMeal?: {
    name: string;
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  }) => {
    const meal = customMeal || {
      name: inputFoodText || 'Pollo con arroz y huevos',
      protein: 24,
      carbs: 35,
      fats: 10,
      calories: 330,
    };

    if (onAddMealEntry) {
      onAddMealEntry(meal);
    } else {
      onAddProtein(meal.protein);
    }

    setAddedSuccessMessage(`¡Comida registrada con éxito! +${meal.protein}g Proteína, +${meal.carbs}g Carbos y +${meal.fats}g Grasas sumadas al gráfico de macros.`);
    setTimeout(() => {
      setAddedSuccessMessage(null);
    }, 4500);
  };

  const maxProtein = 150;
  const proteinPct = Math.min(100, Math.round((effectiveProtein / maxProtein) * 100));
  const missingProtein = Math.max(0, maxProtein - effectiveProtein);

  return (
    <div className="flex flex-col w-full px-4 space-y-5 max-w-[1280px] mx-auto pb-24">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="font-label-caps text-label-caps text-[#adc6ff] tracking-wider uppercase block font-bold">
            Optimización Metabólica
          </span>
          <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-white font-bold">
            Nutrición y Comidas
          </h1>
        </div>

        {/* Date Switcher Pill */}
        <div className="flex items-center bg-[#282a2f] rounded-full px-3 py-1 gap-1 shadow-sm border border-[#333539]">
          <button aria-label="Día anterior" className="text-[#8d90a0] hover:text-white transition-colors flex items-center justify-center p-0.5">
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <div className="flex items-center gap-1.5 px-1">
            <span className="material-symbols-outlined text-[16px] text-[#b4c5ff]">calendar_today</span>
            <span className="font-label-caps text-label-caps text-white whitespace-nowrap font-bold">Hoy, 24 Oct</span>
          </div>
          <button aria-label="Día siguiente" className="text-[#8d90a0] hover:text-white transition-colors flex items-center justify-center p-0.5">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      {addedSuccessMessage && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-body-sm flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{addedSuccessMessage}</span>
        </div>
      )}

      {/* Telemetry Overview: Caloric Core & Target Balance */}
      <div className="bg-[#1d2024] rounded-xl p-5 shadow-md relative overflow-hidden border border-[#282a2f]">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="font-label-caps text-label-caps text-[#8d90a0] uppercase tracking-widest block font-bold">
              Balance Energético Diario
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-metric-stat text-metric-stat text-white font-extrabold tracking-tight">
                {effectiveCalories.toLocaleString('es-ES')}
              </span>
              <span className="font-body-sm text-body-sm text-[#8d90a0]">/ 2.300 kcal</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="bg-[#2563eb]/20 text-[#b4c5ff] font-label-caps text-label-caps px-2 py-0.5 rounded-full border border-[#2563eb]/30 font-bold">
              {Math.min(100, Math.round((effectiveCalories / 2300) * 100))}% COMPLETADO
            </span>
            <span className="font-body-sm text-body-sm text-[#8d90a0] mt-1">
              Restante: {Math.max(0, 2300 - effectiveCalories)} kcal
            </span>
          </div>
        </div>

        {/* Main Calorie Bar */}
        <div className="w-full bg-[#0c0e12] h-2 rounded-full overflow-hidden mb-4">
          <div
            className="bg-[#2563eb] h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (effectiveCalories / 2300) * 100)}%` }}
          ></div>
        </div>

        {/* Gráfico de Dona Dinámico de Macros */}
        <div className="my-4 p-4 rounded-xl bg-[#16181d] border border-[#282a2f] flex flex-col md:flex-row items-center justify-between gap-4">
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
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#191c20" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any, item: any) => [
                      `${item.payload.grams}g (${value} kcal) · ${item.payload.pct}% del total`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: '#191c20',
                      borderColor: '#282a2f',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Centro de la dona */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold tracking-widest text-[#8d90a0] uppercase">
                  CALORÍAS
                </span>
                <span className="text-xl sm:text-2xl font-black text-white">
                  {effectiveCalories}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  kcal hoy
                </span>
              </div>
            </div>
            <span className="text-xs text-[#8d90a0] mt-1 text-center">
              Distribución calculada dinámicamente con IA
            </span>
          </div>

          {/* Leyenda y desglose de macros del gráfico de dona */}
          <div className="w-full md:w-1/2 space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#282a2f]">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Distribución de Macros
              </span>
              <span className="text-[11px] text-[#8d90a0]">
                Actualizado en tiempo real
              </span>
            </div>

            {macroChartData.map((macro) => (
              <div
                key={macro.name}
                className="p-2.5 rounded-lg bg-[#191c20] border border-[#282a2f] flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: macro.color }}
                  ></span>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {macro.name}
                    </span>
                    <span className="text-[10px] text-[#8d90a0]">
                      Meta: {macro.target}g
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-white block">
                    {macro.grams}g <span className="text-[#8d90a0]">({macro.pct}%)</span>
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
          <div className="bg-[#191c20] rounded-lg p-3 border border-[#282a2f]">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span>
                <span className="font-label-caps text-label-caps text-white font-bold">PROTEÍNA</span>
              </div>
              <span className="font-label-caps text-label-caps text-[#b4c5ff] font-bold">
                {missingProtein === 0 ? '¡Completada!' : `Faltan ${missingProtein} g`}
              </span>
            </div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-headline-md text-headline-md text-white font-bold">
                {effectiveProtein} <span className="font-body-sm text-body-sm text-[#8d90a0]">/ 150 g</span>
              </span>
              <span className="font-body-sm text-body-sm text-[#8d90a0] font-medium">{proteinPct}%</span>
            </div>
            <div className="w-full bg-[#0c0e12] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#2563eb] h-full rounded-full transition-all duration-500" style={{ width: `${proteinPct}%` }}></div>
            </div>
          </div>

          {/* Carbohidratos */}
          <div className="bg-[#191c20] rounded-lg p-3 border border-[#282a2f]">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                <span className="font-label-caps text-label-caps text-white font-bold">CARBOS</span>
              </div>
              <span className="font-body-sm text-body-sm text-[#8d90a0]">Meta: 280 g</span>
            </div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-headline-md text-headline-md text-white font-bold">
                {effectiveCarbs} <span className="font-body-sm text-body-sm text-[#8d90a0]">/ 280 g</span>
              </span>
              <span className="font-body-sm text-body-sm text-[#8d90a0]">
                {Math.min(100, Math.round((effectiveCarbs / 280) * 100))}%
              </span>
            </div>
            <div className="w-full bg-[#0c0e12] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#10b981] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (effectiveCarbs / 280) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Grasas */}
          <div className="bg-[#191c20] rounded-lg p-3 border border-[#282a2f]">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                <span className="font-label-caps text-label-caps text-white font-bold">GRASAS SALUDABLES</span>
              </div>
              <span className="font-body-sm text-body-sm text-[#8d90a0]">Meta: 75 g</span>
            </div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-headline-md text-headline-md text-white font-bold">
                {effectiveFats} <span className="font-body-sm text-body-sm text-[#8d90a0]">/ 75 g</span>
              </span>
              <span className="font-body-sm text-body-sm text-[#8d90a0]">
                {Math.min(100, Math.round((effectiveFats / 75) * 100))}%
              </span>
            </div>
            <div className="w-full bg-[#0c0e12] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#f59e0b] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (effectiveFats / 75) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Hidratación */}
          <div className="bg-[#191c20] rounded-lg p-3 border border-[#282a2f]">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#b4c5ff]">water_drop</span>
                <span className="font-label-caps text-label-caps text-white font-bold">HIDRATACIÓN</span>
              </div>
              <button 
                type="button"
                onClick={onAddWater}
                className="font-label-caps text-label-caps text-[#b4c5ff] hover:underline font-bold"
              >
                +250 ml
              </button>
            </div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-headline-md text-headline-md text-white font-bold">
                {hydration.toFixed(1).replace('.', ',')} <span className="font-body-sm text-body-sm text-[#8d90a0]">/ 3.0 L</span>
              </span>
              <span className="font-body-sm text-body-sm text-[#8d90a0]">
                {Math.min(100, Math.round((hydration / 3.0) * 100))}%
              </span>
            </div>
            <div className="w-full bg-[#0c0e12] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#2563eb] h-full rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(100, (hydration / 3.0) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Logging Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-white font-bold">Registro Rápido</h2>
          <span className="font-label-caps text-label-caps text-[#8d90a0] uppercase font-bold">Potenciado por MAX AI</span>
        </div>

        {/* Dual Action Triggers */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={() => setCustomInputOpen(!customInputOpen)}
            className="bg-[#282a2f] hover:bg-[#37393e] active:scale-[0.98] transition-all p-4 rounded-xl text-left flex flex-col justify-between h-28 shadow-sm border border-[#333539]"
          >
            <div className="w-8 h-8 rounded-lg bg-[#2563eb]/20 text-[#b4c5ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">edit_note</span>
            </div>
            <div>
              <span className="font-body-md text-body-md font-bold text-white block">Escribir comida</span>
              <span className="font-body-sm text-body-sm text-[#8d90a0]">Voz o texto libre</span>
            </div>
          </button>

          <label className="bg-[#282a2f] hover:bg-[#37393e] active:scale-[0.98] transition-all p-4 rounded-xl text-left flex flex-col justify-between h-28 shadow-sm border border-[#333539] cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[#0566d9]/30 text-[#adc6ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            </div>
            <div>
              <span className="font-body-md text-body-md font-bold text-white block">Analizar foto</span>
              <span className="font-body-sm text-body-sm text-[#8d90a0]">Visión artificial AI</span>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  alert('¡Foto de plato recibida! MAX AI está analizando los macronutrientes...');
                  setTimeout(() => {
                    handleConfirmPredictiveEntry();
                  }, 1500);
                }
              }} 
            />
          </label>
        </div>

        {/* Interactive Simulated Natural Language Parser */}
        <div className="bg-[#1d2024] rounded-xl p-4 shadow-md space-y-3 border border-[#282a2f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#b4c5ff]">auto_awesome</span>
              <span className="font-label-caps text-label-caps text-white uppercase font-bold">Demostración predictiva</span>
            </div>
            <span className="font-body-sm text-body-sm text-[#8d90a0]">Tiempo real</span>
          </div>

          {/* Natural text prompt mockup */}
          <div className="bg-[#0c0e12] p-3 rounded-lg flex items-center gap-2 border border-[#282a2f]">
            <span className="material-symbols-outlined text-[20px] text-[#8d90a0]">keyboard</span>
            <input 
              type="text" 
              value={inputFoodText}
              onChange={(e) => setInputFoodText(e.target.value)}
              className="bg-transparent text-white font-body-md w-full focus:outline-none italic"
            />
          </div>

          {/* MAX AI Breakdown Preview */}
          <div className="bg-[#191c20] rounded-lg p-3 space-y-2 border border-[#282a2f]">
            <div className="flex justify-between items-center pb-1 border-b border-[#282a2f]">
              <span className="font-label-caps text-label-caps text-[#adc6ff] uppercase tracking-wider font-bold">
                Desglose calculado
              </span>
              <span className="font-body-sm text-body-sm text-[#8d90a0]">Valores nutricionales estimados</span>
            </div>

            <div className="divide-y divide-[#333539]/40 space-y-1">
              <div className="flex justify-between items-center pt-1 text-white">
                <span className="font-body-sm text-body-sm font-semibold">Pechuga de pollo (180g)</span>
                <span className="font-body-sm text-body-sm text-[#b4c5ff] font-bold">41g Proteína</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-white">
                <span className="font-body-sm text-body-sm font-semibold">Arroz integral cocido (150g)</span>
                <span className="font-body-sm text-body-sm text-[#adc6ff] font-bold">36g Carbos</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-white">
                <span className="font-body-sm text-body-sm font-semibold">2 Huevos camperos enteros</span>
                <span className="font-body-sm text-body-sm text-[#b0c6fc] font-bold">13g Proteína · 10g Grasa</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  handleConfirmPredictiveEntry({
                    name: inputFoodText || 'Pechuga con arroz y huevos camperos',
                    protein: 54,
                    carbs: 36,
                    fats: 10,
                    calories: 450,
                  })
                }
                className="w-full bg-[#2563eb] hover:bg-[#3b82f6] text-white font-body-md font-bold py-2.5 rounded-lg text-center transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add_task</span>
                <span>Confirmar y registrar en Dona de Macros (+54g P · +36g C · +10g G)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature: "¿Qué tengo para comer? (Refrigerador AI)" */}
      <div className="bg-[#1d2024] rounded-xl p-5 shadow-md space-y-4 relative overflow-hidden border border-[#282a2f]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2563eb]/20 text-[#b4c5ff]">
              <span className="material-symbols-outlined text-[16px]">kitchen</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-white font-bold">¿Qué tengo para comer?</h2>
          </div>
          <p className="font-body-sm text-body-sm text-[#8d90a0]">
            Mostrale a MAX AI lo que tenés en tu heladera o alacena y encontrá algo óptimo para tus metas.
          </p>
        </div>

        {/* Detected Ingredient Chips */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-label-caps text-label-caps text-white uppercase font-bold">Ingredientes escaneados</span>
            <button 
              type="button"
              onClick={addIngredientPrompt}
              className="font-label-caps text-label-caps text-[#b4c5ff] hover:underline flex items-center gap-1 font-bold"
            >
              <span className="material-symbols-outlined text-[14px]">add</span> Añadir ingrediente
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing) => (
              <span 
                key={ing} 
                className="inline-flex items-center gap-1.5 bg-[#282a2f] text-white px-3 py-1 rounded-full text-body-sm font-medium border border-[#333539]"
              >
                {ing}
                <button 
                  type="button"
                  onClick={() => removeIngredient(ing)}
                  className="material-symbols-outlined text-[14px] text-[#8d90a0] hover:text-white cursor-pointer"
                >
                  close
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Quick Adjustment Pills */}
        <div className="space-y-1.5">
          <span className="font-label-caps text-label-caps text-[#8d90a0] uppercase block font-bold">Filtrar combinación</span>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(['Más proteína', 'Menos calorías', 'Más rápido (<10m)'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-full font-label-caps text-label-caps whitespace-nowrap transition-all ${
                  activeFilter === filter 
                    ? 'bg-[#2563eb] text-white font-bold shadow-sm' 
                    : 'bg-[#282a2f] text-[#8d90a0] hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* AI Chef Card Recommendation */}
        <div className="bg-[#191c20] rounded-xl p-4 relative space-y-3 shadow-sm border border-[#282a2f]">
          <div className="flex justify-between items-start">
            <div>
              <span className="bg-[#0566d9]/20 text-[#adc6ff] font-label-caps text-label-caps px-2 py-0.5 rounded-full inline-block mb-1 border border-[#0566d9]/30 font-bold">
                Recomendación Activa
              </span>
              <h3 className="font-headline-md text-headline-md text-white font-bold">Bowl de pollo alto en proteína</h3>
            </div>
            <span className="material-symbols-outlined text-[24px] text-[#b4c5ff]">restaurant_menu</span>
          </div>

          {/* Meal Highlight Visual Placeholder */}
          <div className="relative w-full h-40 rounded-lg overflow-hidden bg-[#282a2f]">
            <img 
              alt="Bowl de pollo fitness gourmet" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOYOwBlFK-nzMQxIR43ITpFgsaULNCvZVinCJWJ56uhkPYQKP6VcmHC9ovAO6Xnv8Uely-JDMnkWhvGQPm-MCxAo26HNM7cdvfotqbFrpVm57rWBG0ADcHCxr-IbkKfKOhG6g2KsoNypaEnEonXMO9DoQe6v6kFMWC03y75tVe_szrhwvIvZ_YFiNMBfxB-YDbBrzbMaagThL2ZsYWMdT8F3dJvO4Duj2VGQTbwlbbyalZBgghJSWdAg"
            />
            <div className="absolute bottom-2 left-2 flex gap-1.5">
              <span className="bg-[#0c0e12]/85 backdrop-blur-md text-white text-body-sm px-2.5 py-0.5 rounded font-bold border border-[#282a2f]">
                ≈ 42 g proteína
              </span>
              <span className="bg-[#0c0e12]/85 backdrop-blur-md text-white text-body-sm px-2.5 py-0.5 rounded font-medium flex items-center gap-1 border border-[#282a2f]">
                <span className="material-symbols-outlined text-[13px]">timer</span> 15 min
              </span>
            </div>
          </div>

          <p className="font-body-sm text-body-sm text-[#c3c6d7] leading-relaxed">
            Combina el pollo salteado con cebolla y tomate en cubos sobre el arroz templado, coronado con clara/huevo poché para maximizar el aporte biológico de aminoácidos.
          </p>

          <button
            type="button"
            onClick={() => setShowRecipeModal(true)}
            className="w-full bg-[#2563eb] hover:bg-[#3b82f6] text-white font-body-md font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <span>Ver receta guiada paso a paso</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Daily Meal Intake Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-white font-bold">Registro Diario</h2>
          <span className="font-label-caps text-label-caps text-[#b4c5ff] font-bold">3 / 4 Ingestas</span>
        </div>

        <div className="space-y-2">
          {/* Desayuno */}
          <div className="bg-[#1d2024] rounded-xl p-4 flex items-center justify-between shadow-sm border border-[#282a2f]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#282a2f] text-[#b4c5ff] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">wb_twilight</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-body-md text-body-md font-bold text-white">Desayuno</span>
                  <span className="bg-[#282a2f] text-[#8d90a0] font-label-caps text-label-caps px-1.5 py-0.5 rounded">08:15</span>
                </div>
                <p className="font-body-sm text-body-sm text-[#8d90a0]">Omelette de 3 claras y avena</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-body-md text-body-md font-bold text-[#b4c5ff] block">32g P</span>
              <span className="font-label-caps text-label-caps text-[#8d90a0]">480 kcal</span>
            </div>
          </div>

          {/* Almuerzo */}
          <div className="bg-[#1d2024] rounded-xl p-4 flex items-center justify-between shadow-sm border border-[#282a2f]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#282a2f] text-[#b4c5ff] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">sunny</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-body-md text-body-md font-bold text-white">Almuerzo</span>
                  <span className="bg-[#282a2f] text-[#8d90a0] font-label-caps text-label-caps px-1.5 py-0.5 rounded">13:30</span>
                </div>
                <p className="font-body-sm text-body-sm text-[#8d90a0]">Pechuga con batata asada</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-body-md text-body-md font-bold text-[#b4c5ff] block">48g P</span>
              <span className="font-label-caps text-label-caps text-[#8d90a0]">690 kcal</span>
            </div>
          </div>

          {/* Merienda */}
          <div className="bg-[#1d2024] rounded-xl p-4 flex items-center justify-between shadow-sm border border-[#282a2f]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#282a2f] text-[#b4c5ff] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-body-md text-body-md font-bold text-white">Merienda</span>
                  <span className="bg-[#282a2f] text-[#8d90a0] font-label-caps text-label-caps px-1.5 py-0.5 rounded">17:10</span>
                </div>
                <p className="font-body-sm text-body-sm text-[#8d90a0]">Shake de proteína y frutos secos</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-body-md text-body-md font-bold text-[#b4c5ff] block">30g P</span>
              <span className="font-label-caps text-label-caps text-[#8d90a0]">350 kcal</span>
            </div>
          </div>

          {/* Cena (Pendiente) */}
          <div className="bg-[#282a2f]/60 rounded-xl p-4 flex items-center justify-between shadow-sm border border-[#333539]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0c0e12] text-[#8d90a0] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">bedtime</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-body-md text-body-md font-bold text-white">Cena</span>
                  <span className="bg-[#2563eb]/20 text-[#b4c5ff] font-label-caps text-label-caps px-2 py-0.5 rounded uppercase font-bold">
                    Pendiente
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-[#b4c5ff]">Sugerencia AI: Completar 22g de proteína</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmPredictiveEntry}
              className="bg-[#1d2024] hover:bg-[#37393e] text-white font-label-caps text-label-caps px-3 py-2 rounded-lg transition-colors flex items-center gap-1 border border-[#282a2f] font-bold active:scale-95"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Cargar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Receta Guiada Paso a Paso */}
      {showRecipeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#191c20] rounded-2xl max-w-md w-full p-6 border border-[#282a2f] shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-headline-lg text-white font-bold">Bowl de pollo alto en proteína</h3>
              <button 
                type="button" 
                onClick={() => setShowRecipeModal(false)}
                className="text-[#8d90a0] hover:text-white p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 font-body-md text-[#c3c6d7]">
              <div className="p-3 bg-[#1d2024] rounded-xl flex justify-around text-center">
                <div>
                  <span className="text-white font-bold block">42g</span>
                  <span className="text-[11px] text-[#8d90a0] uppercase">Proteína</span>
                </div>
                <div>
                  <span className="text-white font-bold block">480</span>
                  <span className="text-[11px] text-[#8d90a0] uppercase">Calorías</span>
                </div>
                <div>
                  <span className="text-white font-bold block">15 min</span>
                  <span className="text-[11px] text-[#8d90a0] uppercase">Preparación</span>
                </div>
              </div>

              <h4 className="text-white font-bold pt-2">Pasos guiados:</h4>
              <ol className="space-y-2 list-decimal list-inside text-sm">
                <li>Corta 180g de pechuga de pollo en cubos y saltea con gotas de aceite de oliva, orégano y sal baja en sodio.</li>
                <li>Pica tomate fresco y cebolla en cubos pequeños; calienta 150g de arroz integral como base en el bowl.</li>
                <li>Coloca un huevo o 2 claras al punto poché encima de la preparación para crear la salsa cremosa natural rica en aminoácidos.</li>
              </ol>
            </div>

            <button
              type="button"
              onClick={() => {
                handleConfirmPredictiveEntry();
                setShowRecipeModal(false);
              }}
              className="w-full bg-[#2563eb] text-white font-bold py-3 rounded-xl shadow-lg active:scale-95"
            >
              Marcar comida como consumida (+42g Prot)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
