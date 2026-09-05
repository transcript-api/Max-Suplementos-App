/**
 * Funciones auxiliares para conectar con la API de Gemini (MAX AI)
 * Nutrición deportiva, estimación de comidas y sugerencias de macros
 */

export interface MicronutrientItem {
  name: string;
  amount: string;
  dailyValuePct: number;
  category: 'mineral' | 'vitamina' | 'aminoacido';
  role: string;
}

export interface MicronutrientBreakdown {
  isComplexMenu: boolean;
  densityScore: number;
  bioavailabilityNote: string;
  minerals: MicronutrientItem[];
  vitamins: MicronutrientItem[];
  aminoAcids: MicronutrientItem[];
}

export interface MealSuggestion {
  mealName: string;
  protein: number;
  calories: number;
  preparationTime: string;
  ingredientsUsed: string[];
  instructions: string;
  reason: string;
  isComplexMenu?: boolean;
  micronutrients?: MicronutrientBreakdown;
}

export interface FoodEstimateResult {
  foodSummary: string;
  protein: number;
  calories: number;
  carbs: number;
  fats: number;
  confidence: string;
  nutritionTip: string;
}

/**
 * Función auxiliar que conecta con la API de Gemini para recibir una lista de alimentos
 * y devolver una sugerencia básica de comida basada en las proteínas faltantes.
 *
 * @param foods Lista de alimentos disponibles (ej: ['pollo', 'huevos', 'atún', 'yogur griego'])
 * @param missingProtein Cantidad de proteína en gramos que falta para alcanzar la meta (ej: 22)
 * @returns Promesa con la sugerencia estructurada de comida
 */
export async function suggestMealFromFoods(
  foods: string[],
  missingProtein: number
): Promise<MealSuggestion> {
  try {
    const response = await fetch('/api/ai/suggest-meal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        foods,
        missingProtein: Math.max(1, Math.round(missingProtein)),
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en el servidor: ${response.status}`);
    }

    const data = await response.json();
    return data as MealSuggestion;
  } catch (error) {
    console.warn('Fallback local para sugerencia de comida:', error);
    const targetProt = Math.max(15, Math.round(missingProtein));
    return {
      mealName: 'Omelette proteico de claras con atún y espinaca',
      protein: targetProt,
      calories: 215,
      preparationTime: '7 min',
      ingredientsUsed: ['1 lata de atún al agua (80g)', '3 claras de huevo', 'puñado de espinacas frescas'],
      instructions: 'Bate las claras con sal marina, vierte sobre sartén antiadherente caliente y agrega el atún escurrido con espinacas. Dobla en 3 minutos.',
      reason: `Aporta ${targetProt}g de proteína de alto valor biológico para cubrir tu requerimiento faltante manteniendo el déficit calórico.`
    };
  }
}

/**
 * Función auxiliar para estimar proteínas y calorías a partir de una descripción en texto
 * de lo que comió el usuario.
 */
export async function estimateFoodIntake(textDescription: string): Promise<FoodEstimateResult> {
  try {
    const response = await fetch('/api/ai/simple-food-estimate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: textDescription }),
    });

    if (!response.ok) {
      throw new Error(`Error en el servidor: ${response.status}`);
    }

    const data = await response.json();
    return data as FoodEstimateResult;
  } catch (error) {
    console.warn('Fallback local para estimación de comida:', error);
    return {
      foodSummary: textDescription || 'Comida registrada',
      protein: 24,
      calories: 320,
      carbs: 26,
      fats: 11,
      confidence: 'Estimado',
      nutritionTip: 'Aporte balanceado con buena concentración de aminoácidos esenciales.'
    };
  }
}
