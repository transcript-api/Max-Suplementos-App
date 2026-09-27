// Tipos para el sistema integral MAX Suplementos - Nutrition Tracker V1

export interface NutritionFactItem {
  name: string; // ej: "Creatina", "Proteína", "Cafeína", "Beta-alanina", "Vitamina C", "Vitamina B12"
  amount: number; // Cantidad numérica
  unit: 'g' | 'mg' | 'mcg' | 'kcal'; // Unidades absolutas
}

export interface SupplementPot {
  id: string;
  name: string; // ej: "Creatina Creapure 300g", "Whey Protein Isolado"
  brand: string; // ej: "MAX Suplementos", "Growth", "Integralmedica"
  category: 'creatina' | 'proteina' | 'pre-treino' | 'vitaminas' | 'outro';
  totalSize: number; // ej: 300 (g), 900 (g), 60 (cápsulas)
  sizeUnit: 'g' | 'scoops' | 'cápsulas' | 'comprimidos' | 'ml';
  dailyDose: number; // ej: 5 (g), 30 (g), 2 (cápsulas)
  openingDate: string; // YYYY-MM-DD
  openedAtFormatted?: string;
  status: 'ativo' | 'finalizado' | 'pausado';
  isStoreVerified: boolean; // Selo de confirmação da MAX ou "Aguardando confirmação da loja"
  barcode?: string;
  photoUrl?: string;
  // Composição por dose (lido do rótulo ou do catálogo da loja)
  nutritionFactsPerDose: NutritionFactItem[];
  // Histórico de tomas reais (dias marcados: 'YYYY-MM-DD')
  dosesHistory: string[];
  // Configuração de aviso
  warningDaysBefore: number; // Por padrão 4 dias antes de terminar
}

export type PlanType = 'gratis' | 'vip';

export interface V1AppConfig {
  plan: PlanType;
  storeWhatsApp: string; // WhatsApp de MAX Suplementos
  storeCatalog: SupplementPotCatalogItem[];
}

export interface SupplementPotCatalogItem {
  barcode: string;
  name: string;
  brand: string;
  category: 'creatina' | 'proteina' | 'pre-treino' | 'vitaminas' | 'outro';
  defaultSize: number;
  sizeUnit: 'g' | 'scoops' | 'cápsulas' | 'comprimidos' | 'ml';
  defaultDose: number;
  nutritionFacts: NutritionFactItem[];
  isVerified: boolean;
}
