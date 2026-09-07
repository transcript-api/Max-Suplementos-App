import React, { useState, useMemo } from 'react';
import { RecipeItem, getAllRecipes } from '../data/recipesDatabase';
import { RecipeDetailModal } from './RecipeDetailModal';
import { AddRecipeModal } from './AddRecipeModal';
import { getIngredientImage } from '../data/ingredientImages';

interface MealIdeasCatalogProps {
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

export const MealIdeasCatalog: React.FC<MealIdeasCatalogProps> = ({
  onClose,
  onLogMeal,
}) => {
  const [recipes, setRecipes] = useState<RecipeItem[]>(() => getAllRecipes());
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<'all' | 'uruguay' | 'brasil' | 'frontera'>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'high_protein' | 'quick' | 'low_calorie' | 'hypertrophy'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manejador cuando se agrega una receta personalizada
  const handleRecipeAdded = (newRecipe: RecipeItem) => {
    setRecipes((prev) => [newRecipe, ...prev]);
    showToast(`¡"${newRecipe.name}" añadido al catálogo con éxito!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleQuickLog = (recipe: RecipeItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onLogMeal({
      name: recipe.name,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fats: recipe.fats,
      calories: recipe.calories,
      xpReward: recipe.xpReward,
    });
    showToast(`¡${recipe.name} registrado! +${recipe.protein}g Proteína · +${recipe.xpReward} XP`);
  };

  // Filtrado reactivo en vivo
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      // Filtro por país
      if (countryFilter !== 'all' && r.country !== countryFilter) {
        return false;
      }

      // Filtro rápido
      if (quickFilter === 'high_protein' && r.protein < 40) return false;
      if (quickFilter === 'quick' && r.prepTimeMinutes > 15) return false;
      if (quickFilter === 'low_calorie' && r.calories > 400) return false;
      if (quickFilter === 'hypertrophy' && r.goal !== 'hipertrofia') return false;

      // Filtro de búsqueda por texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(query);
        const matchesDesc = r.description.toLowerCase().includes(query);
        const matchesIng = r.ingredients.some((i) => i.name.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesIng) return false;
      }

      return true;
    });
  }, [recipes, countryFilter, quickFilter, searchQuery]);

  // Contadores para insignias
  const totalCount = recipes.length;
  const uruguayCount = recipes.filter((r) => r.country === 'uruguay').length;
  const brasilCount = recipes.filter((r) => r.country === 'brasil').length;

  return (
    <div className="fixed inset-0 z-40 bg-[#0c0e12] flex flex-col overflow-hidden text-white animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-[#2563eb] text-white px-4 py-2.5 rounded-xl shadow-2xl border border-blue-400/40 font-bold text-xs sm:text-sm flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Superior Deportivo */}
      <div className="bg-[#14161a] border-b border-[#282a2f] px-4 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1d2024] hover:bg-[#282a2f] text-white flex items-center justify-center border border-[#333539] transition-all active:scale-95"
            aria-label="Volver a Nutrición"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Ideas de Comida Fitness</span>
                <span className="text-sm">🇺🇾 🇧🇷</span>
              </h1>
              <span className="hidden sm:inline-block bg-[#2563eb]/20 text-[#adc6ff] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#2563eb]/30">
                {totalCount}+ PLATOS
              </span>
            </div>
            <p className="text-[11px] text-[#8d90a0]">
              Gastronomía de alto rendimiento de Uruguay y Brasil adaptada a tus macros
            </p>
          </div>
        </div>

        {/* Botón Agregar Plato Propio */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1d4ed8] hover:to-[#2563eb] text-white text-xs sm:text-sm font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-lg border border-blue-400/30 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Crear Plato</span>
          <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black hidden sm:inline">+30 XP</span>
        </button>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className="bg-[#191c20] border-b border-[#282a2f] p-3 sm:p-4 space-y-3 flex-shrink-0">
        {/* Barra de Búsqueda */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d90a0] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar plato (ej: chivito, picanha, feijoada, lomo, batata doce)..."
            className="w-full bg-[#0c0e12] border border-[#282a2f] rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-[#5d616d] focus:outline-none focus:border-[#2563eb] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d90a0] hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Filtro por País */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setCountryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              countryFilter === 'all'
                ? 'bg-white text-black border-white'
                : 'bg-[#14161a] text-[#8d90a0] border-[#282a2f] hover:text-white'
            }`}
          >
            Todos ({totalCount})
          </button>
          <button
            onClick={() => setCountryFilter('uruguay')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              countryFilter === 'uruguay'
                ? 'bg-[#2563eb] text-white border-[#2563eb]'
                : 'bg-[#14161a] text-[#8d90a0] border-[#282a2f] hover:text-white'
            }`}
          >
            <span>🇺🇾 Uruguay</span>
            <span className="text-[10px] opacity-80">({uruguayCount})</span>
          </button>
          <button
            onClick={() => setCountryFilter('brasil')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              countryFilter === 'brasil'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-[#14161a] text-[#8d90a0] border-[#282a2f] hover:text-white'
            }`}
          >
            <span>🇧🇷 Brasil</span>
            <span className="text-[10px] opacity-80">({brasilCount})</span>
          </button>
          <button
            onClick={() => setCountryFilter('frontera')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              countryFilter === 'frontera'
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-[#14161a] text-[#8d90a0] border-[#282a2f] hover:text-white'
            }`}
          >
            <span>🌐 Frontera</span>
          </button>
        </div>

        {/* Filtros Rápidos de Metas */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Todas las Metas' },
            { id: 'high_protein', label: '🔥 +40g Proteína' },
            { id: 'quick', label: '⚡ Rápidos (<15 min)' },
            { id: 'low_calorie', label: '🥗 Definición (<400 kcal)' },
            { id: 'hypertrophy', label: '💪 Hipertrofia' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setQuickFilter(f.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                quickFilter === f.id
                  ? 'bg-[#2563eb]/30 text-[#adc6ff] border border-[#2563eb]/50'
                  : 'bg-[#14161a] text-[#8d90a0] hover:text-white border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Platos */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Contador de resultados */}
          <div className="flex items-center justify-between text-xs text-[#8d90a0]">
            <span>
              Mostrando <strong className="text-white">{filteredRecipes.length}</strong> de {recipes.length} platos fitness
            </span>
            {(searchQuery || countryFilter !== 'all' || quickFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCountryFilter('all');
                  setQuickFilter('all');
                }}
                className="text-[#adc6ff] hover:underline flex items-center gap-1 font-semibold"
              >
                <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                Restablecer filtros
              </button>
            )}
          </div>

          {/* Estado vacío si no hay coincidencias */}
          {filteredRecipes.length === 0 && (
            <div className="bg-[#16181d] border border-[#282a2f] rounded-2xl p-8 text-center space-y-3 my-8">
              <div className="w-12 h-12 rounded-full bg-[#2563eb]/20 text-[#adc6ff] flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[28px]">search_off</span>
              </div>
              <h3 className="text-base font-bold text-white">
                No encontramos platos con esos criterios
              </h3>
              <p className="text-xs text-[#8d90a0] max-w-sm mx-auto">
                Prueba buscando otros ingredientes tradicionales o crea tu propia receta para agregarla a tu catálogo.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-[#2563eb] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#3b82f6] transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                Crear esta comida personalizada
              </button>
            </div>
          )}

          {/* Grid de Tarjetas: 2 columnas en móvil siempre */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className="bg-[#16181d] hover:bg-[#1a1d23] border border-[#282a2f] hover:border-[#2563eb]/50 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-0.5 group"
              >
                {/* Imagen y Badges */}
                <div className="relative w-full h-32 sm:h-44 bg-[#212429] overflow-hidden flex-shrink-0">
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16181d] via-[#16181d]/20 to-black/40" />

                  {/* Badges superiores */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                    <span className="bg-black/75 backdrop-blur-md text-white text-[9px] sm:text-[11px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                      <span>{recipe.flag}</span>
                      <span className="hidden xs:inline">{recipe.countryLabel}</span>
                    </span>
                    {recipe.isCustom && (
                      <span className="bg-amber-500/95 text-black text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full">
                        TU RECETA
                      </span>
                    )}
                  </div>

                  {/* Badge de tiempo */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                    <span className="bg-black/75 backdrop-blur-md text-[#e0e2ed] text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[11px] sm:text-[12px]">timer</span>
                      {recipe.prepTimeMinutes}m
                    </span>
                  </div>

                  {/* Nombre y Categoría sobre la imagen */}
                  <div className="absolute bottom-1.5 left-2 right-2 sm:bottom-2 sm:left-3 sm:right-3">
                    <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[#adc6ff] block truncate">
                      {recipe.goalLabel}
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-white line-clamp-2 leading-tight drop-shadow-md">
                      {recipe.name}
                    </h3>
                  </div>
                </div>

                {/* Cuerpo de la tarjeta */}
                <div className="p-2 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                  {/* Barra de Proteína Destacada */}
                  <div className="bg-[#1d2024] p-1.5 sm:p-2.5 rounded-xl border border-[#282a2f] space-y-1 sm:space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] sm:text-[10px] font-bold text-[#8d90a0] uppercase tracking-wider flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px] sm:text-[14px] text-[#2563eb]">fitness_center</span>
                        Proteína
                      </span>
                      <span className="text-[11px] sm:text-xs font-black text-[#b4c5ff]">
                        {recipe.protein}g P
                      </span>
                    </div>

                    <div className="w-full bg-[#0c0e12] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#2563eb] h-full rounded-full"
                        style={{ width: `${Math.min(100, (recipe.protein / 60) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Desglose secundario de macros */}
                  <div className="grid grid-cols-3 gap-0.5 sm:gap-1 text-center bg-[#191c20] py-1 sm:py-1.5 px-1 sm:px-2 rounded-lg text-[8px] sm:text-[10px]">
                    <div>
                      <span className="text-[#8d90a0] block text-[8px] sm:text-[9px]">Calorías</span>
                      <strong className="text-emerald-400 font-bold">{recipe.calories}</strong>
                    </div>
                    <div>
                      <span className="text-[#8d90a0] block text-[8px] sm:text-[9px]">Carbos</span>
                      <strong className="text-white font-bold">{recipe.carbs}g</strong>
                    </div>
                    <div>
                      <span className="text-[#8d90a0] block text-[8px] sm:text-[9px]">Grasas</span>
                      <strong className="text-amber-400 font-bold">{recipe.fats}g</strong>
                    </div>
                  </div>

                  {/* Fotos reales de alimentos según la lógica de ingredientes */}
                  <div className="bg-[#191c20] px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border border-[#282a2f] flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 overflow-hidden">
                      <div className="flex -space-x-1 sm:-space-x-1.5 overflow-hidden py-0.5">
                        {recipe.ingredients.slice(0, 3).map((ing, i) => {
                          const visual = getIngredientImage(ing.name);
                          return (
                            <img
                              key={i}
                              src={visual.image}
                              alt={ing.name}
                              title={`${ing.name} (${ing.quantity})`}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-[#282a2f] flex-shrink-0 bg-[#212429]"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300&auto=format&fit=crop&q=80';
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-[#adc6ff] font-bold whitespace-nowrap bg-[#2563eb]/10 px-1 sm:px-1.5 py-0.5 rounded border border-[#2563eb]/20">
                      {recipe.ingredients.length} ingr.
                    </span>
                  </div>

                  {/* Acciones de la Tarjeta */}
                  <div className="grid grid-cols-2 gap-1 sm:gap-2 pt-0.5 sm:pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecipe(recipe);
                      }}
                      className="py-1.5 sm:py-2 px-1 sm:px-2 bg-[#282a2f] hover:bg-[#333539] text-[#e0e2ed] text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-0.5 sm:gap-1 text-center"
                    >
                      <span className="material-symbols-outlined text-[13px] sm:text-[14px]">menu_book</span>
                      <span>Ficha</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleQuickLog(recipe, e)}
                      className="py-1.5 sm:py-2 px-1 sm:px-2 bg-[#2563eb] hover:bg-[#3b82f6] text-white text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-0.5 sm:gap-1 text-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px] sm:text-[14px]">add</span>
                      <span>Registrar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalle de Receta */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onLogMeal={onLogMeal}
        />
      )}

      {/* Modal para Agregar Receta Propia */}
      <AddRecipeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRecipeAdded={handleRecipeAdded}
      />
    </div>
  );
};
