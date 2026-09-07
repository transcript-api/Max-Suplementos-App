import React, { useState } from 'react';
import { RecipeItem } from '../data/recipesDatabase';
import { getIngredientImage } from '../data/ingredientImages';

interface RecipeDetailModalProps {
  recipe: RecipeItem | null;
  onClose: () => void;
  onLogMeal: (meal: {
    name: string;
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
    xpReward?: number;
  }) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  onLogMeal,
}) => {
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [loggedSuccess, setLoggedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'ingredientes' | 'pasos' | 'macros'>('ingredientes');
  const [ingredientCategoryFilter, setIngredientCategoryFilter] = useState<string>('all');

  if (!recipe) return null;

  const currentProtein = Math.round(recipe.protein * portionMultiplier);
  const currentCalories = Math.round(recipe.calories * portionMultiplier);
  const currentCarbs = Math.round(recipe.carbs * portionMultiplier);
  const currentFats = Math.round(recipe.fats * portionMultiplier);

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const totalIngredients = recipe.ingredients.length;
  const checkedCount = Object.values(checkedIngredients).filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / totalIngredients) * 100);

  const markAllIngredients = (value: boolean) => {
    const updated: Record<number, boolean> = {};
    recipe.ingredients.forEach((_, idx) => {
      updated[idx] = value;
    });
    setCheckedIngredients(updated);
  };

  const handleLogToDaily = () => {
    onLogMeal({
      name: `${recipe.name} (${portionMultiplier}x)`,
      protein: currentProtein,
      carbs: currentCarbs,
      fats: currentFats,
      calories: currentCalories,
      xpReward: recipe.xpReward,
    });
    setLoggedSuccess(true);
    setTimeout(() => {
      setLoggedSuccess(false);
      onClose();
    }, 1800);
  };

  const categoryMeta: Record<string, { label: string; icon: string; badgeClass: string }> = {
    proteina: {
      label: 'Proteína',
      icon: 'fitness_center',
      badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    },
    carbohidrato: {
      label: 'Carbohidrato',
      icon: 'grain',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    vegetal: {
      label: 'Vegetal & Fibra',
      icon: 'eco',
      badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    },
    grasa_saludable: {
      label: 'Grasa Sana',
      icon: 'water_drop',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    condimento: {
      label: 'Sazón & Especia',
      icon: 'spa',
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-[#16181d] border border-[#282a2f] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative my-auto max-h-[92vh] flex flex-col text-white">
        {/* Header con imagen del plato */}
        <div className="relative w-full h-56 sm:h-64 bg-[#212429] flex-shrink-0">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback si la imagen no carga
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#16181d] via-[#16181d]/50 to-transparent" />

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all active:scale-95 z-10"
            aria-label="Cerrar ficha"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          {/* Badges superiores */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
              <span className="text-base">{recipe.flag}</span>
              <span>{recipe.countryLabel}</span>
            </span>
            <span className="bg-[#2563eb]/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full border border-blue-400/30 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">stars</span>
              <span>+{recipe.xpReward} XP</span>
            </span>
          </div>

          {/* Info sobre la imagen en la parte inferior */}
          <div className="absolute bottom-3 left-4 right-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#adc6ff] bg-[#2563eb]/20 px-2 py-0.5 rounded border border-[#2563eb]/40 inline-block mb-1">
              {recipe.goalLabel} · {recipe.categoryLabel}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-sm">
              {recipe.name}
            </h2>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar">
          {/* Descripción cultural y fitness */}
          <p className="text-sm text-[#c3c6d7] leading-relaxed">
            {recipe.description}
          </p>

          {/* Selector de porciones interactivo */}
          <div className="bg-[#1d2024] p-3.5 rounded-xl border border-[#282a2f] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8d90a0] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#adc6ff]">scale</span>
                Ajustar Porción
              </span>
              <span className="text-xs font-extrabold text-[#adc6ff] bg-[#2563eb]/20 px-2 py-0.5 rounded border border-[#2563eb]/30">
                Multiplicador: {portionMultiplier}x
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { label: '0.75x Snack', value: 0.75 },
                { label: '1x Estándar', value: 1 },
                { label: '1.5x Volumen', value: 1.5 },
                { label: '2x Doble', value: 2 },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPortionMultiplier(p.value)}
                  className={`py-1.5 px-1 text-xs font-bold rounded-lg transition-all text-center ${
                    portionMultiplier === p.value
                      ? 'bg-[#2563eb] text-white shadow-md'
                      : 'bg-[#282a2f] text-[#8d90a0] hover:text-white hover:bg-[#333539]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Panel de Macros recalculados */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-[#191c20] p-3 rounded-xl border border-[#2563eb]/40 text-center">
              <span className="text-[10px] font-bold text-[#adc6ff] uppercase tracking-wider block">
                Proteína
              </span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">
                {currentProtein}g
              </span>
              <span className="text-[10px] text-blue-400 font-semibold block">
                {Math.round(currentProtein * 4)} kcal
              </span>
            </div>

            <div className="bg-[#191c20] p-3 rounded-xl border border-emerald-500/30 text-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Calorías
              </span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">
                {currentCalories}
              </span>
              <span className="text-[10px] text-[#8d90a0] font-semibold block">
                Energía
              </span>
            </div>

            <div className="bg-[#191c20] p-3 rounded-xl border border-emerald-500/20 text-center">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                Carbos
              </span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">
                {currentCarbs}g
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold block">
                {Math.round(currentCarbs * 4)} kcal
              </span>
            </div>

            <div className="bg-[#191c20] p-3 rounded-xl border border-amber-500/20 text-center">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Grasas
              </span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">
                {currentFats}g
              </span>
              <span className="text-[10px] text-amber-400 font-semibold block">
                {Math.round(currentFats * 9)} kcal
              </span>
            </div>
          </div>

          {/* Datos rápidos: Tiempo y Dificultad */}
          <div className="flex items-center justify-around py-2 px-3 bg-[#1d2024] rounded-xl border border-[#282a2f] text-xs text-[#8d90a0]">
            <span className="flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[16px] text-[#adc6ff]">timer</span>
              Tiempo: <strong className="text-white">{recipe.prepTimeMinutes} min</strong>
            </span>
            <span className="w-px h-4 bg-[#333539]" />
            <span className="flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[16px] text-[#adc6ff]">speed</span>
              Dificultad: <strong className="text-white">{recipe.difficulty}</strong>
            </span>
            <span className="w-px h-4 bg-[#333539]" />
            <span className="flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
              Fitness Auténtico
            </span>
          </div>

          {/* Selector de Pestañas Principal */}
          <div className="flex bg-[#191c20] p-1 rounded-xl border border-[#282a2f] gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('ingredientes')}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ingredientes'
                  ? 'bg-[#2563eb] text-white shadow-md'
                  : 'text-[#8d90a0] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">shopping_basket</span>
              <span>Ingredientes ({totalIngredients})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pasos')}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'pasos'
                  ? 'bg-[#2563eb] text-white shadow-md'
                  : 'text-[#8d90a0] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">skillet</span>
              <span>Preparación</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('macros')}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'macros'
                  ? 'bg-[#2563eb] text-white shadow-md'
                  : 'text-[#8d90a0] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">insights</span>
              <span>Nutrición & Tip</span>
            </button>
          </div>

          {/* TAB 1: INGREDIENTES BIEN ORGANIZADOS Y CON FOTOS */}
          {activeTab === 'ingredientes' && (
            <div className="space-y-3.5">
              {/* Barra de Progreso y Gamificación de Ingredientes */}
              <div className="bg-[#191c20] p-3 rounded-xl border border-[#282a2f] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-400">inventory_2</span>
                    <span className="font-bold text-white">Ingredientes en tu Cocina</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-emerald-400">
                      {checkedCount} de {totalIngredients} listos ({progressPercent}%)
                    </span>
                    <button
                      type="button"
                      onClick={() => markAllIngredients(checkedCount !== totalIngredients)}
                      className="text-[11px] text-[#adc6ff] hover:underline font-semibold"
                    >
                      {checkedCount === totalIngredients ? 'Desmarcar' : 'Marcar todos'}
                    </button>
                  </div>
                </div>

                <div className="w-full bg-[#0c0e12] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Filtro por Categoría Nutricional */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'proteina', label: '🥩 Proteínas' },
                  { id: 'carbohidrato', label: '🥔 Carbohidratos' },
                  { id: 'vegetal', label: '🥗 Vegetales' },
                  { id: 'grasa_saludable', label: '🫒 Grasas Sanas' },
                  { id: 'condimento', label: '🌿 Sazones' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setIngredientCategoryFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                      ingredientCategoryFilter === tab.id
                        ? 'bg-[#2563eb]/30 text-[#adc6ff] border border-[#2563eb]/50'
                        : 'bg-[#14161a] text-[#8d90a0] hover:text-white border border-[#282a2f]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Grid de Tarjetas de Ingredientes Bonitos y Organizados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {recipe.ingredients
                  .filter((ing) => {
                    if (ingredientCategoryFilter === 'all') return true;
                    const visual = getIngredientImage(ing.name);
                    return visual.category === ingredientCategoryFilter;
                  })
                  .map((ing) => {
                    const originalIndex = recipe.ingredients.findIndex((i) => i.name === ing.name);
                    const isChecked = !!checkedIngredients[originalIndex];
                    const visual = getIngredientImage(ing.name);
                    const meta = categoryMeta[visual.category] || categoryMeta.vegetal;

                    return (
                      <div
                        key={originalIndex}
                        onClick={() => toggleIngredient(originalIndex)}
                        className={`rounded-xl border p-2.5 sm:p-3 flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 select-none ${
                          isChecked
                            ? 'bg-[#121417] border-emerald-500/30 opacity-75'
                            : 'bg-[#191c20] hover:bg-[#1f2228] border-[#282a2f] hover:border-[#2563eb]/40 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Checkbox circular */}
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all flex-shrink-0 ${
                              isChecked
                                ? 'bg-emerald-500 border-emerald-500 text-black'
                                : 'border-[#424750] bg-[#16181d]'
                            }`}
                          >
                            {isChecked && (
                              <span className="material-symbols-outlined text-[13px] font-black">check</span>
                            )}
                          </div>

                          {/* Foto real del ingrediente */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[#333539] bg-[#212429] relative shadow-inner">
                            <img
                              src={visual.image}
                              alt={ing.name}
                              className={`w-full h-full object-cover transition-transform duration-200 ${
                                isChecked ? 'grayscale opacity-60' : 'hover:scale-105'
                              }`}
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300&auto=format&fit=crop&q=80';
                              }}
                            />
                          </div>

                          {/* Textos del Ingrediente */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span
                                className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded border flex items-center gap-0.5 ${meta.badgeClass}`}
                              >
                                <span className="material-symbols-outlined text-[10px]">{meta.icon}</span>
                                <span>{meta.label}</span>
                              </span>
                            </div>
                            <h4
                              className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                                isChecked ? 'line-through text-[#8d90a0]' : 'text-white'
                              }`}
                            >
                              {ing.name}
                            </h4>
                          </div>
                        </div>

                        {/* Cantidad exacta de la porción */}
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-xs font-black text-[#adc6ff] bg-[#2563eb]/15 px-2 py-1 rounded-lg border border-[#2563eb]/30 whitespace-nowrap">
                            {ing.quantity}
                          </span>
                          {portionMultiplier !== 1 && (
                            <span className="text-[9px] text-[#8d90a0] mt-0.5">
                              x{portionMultiplier} porción
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Nota de pie de ingredientes */}
              <div className="flex items-center gap-2 p-2.5 bg-[#14161a] rounded-xl border border-[#282a2f] text-[11px] text-[#8d90a0]">
                <span className="material-symbols-outlined text-[16px] text-[#adc6ff]">verified</span>
                <span>
                  Cantidades calculadas para atletas de alto rendimiento con ingredientes frescos.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: PREPARACIÓN PASO A PASO */}
          {activeTab === 'pasos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#adc6ff]">skillet</span>
                  Instrucciones de Cocción ({recipe.instructions.length} pasos)
                </h3>
                <span className="text-xs font-bold text-[#adc6ff] bg-[#2563eb]/20 px-2 py-0.5 rounded border border-[#2563eb]/30">
                  {recipe.prepTimeMinutes} min totales
                </span>
              </div>

              <div className="space-y-2.5">
                {recipe.instructions.map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-[#191c20] p-3.5 rounded-xl border border-[#282a2f] hover:border-[#2563eb]/40 transition-all flex items-start gap-3.5"
                  >
                    <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                      {idx + 1}
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs sm:text-sm text-[#e0e2ed] leading-relaxed">
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MACROS & TIP NUTRICIONAL */}
          {activeTab === 'macros' && (
            <div className="space-y-3.5">
              {/* Tarjeta de Resumen Macronutricional */}
              <div className="bg-[#191c20] p-4 rounded-xl border border-[#282a2f] space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#adc6ff] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">pie_chart</span>
                  Distribución Calórica y Macronutrientes
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-[#14161a] p-2.5 rounded-xl border border-blue-500/20 text-center">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                      Proteína
                    </span>
                    <strong className="text-lg font-black text-white block mt-0.5">
                      {currentProtein}g
                    </strong>
                    <span className="text-[10px] text-blue-400/80">
                      {Math.round(currentProtein * 4)} kcal ({Math.round(((currentProtein * 4) / (currentCalories || 1)) * 100)}%)
                    </span>
                  </div>

                  <div className="bg-[#14161a] p-2.5 rounded-xl border border-emerald-500/20 text-center">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Carbohidratos
                    </span>
                    <strong className="text-lg font-black text-white block mt-0.5">
                      {currentCarbs}g
                    </strong>
                    <span className="text-[10px] text-emerald-400/80">
                      {Math.round(currentCarbs * 4)} kcal ({Math.round(((currentCarbs * 4) / (currentCalories || 1)) * 100)}%)
                    </span>
                  </div>

                  <div className="bg-[#14161a] p-2.5 rounded-xl border border-amber-500/20 text-center">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Grasas Saludables
                    </span>
                    <strong className="text-lg font-black text-white block mt-0.5">
                      {currentFats}g
                    </strong>
                    <span className="text-[10px] text-amber-400/80">
                      {Math.round(currentFats * 9)} kcal ({Math.round(((currentFats * 9) / (currentCalories || 1)) * 100)}%)
                    </span>
                  </div>

                  <div className="bg-[#14161a] p-2.5 rounded-xl border border-purple-500/20 text-center">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                      Calorías Totales
                    </span>
                    <strong className="text-lg font-black text-white block mt-0.5">
                      {currentCalories}
                    </strong>
                    <span className="text-[10px] text-purple-400/80">
                      kcal / porción
                    </span>
                  </div>
                </div>
              </div>

              {/* Tip del Nutricionista MAXFORM */}
              <div className="p-4 bg-gradient-to-br from-blue-950/40 via-[#191c20] to-[#16181d] border border-blue-500/30 rounded-xl space-y-1.5 shadow-md">
                <div className="flex items-center gap-1.5 text-[#adc6ff] text-xs font-black uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px] text-[#adc6ff]">lightbulb</span>
                  <span>Tip del Nutricionista Deportivo MAX</span>
                </div>
                <p className="text-xs sm:text-sm text-[#c3c6d7] leading-relaxed">
                  {recipe.nutritionTip}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer con Botón de Registro Gamificado */}
        <div className="p-4 bg-[#14161a] border-t border-[#282a2f] flex-shrink-0">
          {loggedSuccess ? (
            <div className="w-full py-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 text-center font-bold text-sm flex items-center justify-center gap-2 animate-bounce">
              <span className="material-symbols-outlined text-[20px]">verified</span>
              ¡Registrado con éxito! +{recipe.xpReward} XP y +{currentProtein}g Proteína al día.
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogToDaily}
              className="w-full bg-[#2563eb] hover:bg-[#3b82f6] text-white font-bold py-3.5 px-4 rounded-xl text-center transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add_task</span>
              <span>
                Registrar en mis Macros de Hoy (+{currentProtein}g Proteína · +{currentCalories} kcal)
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
