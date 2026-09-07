import React, { useState } from 'react';
import { RecipeItem, saveNewCustomRecipe } from '../data/recipesDatabase';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecipeAdded: (recipe: RecipeItem) => void;
}

export const AddRecipeModal: React.FC<AddRecipeModalProps> = ({
  isOpen,
  onClose,
  onRecipeAdded,
}) => {
  const [name, setName] = useState('');
  const [country, setCountry] = useState<'uruguay' | 'brasil' | 'frontera'>('uruguay');
  const [category, setCategory] = useState<'almuerzo_cena' | 'desayuno_merienda' | 'post_entreno' | 'snack_rapido'>('almuerzo_cena');
  const [goal, setGoal] = useState<'hipertrofia' | 'definicion' | 'rendimiento' | 'rapido'>('hipertrofia');
  const [protein, setProtein] = useState<number>(35);
  const [calories, setCalories] = useState<number>(420);
  const [carbs, setCarbs] = useState<number>(30);
  const [fats, setFats] = useState<number>(10);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(20);
  const [difficulty, setDifficulty] = useState<'Fácil' | 'Intermedio' | 'Avanzado'>('Fácil');
  const [description, setDescription] = useState('');
  const [nutritionTip, setNutritionTip] = useState('');
  const [ingredientsText, setIngredientsText] = useState('200g Pechuga de pollo\n100g Arroz integral\n1 Huevo campero');
  const [instructionsText, setInstructionsText] = useState('Dorar la pechuga en sartén bien caliente.\nHervir el arroz y mezclar los ingredientes.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Procesar ingredientes
    const parsedIngredients = ingredientsText
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const parts = line.split(' ');
        const quantity = parts[0] || '1 porción';
        const ingName = parts.slice(1).join(' ') || line;
        return { name: ingName, quantity };
      });

    // Procesar instrucciones
    const parsedInstructions = instructionsText
      .split('\n')
      .filter((line) => line.trim());

    // Asignar banderas y etiquetas
    const flag = country === 'uruguay' ? '🇺🇾' : country === 'brasil' ? '🇧🇷' : '🌐';
    const countryLabel = country === 'uruguay' ? 'Uruguay' : country === 'brasil' ? 'Brasil' : 'Frontera';

    const categoryLabel =
      category === 'almuerzo_cena'
        ? 'Almuerzo / Cena'
        : category === 'desayuno_merienda'
        ? 'Desayuno / Merienda'
        : category === 'post_entreno'
        ? 'Pós-Treino'
        : 'Snack Rápido';

    const goalLabel =
      goal === 'hipertrofia'
        ? 'Hipertrofia Muscular'
        : goal === 'definicion'
        ? 'Definición / Corte'
        : goal === 'rendimiento'
        ? 'Rendimiento Deportivo'
        : 'Rápido (<15 min)';

    // Imagen representativa según el tipo
    const defaultImage =
      category === 'desayuno_merienda'
        ? 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80'
        : goal === 'definicion'
        ? 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80';

    const newRecipe = saveNewCustomRecipe({
      name: name.trim(),
      country,
      countryLabel,
      flag,
      category,
      categoryLabel,
      goal,
      goalLabel,
      protein: Number(protein) || 30,
      calories: Number(calories) || 350,
      carbs: Number(carbs) || 20,
      fats: Number(fats) || 8,
      prepTimeMinutes: Number(prepTimeMinutes) || 15,
      difficulty,
      xpReward: 30,
      image: defaultImage,
      description: description.trim() || `Plato fitness personalizado creado por el atleta para sus metas de ${goalLabel}.`,
      ingredients: parsedIngredients.length > 0 ? parsedIngredients : [{ name: 'Ingredientes personalizados', quantity: 'Al gusto' }],
      instructions: parsedInstructions.length > 0 ? parsedInstructions : ['Preparar según tu receta tradicional preferida.'],
      nutritionTip: nutritionTip.trim() || 'Comida limpia y adaptada a tus requerimientos proteicos diarios de MAXFORM.',
    });

    onRecipeAdded(newRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-[#16181d] border border-[#282a2f] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative my-auto max-h-[92vh] flex flex-col text-white">
        {/* Header */}
        <div className="p-4 bg-[#1d2024] border-b border-[#282a2f] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#adc6ff]">soup_kitchen</span>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Agregar Plato al Catálogo
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#282a2f] hover:bg-[#333539] text-[#8d90a0] hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar">
          {/* Nombre */}
          <div>
            <label className="text-xs font-bold text-[#adc6ff] uppercase tracking-wider block mb-1">
              Nombre del Plato *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Colita de Cuadril con Boniato / Frango com Batata Doce"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0c0e12] border border-[#282a2f] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#2563eb]"
            />
          </div>

          {/* País / Origen */}
          <div>
            <label className="text-xs font-bold text-[#8d90a0] uppercase tracking-wider block mb-1">
              Origen Gastronómico
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCountry('uruguay')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  country === 'uruguay'
                    ? 'bg-[#2563eb]/20 border-[#2563eb] text-[#adc6ff]'
                    : 'bg-[#191c20] border-[#282a2f] text-[#8d90a0]'
                }`}
              >
                <span>🇺🇾</span>
                <span>Uruguay</span>
              </button>
              <button
                type="button"
                onClick={() => setCountry('brasil')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  country === 'brasil'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-[#191c20] border-[#282a2f] text-[#8d90a0]'
                }`}
              >
                <span>🇧🇷</span>
                <span>Brasil</span>
              </button>
              <button
                type="button"
                onClick={() => setCountry('frontera')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  country === 'frontera'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-[#191c20] border-[#282a2f] text-[#8d90a0]'
                }`}
              >
                <span>🌐</span>
                <span>Frontera</span>
              </button>
            </div>
          </div>

          {/* Macros */}
          <div className="bg-[#191c20] p-3 rounded-xl border border-[#282a2f] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white block">
              Macronutrientes por Porción
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] text-[#adc6ff] font-bold block mb-1">PROTEÍNA (g)</label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-full bg-[#0c0e12] border border-[#2563eb]/40 rounded-lg p-2 text-sm text-white font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-emerald-400 font-bold block mb-1">CALORÍAS (kcal)</label>
                <input
                  type="number"
                  min="0"
                  max="3000"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full bg-[#0c0e12] border border-emerald-500/40 rounded-lg p-2 text-sm text-white font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-emerald-300 font-bold block mb-1">CARBOS (g)</label>
                <input
                  type="number"
                  min="0"
                  max="400"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full bg-[#0c0e12] border border-[#282a2f] rounded-lg p-2 text-sm text-white font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-amber-400 font-bold block mb-1">GRASAS (g)</label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={fats}
                  onChange={(e) => setFats(Number(e.target.value))}
                  className="w-full bg-[#0c0e12] border border-amber-500/40 rounded-lg p-2 text-sm text-white font-bold text-center"
                />
              </div>
            </div>
          </div>

          {/* Tiempo y Dificultad */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-[#8d90a0] uppercase tracking-wider block mb-1">
                Tiempo (minutos)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={prepTimeMinutes}
                onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                className="w-full bg-[#0c0e12] border border-[#282a2f] rounded-xl px-3 py-2 text-sm text-white text-center font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#8d90a0] uppercase tracking-wider block mb-1">
                Dificultad
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-[#0c0e12] border border-[#282a2f] rounded-xl px-3 py-2 text-sm text-white font-bold"
              >
                <option value="Fácil">Fácil</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
          </div>

          {/* Ingredientes */}
          <div>
            <label className="text-xs font-bold text-[#adc6ff] uppercase tracking-wider block mb-1">
              Ingredientes (un ingrediente por línea)
            </label>
            <textarea
              rows={3}
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              placeholder="Ej: 200g Lomo magro&#10;150g Papines al horno"
              className="w-full bg-[#0c0e12] border border-[#282a2f] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#2563eb]"
            />
          </div>

          {/* Instrucciones */}
          <div>
            <label className="text-xs font-bold text-[#8d90a0] uppercase tracking-wider block mb-1">
              Preparación (un paso por línea)
            </label>
            <textarea
              rows={3}
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              placeholder="Paso 1: Dorar la carne...&#10;Paso 2: Servir con ensalada..."
              className="w-full bg-[#0c0e12] border border-[#282a2f] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#2563eb]"
            />
          </div>

          {/* Botón enviar */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#2563eb] hover:bg-[#3b82f6] text-white font-bold py-3 rounded-xl text-center shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Guardar Plato en mi Catálogo (+30 XP)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
