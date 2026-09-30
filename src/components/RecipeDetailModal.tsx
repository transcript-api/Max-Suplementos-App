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

// Helper para escalar cantidades numéricas según la porción (ej: 200g -> 300g con 1.5x)
export const scaleQuantity = (quantityStr: string, multiplier: number): string => {
  if (multiplier === 1) return quantityStr;
  return quantityStr.replace(/(\d+(?:\.\d+)?)\s*(g|ml|kg|l|unidades?|huevos?|taza|cucharadas?|cucharaditas?|colher|colheres|fetas?|rodajas?|dientes?)?/gi, (match, num, unit) => {
    const val = parseFloat(num);
    const scaled = Math.round(val * multiplier * 10) / 10;
    return `${scaled}${unit ? (unit.startsWith(' ') ? unit : ' ' + unit) : ''}`;
  });
};

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  onLogMeal,
}) => {
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [loggedSuccess, setLoggedSuccess] = useState(false);
  const [copyToast, setCopyToast] = useState(false);
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

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const totalIngredients = recipe.ingredients.length;
  const checkedCount = Object.values(checkedIngredients).filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / totalIngredients) * 100);

  const totalSteps = recipe.instructions.length;
  const completedStepsCount = Object.values(completedSteps).filter(Boolean).length;
  const stepsProgressPercent = Math.round((completedStepsCount / totalSteps) * 100);

  const markAllIngredients = (value: boolean) => {
    const updated: Record<number, boolean> = {};
    recipe.ingredients.forEach((_, idx) => {
      updated[idx] = value;
    });
    setCheckedIngredients(updated);
  };

  const handleCopyRecipe = () => {
    const scaledIngredientsText = recipe.ingredients
      .map((i) => `• ${i.name}: ${scaleQuantity(i.quantity, portionMultiplier)}`)
      .join('\n');

    const instructionsText = recipe.instructions
      .map((step, idx) => `Paso ${idx + 1}: ${step}`)
      .join('\n\n');

    const textToCopy = `🍽️ RECETA FIT: ${recipe.name.toUpperCase()} (${recipe.countryLabel} ${recipe.flag})
⚖️ Porción: ${portionMultiplier}x
📊 MACROS POR PORCIÓN:
• Proteína: ${currentProtein}g
• Calorías: ${currentCalories} kcal
• Carbohidratos: ${currentCarbs}g
• Grasas: ${currentFats}g
⏱️ Tiempo estimado: ${recipe.prepTimeMinutes} min

🛒 INGREDIENTES EXACTOS:
${scaledIngredientsText}

👨‍🍳 PREPARACIÓN PASO A PASO:
${instructionsText}

💡 TIP DEL NUTRICIONISTA MAX:
${recipe.nutritionTip}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2800);
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
      badgeClass: 'bg-white/20 text-white border-white/40',
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Toast de receta copiada */}
      {copyToast && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-[#10b981] text-black px-4 py-2.5 rounded-xl shadow-2xl border border-emerald-300 font-black text-xs sm:text-sm flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[20px]">content_copy</span>
          <span>¡Receta exacta y gramajes copiados al portapapeles!</span>
        </div>
      )}
      <div className="bg-[#06151e] border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative my-auto max-h-[92vh] flex flex-col text-white">
        {/* Header con imagen del plato */}
        <div className="relative w-full h-56 sm:h-64 bg-[#06151e] flex-shrink-0">
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#06151e] via-[#06151e]/50 to-transparent" />

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all active:scale-95 z-10 cursor-pointer"
            aria-label="Cerrar ficha"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          {/* Badges superiores */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 items-center">
            <span className="bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
              <span className="text-base">{recipe.flag}</span>
              <span>{recipe.countryLabel}</span>
            </span>
            <span className="bg-emerald-500/95 backdrop-blur-md text-black text-xs font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">scale</span>
              <span>Foto Real & Receta Exacta</span>
            </span>
            <button
              type="button"
              onClick={handleCopyRecipe}
              className="bg-black/60 hover:bg-black/90 text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Copiar receta con gramajes e instrucciones"
            >
              <span className="material-symbols-outlined text-[14px]">content_copy</span>
              <span className="hidden xs:inline">Copiar</span>
            </button>
            <span className="bg-[#ffffff]/90 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-full border border-white/30 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">stars</span>
              <span>+{recipe.xpReward} XP</span>
            </span>
          </div>

          {/* Info sobre la imagen en la parte inferior */}
          <div className="absolute bottom-3 left-4 right-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d6d6d6] bg-[#ffffff]/20 px-2 py-0.5 rounded border border-[#ffffff]/40 inline-block mb-1">
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
          <p className="text-sm text-[#d6d6d6] leading-relaxed">
            {recipe.description}
          </p>

          {/* Selector de porciones interactivo */}
          <div className="bg-[#06151e] p-3.5 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#898a8c] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#d6d6d6]">scale</span>
                Ajustar Porción
              </span>
              <span className="text-xs font-extrabold text-[#d6d6d6] bg-[#ffffff]/20 px-2 py-0.5 rounded border border-[#ffffff]/30">
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
                      ? 'bg-[#06151e] text-white shadow-md'
                      : 'bg-[#06151e] text-[#898a8c] hover:text-white hover:bg-[#545a5b]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Panel de Macros recalculados */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-[#06151e] p-3 rounded-xl border border-[#ffffff]/40 text-center">
              <span className="text-[10px] font-bold text-[#d6d6d6] uppercase tracking-wider block">
                Proteína
              </span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">
                {currentProtein}g
              </span>
              <span className="text-[10px] text-white font-semibold block">
                {Math.round(currentProtein * 4)} kcal
              </span>
            </div>

            <div className="bg-[#06151e] p-3 rounded-xl border border-emerald-500/30 text-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Calorías
              </span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">
                {currentCalories}
              </span>
              <span className="text-[10px] text-[#898a8c] font-semibold block">
                Energía
              </span>
            </div>

            <div className="bg-[#06151e] p-3 rounded-xl border border-emerald-500/20 text-center">
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

            <div className="bg-[#06151e] p-3 rounded-xl border border-amber-500/20 text-center">
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
          <div className="flex items-center justify-around py-2 px-3 bg-[#06151e] rounded-xl border border-white/10 text-xs text-[#898a8c]">
            <span className="flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[16px] text-[#d6d6d6]">timer</span>
              Tiempo: <strong className="text-white">{recipe.prepTimeMinutes} min</strong>
            </span>
            <span className="w-px h-4 bg-[#545a5b]" />
            <span className="flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[16px] text-[#d6d6d6]">speed</span>
              Dificultad: <strong className="text-white">{recipe.difficulty}</strong>
            </span>
            <span className="w-px h-4 bg-[#545a5b]" />
            <span className="flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
              Fitness Auténtico
            </span>
          </div>

          {/* Selector de Pestañas Principal */}
          <div className="flex bg-[#06151e] p-1 rounded-xl border border-white/10 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('ingredientes')}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ingredientes'
                  ? 'bg-[#06151e] text-white shadow-md'
                  : 'text-[#898a8c] hover:text-white'
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
                  ? 'bg-[#06151e] text-white shadow-md'
                  : 'text-[#898a8c] hover:text-white'
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
                  ? 'bg-[#06151e] text-white shadow-md'
                  : 'text-[#898a8c] hover:text-white'
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
              <div className="bg-[#06151e] p-3 rounded-xl border border-white/10 space-y-2">
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
                      className="text-[11px] text-[#d6d6d6] hover:underline font-semibold"
                    >
                      {checkedCount === totalIngredients ? 'Desmarcar' : 'Marcar todos'}
                    </button>
                  </div>
                </div>

                <div className="w-full bg-[#06151e] h-2 rounded-full overflow-hidden">
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
                        ? 'bg-[#ffffff]/30 text-[#d6d6d6] border border-[#ffffff]/50'
                        : 'bg-[#06151e] text-[#898a8c] hover:text-white border border-white/10'
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
                            ? 'bg-[#06151e] border-emerald-500/30 opacity-75'
                            : 'bg-[#06151e] hover:bg-[#06151e] border-white/10 hover:border-[#ffffff]/40 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Checkbox circular */}
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all flex-shrink-0 ${
                              isChecked
                                ? 'bg-emerald-500 border-emerald-500 text-black'
                                : 'border-[#545a5b] bg-[#06151e]'
                            }`}
                          >
                            {isChecked && (
                              <span className="material-symbols-outlined text-[13px] font-black">check</span>
                            )}
                          </div>

                          {/* Foto real del ingrediente */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[#545a5b] bg-[#06151e] relative shadow-inner">
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
                                isChecked ? 'line-through text-[#898a8c]' : 'text-white'
                              }`}
                            >
                              {ing.name}
                            </h4>
                          </div>
                        </div>

                        {/* Cantidad exacta de la porción */}
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-xs font-black text-[#d6d6d6] bg-[#ffffff]/15 px-2 py-1 rounded-lg border border-[#ffffff]/30 whitespace-nowrap">
                            {scaleQuantity(ing.quantity, portionMultiplier)}
                          </span>
                          {portionMultiplier !== 1 && (
                            <span className="text-[9px] text-[#898a8c] mt-0.5">
                              x{portionMultiplier} porción
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Nota de pie de ingredientes */}
              <div className="flex items-center gap-2 p-2.5 bg-[#06151e] rounded-xl border border-white/10 text-[11px] text-[#898a8c]">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">verified</span>
                <span>
                  Medidas 100% exactas en gramos y mililitros adaptadas dinámicamente a tu porción.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: PREPARACIÓN PASO A PASO */}
          {activeTab === 'pasos' && (
            <div className="space-y-3.5">
              {/* Progreso del Cocinero */}
              <div className="bg-[#06151e] p-3 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#d6d6d6]">soup_kitchen</span>
                    <span className="font-bold text-white">Progreso de Cocina</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#d6d6d6]">
                      {completedStepsCount} de {totalSteps} pasos ({stepsProgressPercent}%)
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyRecipe}
                      className="text-[11px] text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]">content_copy</span>
                      Copiar Receta
                    </button>
                  </div>
                </div>

                <div className="w-full bg-[#06151e] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#ffffff] h-full rounded-full transition-all duration-300"
                    style={{ width: `${stepsProgressPercent}%` }}
                  />
                </div>
              </div>

              {completedStepsCount === totalSteps && totalSteps > 0 && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <span className="material-symbols-outlined text-[18px]">restaurant</span>
                  <span>¡Plato finalizado a la perfección! Ya puedes servir y registrar tus macros.</span>
                </div>
              )}

              {/* Lista interactiva de Pasos */}
              <div className="space-y-2.5">
                {recipe.instructions.map((step, idx) => {
                  const isDone = !!completedSteps[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`p-3.5 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer select-none ${
                        isDone
                          ? 'bg-[#06151e] border-emerald-500/40 opacity-80'
                          : 'bg-[#06151e] hover:bg-[#06151e] border-white/10 hover:border-[#ffffff]/40 shadow-sm'
                      }`}
                    >
                      <button
                        type="button"
                        className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-black'
                            : 'bg-gradient-to-br from-[#06151e] to-[#545a5b] text-white'
                        }`}
                      >
                        {isDone ? (
                          <span className="material-symbols-outlined text-[15px] font-black">done</span>
                        ) : (
                          idx + 1
                        )}
                      </button>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#d6d6d6]">
                            Paso {idx + 1}
                          </span>
                          <span className="text-[10px] text-[#898a8c]">
                            {isDone ? 'Completado' : 'Toca para marcar'}
                          </span>
                        </div>
                        <p
                          className={`text-xs sm:text-sm leading-relaxed ${
                            isDone ? 'line-through text-[#898a8c]' : 'text-[#d6d6d6]'
                          }`}
                        >
                          {step}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: MACROS & TIP NUTRICIONAL */}
          {activeTab === 'macros' && (
            <div className="space-y-3.5">
              {/* Tarjeta de Resumen Macronutricional */}
              <div className="bg-[#06151e] p-4 rounded-xl border border-white/10 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#d6d6d6] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">pie_chart</span>
                  Distribución Calórica y Macronutrientes
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-[#06151e] p-2.5 rounded-xl border border-white/20 text-center">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider block">
                      Proteína
                    </span>
                    <strong className="text-lg font-black text-white block mt-0.5">
                      {currentProtein}g
                    </strong>
                    <span className="text-[10px] text-white/80">
                      {Math.round(currentProtein * 4)} kcal ({Math.round(((currentProtein * 4) / (currentCalories || 1)) * 100)}%)
                    </span>
                  </div>

                  <div className="bg-[#06151e] p-2.5 rounded-xl border border-emerald-500/20 text-center">
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

                  <div className="bg-[#06151e] p-2.5 rounded-xl border border-amber-500/20 text-center">
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

                  <div className="bg-[#06151e] p-2.5 rounded-xl border border-purple-500/20 text-center">
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
              <div className="p-4 bg-gradient-to-br from-[#06151e] via-[#06151e] to-[#06151e] border border-white/30 rounded-xl space-y-1.5 shadow-md">
                <div className="flex items-center gap-1.5 text-[#d6d6d6] text-xs font-black uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px] text-[#d6d6d6]">lightbulb</span>
                  <span>Tip del Nutricionista Deportivo MAX</span>
                </div>
                <p className="text-xs sm:text-sm text-[#d6d6d6] leading-relaxed">
                  {recipe.nutritionTip}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer con Botón de Registro Gamificado */}
        <div className="p-4 bg-[#06151e] border-t border-white/10 flex-shrink-0">
          {loggedSuccess ? (
            <div className="w-full py-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 text-center font-bold text-sm flex items-center justify-center gap-2 animate-bounce">
              <span className="material-symbols-outlined text-[20px]">verified</span>
              ¡Registrado con éxito! +{recipe.xpReward} XP y +{currentProtein}g Proteína al día.
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogToDaily}
              className="w-full bg-[#06151e] hover:bg-[#545a5b] text-white font-bold py-3.5 px-4 rounded-xl text-center transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
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
