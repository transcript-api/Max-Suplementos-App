import { SupplementPot, SupplementPotCatalogItem } from '../types/maxSuplementosV1';

// Catálogo inicial verificado de MAX Suplementos (para escaneo rápido de código de barras o búsqueda)
export const MAX_STORE_CATALOG: SupplementPotCatalogItem[] = [
  {
    barcode: '7898123456789',
    name: 'Creatina Creapure 300g',
    brand: 'MAX Suplementos',
    category: 'creatina',
    defaultSize: 300,
    sizeUnit: 'g',
    defaultDose: 5,
    isVerified: true,
    nutritionFacts: [
      { name: 'Creatina Monohidratada', amount: 5, unit: 'g' },
      { name: 'Calorias', amount: 0, unit: 'kcal' },
    ],
  },
  {
    barcode: '7898999887766',
    name: 'Whey Protein Isolado 900g',
    brand: 'MAX Suplementos',
    category: 'proteina',
    defaultSize: 900,
    sizeUnit: 'g',
    defaultDose: 30,
    isVerified: true,
    nutritionFacts: [
      { name: 'Proteína', amount: 27, unit: 'g' },
      { name: 'Carboidratos', amount: 1, unit: 'g' },
      { name: 'Gorduras', amount: 0.5, unit: 'g' },
      { name: 'Calorias', amount: 116, unit: 'kcal' },
      { name: 'BCAA', amount: 6.2, unit: 'g' },
    ],
  },
  {
    barcode: '7891234455667',
    name: 'Pré-Treino Insane Focus 300g',
    brand: 'MAX Suplementos',
    category: 'pre-treino',
    defaultSize: 300,
    sizeUnit: 'g',
    defaultDose: 10,
    isVerified: true,
    nutritionFacts: [
      { name: 'Cafeína', amount: 200, unit: 'mg' },
      { name: 'Beta-alanina', amount: 1600, unit: 'mg' },
      { name: 'Creatina', amount: 3, unit: 'g' },
      { name: 'Taurina', amount: 1000, unit: 'mg' },
      { name: 'Vitamina C', amount: 45, unit: 'mg' },
      { name: 'Vitamina B12', amount: 2.4, unit: 'mcg' },
    ],
  },
  {
    barcode: '7895556667778',
    name: 'Ultra Omega 3 EPA/DHA 120 cáps',
    brand: 'MAX Suplementos',
    category: 'vitaminas',
    defaultSize: 120,
    sizeUnit: 'cápsulas',
    defaultDose: 2,
    isVerified: true,
    nutritionFacts: [
      { name: 'EPA', amount: 660, unit: 'mg' },
      { name: 'DHA', amount: 440, unit: 'mg' },
      { name: 'Vitamina E', amount: 10, unit: 'mg' },
    ],
  },
  {
    barcode: '7890001112223',
    name: 'Multivitamínico Daily Complete 60 tabs',
    brand: 'MAX Suplementos',
    category: 'vitaminas',
    defaultSize: 60,
    sizeUnit: 'comprimidos',
    defaultDose: 1,
    isVerified: true,
    nutritionFacts: [
      { name: 'Vitamina C', amount: 90, unit: 'mg' },
      { name: 'Vitamina D3', amount: 2000, unit: 'mcg' },
      { name: 'Zinco', amount: 15, unit: 'mg' },
      { name: 'Magnésio', amount: 120, unit: 'mg' },
      { name: 'Vitamina B12', amount: 5, unit: 'mcg' },
    ],
  },
];

// Helper: Calcular días restantes en base al consumo real marcado
export function calculateRemainingStats(pot: SupplementPot) {
  const totalDosesCapacity = Math.floor(pot.totalSize / (pot.dailyDose || 1));
  const dosesTaken = pot.dosesHistory.length;
  const dosesLeft = Math.max(0, totalDosesCapacity - dosesTaken);

  // Fecha estimada de fin:
  // Se proyecta según los días faltantes a partir de hoy (no desde la compra, como exige la especificación)
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + dosesLeft);

  const formattedEndDate = endDate.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
  });

  return {
    totalDosesCapacity,
    dosesTaken,
    dosesLeft,
    daysLeft: dosesLeft,
    endDate,
    formattedEndDate,
    isLowStock: dosesLeft <= (pot.warningDaysBefore || 5),
    isExpiredOrEmpty: dosesLeft === 0,
  };
}

// Helper: Normalizar nombres de ingredientes para suma exacta (p.ej. "cafeína anidra" -> "Cafeína")
export function normalizeIngredientName(name: string): string {
  const n = name.trim().toLowerCase();
  if (n.includes('cafeín') || n.includes('caffein')) return 'Cafeína';
  if (n.includes('creatin')) return 'Creatina';
  if (n.includes('beta-alanin') || n.includes('beta alanin')) return 'Beta-alanina';
  if (n.includes('proteín') || n.includes('whey')) return 'Proteína';
  if (n.includes('vitamina c') || n.includes('ácido ascórbico')) return 'Vitamina C';
  if (n.includes('vitamina b12') || n.includes('cobalamin')) return 'Vitamina B12';
  if (n.includes('vitamina d')) return 'Vitamina D';
  if (n.includes('zinco') || n.includes('zinc')) return 'Zinco';
  if (n.includes('magnésio') || n.includes('magnesio')) return 'Magnésio';
  if (n.includes('epa')) return 'EPA (Omega 3)';
  if (n.includes('dha')) return 'DHA (Omega 3)';
  if (n.includes('taurin')) return 'Taurina';
  if (n.includes('bcaa')) return 'BCAA';
  if (n.includes('carboidrato') || n.includes('carbo')) return 'Carboidratos';
  if (n.includes('gordura') || n.includes('lipíd')) return 'Gorduras';
  if (n.includes('caloria') || n.includes('energia')) return 'Calorias';

  // Capitalizar primera letra
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Helper: Sumar ingredientes tomados hoy entre todos los suplementos activos
export interface SummedIngredient {
  name: string;
  totalAmount: number;
  unit: 'g' | 'mg' | 'mcg' | 'kcal';
  sources: {
    potName: string;
    brand: string;
    amount: number;
    unit: string;
    isVerified: boolean;
  }[];
}

export function computeDailyIngredientsIntake(pots: SupplementPot[], targetIsoDate: string): SummedIngredient[] {
  const map: Record<string, SummedIngredient> = {};

  pots.forEach((pot) => {
    // Si tomó este pote en la fecha seleccionada
    const tookToday = pot.dosesHistory.includes(targetIsoDate);
    if (!tookToday) return;

    pot.nutritionFactsPerDose.forEach((fact) => {
      const normalized = normalizeIngredientName(fact.name);
      if (!map[normalized]) {
        map[normalized] = {
          name: normalized,
          totalAmount: 0,
          unit: fact.unit,
          sources: [],
        };
      }

      map[normalized].totalAmount += fact.amount;
      map[normalized].sources.push({
        potName: pot.name,
        brand: pot.brand,
        amount: fact.amount,
        unit: fact.unit,
        isVerified: pot.isStoreVerified,
      });
    });
  });

  return Object.values(map).sort((a, b) => {
    // Prioridad visual: Creatina, Proteína, Cafeína, Beta-alanina al principio
    const priorityOrder = ['Creatina', 'Proteína', 'Cafeína', 'Beta-alanina', 'Calorias'];
    const idxA = priorityOrder.indexOf(a.name);
    const idxB = priorityOrder.indexOf(b.name);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });
}
