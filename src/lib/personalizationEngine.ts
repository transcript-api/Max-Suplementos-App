/**
 * personalizationEngine.ts
 * Motor central de personalizacion de MAX Suplementos
 * Genera contenido, mensajes, tips, suplementos y metricas
 * adaptados al OBJETIVO (goal) y NIVEL DE DESAFIO del usuario.
 */

import { CommitmentLevel } from '../types';

// TIPOS

export type PrimaryGoal =
  | 'Ganar masa muscular'
  | 'Perder grasa'
  | 'Mejorar mi rendimiento'
  | 'Mejorar mi alimentacion'
  | 'Crear constancia'
  | 'Mejorar mi condicion fisica'
  | 'Mejorar mis habitos';

export type TrainingModality = 'gimnasio' | 'calistenia' | 'running_endurance' | 'hibrido_cross';

export const AVAILABLE_MODALITIES: { id: TrainingModality; label: string; icon: string; description: string }[] = [
  { id: 'gimnasio', label: 'Gimnasio & Hipertrofia', icon: 'fitness_center', description: 'Sobrecarga progresiva, cargas externas y tensión mecánica' },
  { id: 'calistenia', label: 'Calistenia & Peso Corporal', icon: 'sports_gymnastics', description: 'Fuerza relativa, control neuromuscular y movilidad' },
  { id: 'running_endurance', label: 'Running & Resistencia', icon: 'directions_run', description: 'Eficiencia cardiovascular, umbral de lactato y VO2 máx' },
  { id: 'hibrido_cross', label: 'Atleta Híbrido & CrossFit', icon: 'all_inclusive', description: 'Fuerza combinada con alta exigencia metabólica mixta' },
];

export type TimeWindow = 'madrugada' | 'manana' | 'tarde' | 'noche';

export const AVAILABLE_WINDOWS: { id: TimeWindow; label: string; icon: string; hours: string; description: string }[] = [
  { id: 'madrugada', label: 'Madrugada (Regeneración)', icon: 'bedtime', hours: '00:00 - 05:59', description: 'Reparación celular profunda y optimización de GH nocturno' },
  { id: 'manana', label: 'Mañana (Activación)', icon: 'wb_sunny', hours: '06:00 - 11:59', description: 'Activación circadiana, 600ml de agua y carga de electrolitos' },
  { id: 'tarde', label: 'Tarde (Ventana de Fuerza)', icon: 'bolt', hours: '12:00 - 18:59', description: 'Pico de temperatura corporal y máximo rendimiento neuromuscular' },
  { id: 'noche', label: 'Noche (Recuperación)', icon: 'dark_mode', hours: '19:00 - 23:59', description: 'Cierre proteico, magnesio y desconexión para el descanso' },
];

export interface PersonalizedContent {
  greeting: string;
  homeSubtitle: string;
  dailyTip: string;
  coachQuote: string;
  nutritionCardLabel: string;
  caloricBalanceLabel: string;
  caloricBalanceValue: 'superavit' | 'deficit' | 'mantenimiento';
  recommendedSupplements: RecommendedSupplement[];
  keyMetrics: KeyMetric[];
  aiWelcomeMessage: string;
  modeBadge: string;
  modeBadgeColor: string;
  levelAlert?: string;
  challengeTitle: string;
  challengeDescription: string;
  timeWindowBadge: string;
  timeWindowDescription: string;
  trainingModalityLabel: string;
  windowSupplements: RecommendedSupplement[];
  streakStatusQuote: string;
}

export interface RecommendedSupplement {
  name: string;
  dose: string;
  timing: string;
  priority: 'esencial' | 'recomendado' | 'opcional';
  reason: string;
  icon: string;
}

export interface KeyMetric {
  id: string;
  label: string;
  icon: string;
  accentColor: string;
  description: string;
}

export const AVAILABLE_GOALS: { id: PrimaryGoal; label: string; icon: string; description: string }[] = [
  { id: 'Ganar masa muscular', label: 'Ganar masa muscular', icon: 'fitness_center', description: 'Hipertrofia, síntesis proteica y sobrecarga progresiva' },
  { id: 'Perder grasa', label: 'Perder grasa corporal', icon: 'local_fire_department', description: 'Déficit calórico controlado y preservación muscular' },
  { id: 'Mejorar mi rendimiento', label: 'Rendimiento atlético', icon: 'bolt', description: 'Potencia, resistencia neuromuscular y recuperación' },
  { id: 'Mejorar mi alimentacion', label: 'Mejorar alimentación', icon: 'restaurant', description: 'Calidad de macros, densidad nutricional y balance' },
  { id: 'Crear constancia', label: 'Crear constancia', icon: 'repeat', description: 'Construcción de hábitos sólidos y cero deserción' },
  { id: 'Mejorar mi condicion fisica', label: 'Condición física', icon: 'favorite', description: 'Capacidad cardiovascular, movilidad y energía' },
  { id: 'Mejorar mis habitos', label: 'Hábitos diarios', icon: 'bedtime', description: 'Sueño reparador, hidratación y bienestar integral' },
];

export const AVAILABLE_LEVELS: { id: CommitmentLevel; label: string; tag: string; color: string; description: string }[] = [
  { id: 'Básico', label: 'Básico (Iniciación)', tag: 'TITANIO MATE', color: '#898a8c', description: '3 entrenos/semana, metas sencillas, foco en no abandonar' },
  { id: 'Intermedio', label: 'Intermedio (Progreso)', tag: 'ACERO PULIDO', color: '#d6d6d6', description: '4 entrenos/semana, suplementación clave y balance calórico' },
  { id: 'Avanzado', label: 'Avanzado (Alto Rendimiento)', tag: 'PLATINO RADIANTE', color: '#d6d6d6', description: '5 entrenos/semana, macros pesados y timing de tomas' },
  { id: 'Extremo', label: 'Extremo (Tolerancia Cero)', tag: 'DIAMANTE ÉLITE', color: '#ffffff', description: 'Protocolo de competición, disciplina total, 6 tareas diarias' },
];

export function normalizeGoal(rawGoal?: string): PrimaryGoal {
  const g = (rawGoal || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (g.includes('masa') || g.includes('hipertrofia') || g.includes('musculo')) return 'Ganar masa muscular';
  if (g.includes('grasa') || g.includes('definicion') || g.includes('peso') || g.includes('bajar')) return 'Perder grasa';
  if (g.includes('rendimiento') || g.includes('fuerza') || g.includes('potencia')) return 'Mejorar mi rendimiento';
  if (g.includes('alimentacion') || g.includes('nutricion') || g.includes('comer')) return 'Mejorar mi alimentacion';
  if (g.includes('condicion') || g.includes('salud') || g.includes('aerobico')) return 'Mejorar mi condicion fisica';
  if (g.includes('habito') || g.includes('rutina')) return 'Mejorar mis habitos';
  return 'Crear constancia';
}

export function normalizeLevel(rawLevel?: string): 'Básico' | 'Intermedio' | 'Avanzado' | 'Extremo' {
  const l = (rawLevel || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (l.includes('extremo') || l.includes('elite')) return 'Extremo';
  if (l.includes('avanzado')) return 'Avanzado';
  if (l.includes('intermedio')) return 'Intermedio';
  return 'Básico';
}

export function getCurrentTimeWindow(): TimeWindow {
  const h = new Date().getHours();
  if (h < 6) return 'madrugada';
  if (h < 12) return 'manana';
  if (h < 19) return 'tarde';
  return 'noche';
}

export function getPersonalizedContent(
  goal?: string,
  level?: CommitmentLevel,
  name: string = 'Atleta',
  weight: number = 70,
  modality: TrainingModality = 'gimnasio',
  windowOverride?: TimeWindow,
  streakDays: number = 0
): PersonalizedContent {
  const normGoal = normalizeGoal(goal);
  const normLevel = normalizeLevel(level);
  const activeWindow = windowOverride || getCurrentTimeWindow();

  const greetings = buildGreetings(name, normGoal, normLevel as any, activeWindow, modality);
  const nutrition = buildNutritionContent(normGoal, normLevel as any);
  const supplements = buildSupplements(normGoal, normLevel as any, modality);
  const metrics = buildKeyMetrics(normGoal, normLevel as any, modality);
  const ai = buildAiMessage(name, normGoal, normLevel as any, modality, activeWindow);
  const challenge = buildChallengeContent(normGoal, normLevel as any, streakDays);
  const badge = buildBadge(normGoal, normLevel as any);
  const windowData = buildTimeWindowData(activeWindow, supplements, modality);
  const streakData = buildStreakData(streakDays, normLevel as any);

  return {
    ...greetings,
    ...nutrition,
    recommendedSupplements: supplements,
    keyMetrics: metrics,
    aiWelcomeMessage: ai,
    ...challenge,
    ...badge,
    ...windowData,
    ...streakData,
  };
}

function buildGreetings(
  name: string,
  goal: string,
  level: CommitmentLevel,
  window: TimeWindow = 'manana',
  modality: TrainingModality = 'gimnasio'
) {
  const windowGreets: Record<TimeWindow, string> = {
    madrugada: 'Buenas noches',
    manana: 'Buenos días',
    tarde: 'Buenas tardes',
    noche: 'Buenas noches',
  };
  const timeGreet = windowGreets[window] || 'Buenos días';

  const subtitleMap: Record<string, Record<CommitmentLevel, string>> = {
    'Ganar masa muscular': {
      Básico: 'Primeros pasos en hipertrofia. La constancia es tu herramienta.',
      Intermedio: 'Construyendo masa muscular con disciplina estructurada.',
      Avanzado: 'Sobrecarga progresiva y superavit limpio en marcha.',
      Extremo: 'Protocolo de hipertrofia elite activo. Cada gramo cuenta.',
    },
    'Perder grasa': {
      Básico: 'Deficit suave y sostenible. La grasa se va poco a poco.',
      Intermedio: 'Quemando grasa sin perder rendimiento ni musculo.',
      Avanzado: 'Deficit inteligente con preservacion de musculo activo.',
      Extremo: 'Deficit calorico de precision. Sin masa magra comprometida.',
    },
    'Mejorar mi rendimiento': {
      Básico: 'Mejorando tu capacidad fisica paso a paso.',
      Intermedio: 'Mas fuerza, mas resistencia, mejor version atletica.',
      Avanzado: 'Optimizando cada variable del rendimiento fisico.',
      Extremo: 'Potencia neuromuscular y recuperacion metabolica elite.',
    },
    'Mejorar mi alimentacion': {
      Básico: 'Mejorando tus habitos alimenticios de a poco y sin presion.',
      Intermedio: 'Aprendiendo a comer mejor sin restricciones absurdas.',
      Avanzado: 'Nutricion funcional con control de macros y micronutrientes.',
      Extremo: 'Nutricion de precision. Calidad al milimetro.',
    },
    'Crear constancia': {
      Básico: 'Empezando el habito mas poderoso: moverse todos los dias.',
      Intermedio: 'Construyendo la racha de tu vida, dia a dia.',
      Avanzado: 'Sistema de habitos de alto rendimiento activo.',
      Extremo: 'Disciplina total. Sin excepciones, sin excusas.',
    },
    'Mejorar mi condicion fisica': {
      Básico: 'Activando tu cuerpo con movimiento progresivo y sin lesiones.',
      Intermedio: 'Mas energia, mejor resistencia y movilidad.',
      Avanzado: 'Capacidad aerobica y fuerza funcional en maximo nivel.',
      Extremo: 'Acondicionamiento cardiovascular y funcional elite.',
    },
    'Mejorar mis habitos': {
      Básico: 'Tres habitos simples hoy que cambian tu vida manana.',
      Intermedio: 'Sueno, hidratacion y balance diario en construccion.',
      Avanzado: 'Habitos de alto impacto consolidados cada dia.',
      Extremo: 'Protocolo de vida elite. Sueno, hidratacion y rutina perfecta.',
    },
  };

  const tipMap: Record<string, Record<CommitmentLevel, string>> = {
    'Ganar masa muscular': {
      Básico: 'Empeza con 3 entrenos semanales. La regularidad supera a la intensidad en esta etapa.',
      Intermedio: 'Asegurate de llegar a tu meta proteica diaria. La creatina monohidrato es tu mejor aliada ahora.',
      Avanzado: 'Distribuci tu proteina en 4 tomas con al menos 3-4h de separacion para maximizar sintesis proteica.',
      Extremo: 'Consume proteina de alto VB dentro de los 30 min post-entreno. Activa mTOR con 3g de leucina por toma.',
    },
    'Perder grasa': {
      Básico: 'Prioriza comer proteina en cada comida. Te mantiene saciado y preserva el musculo mientras perdes grasa.',
      Intermedio: 'No elimines los carbos. Reubicalos. Consomilos antes y despues del entreno para rendimiento.',
      Avanzado: 'El cardio HIIT post-fuerza maximiza la oxidacion de grasas sin catabolismo.',
      Extremo: 'Mantene un deficit maximo de 400-500 kcal. Mas no es mejor. Protege tu tejido muscular con 2.2g/kg de proteina.',
    },
    'Mejorar mi rendimiento': {
      Básico: 'Calienta siempre antes de entrenar. Movilidad articular + 5 min cardio ligero evitan lesiones.',
      Intermedio: 'Creatina monohidrato 5g diarios. Es el suplemento mas respaldado por ciencia.',
      Avanzado: 'La hidratacion es tu rendimiento. Perder solo el 2% de agua reduce la potencia un 10%.',
      Extremo: 'Sincroniza el timing de creatina (pre+post), cafeina (150-200mg) y carbos intra-entreno.',
    },
    'Mejorar mi alimentacion': {
      Básico: 'Empieza por reemplazar las bebidas azucaradas por agua. Ese solo gesto cambia todo.',
      Intermedio: 'El plato saludable: 50% verduras, 25% proteina, 25% carbos complejos.',
      Avanzado: 'Distribuye los macros en 4-5 comidas. Proteina alta en cada una.',
      Extremo: 'Usa el registro de comidas para identificar brechas en micronutrientes.',
    },
    'Crear constancia': {
      Básico: 'Ley del 2 minutos: Si algo toma menos de 2 minutos, hacelo ahora mismo.',
      Intermedio: 'Tracking visual de habitos: ver tu racha activa es el motivador mas poderoso.',
      Avanzado: 'Disenya un ritual de inicio de dia. Los primeros 30 minutos determinan el tono del dia.',
      Extremo: 'Bloquea las 6:00-7:00 AM para tus tareas clave antes de que el mundo te interrumpa.',
    },
    'Mejorar mi condicion fisica': {
      Básico: 'Camina 8.000 pasos hoy. Es gratuito, sin equipo y cambia tu metabolismo en 3 semanas.',
      Intermedio: 'Progresa de a poco: si hoy hiciste 3km, la semana que viene intenta 3.5km.',
      Avanzado: 'Monitorea tu zona cardiaca. El 70-80% FC max durante 35+ minutos es la zona optima.',
      Extremo: 'Combina HIIT y LISS en la misma semana. HIIT 3 veces (20 min) y LISS 2 veces (40-50 min).',
    },
    'Mejorar mis habitos': {
      Básico: 'Dormite y levantate a la misma hora todos los dias, incluso el fin de semana.',
      Intermedio: 'Empieza la manana con 500ml de agua antes del primer cafe.',
      Avanzado: 'Revisa tus 5 habitos clave: sueno 7.5h+, 3L de agua, 30 min de movimiento.',
      Extremo: 'El sueno es el suplemento mas poderoso. 8 horas en oscuridad total libera 3x mas GH.',
    },
  };

  const subtitle = subtitleMap[goal]?.[level] ?? subtitleMap['Crear constancia'][level];
  const tip = tipMap[goal]?.[level] ?? tipMap['Crear constancia'][level];

  return {
    greeting: `${timeGreet}, ${name}`,
    homeSubtitle: subtitle,
    dailyTip: tip,
    coachQuote: getCoachQuote(goal, level),
  };
}

function getCoachQuote(goal: string, level: CommitmentLevel): string {
  if (level === 'Extremo') return '"La excelencia no es un acto aislado, es un habito innegociable."';
  if (level === 'Avanzado') return '"La diferencia entre lo ordinario y lo extraordinario es la precision en los detalles."';
  if (goal === 'Ganar masa muscular') return '"El musculo se gana en el gym, pero se construye en la cocina y en el sueno."';
  if (goal === 'Perder grasa') return '"La bascula miente. Mira el espejo, la ropa y como te sentis."';
  return '"No necesitas motivacion para comenzar. Necesitas comenzar para encontrar la motivacion."';
}

function buildNutritionContent(goal: string, level: CommitmentLevel) {
  const caloricMap: Record<string, { label: string; value: 'superavit' | 'deficit' | 'mantenimiento' }> = {
    'Ganar masa muscular': { label: 'Superavit limpio', value: 'superavit' },
    'Perder grasa': { label: 'Deficit controlado', value: 'deficit' },
    'Mejorar mi rendimiento': { label: 'Mantenimiento + carga', value: 'mantenimiento' },
    'Mejorar mi alimentacion': { label: 'Balance nutricional', value: 'mantenimiento' },
    'Crear constancia': { label: 'Mantenimiento base', value: 'mantenimiento' },
    'Mejorar mi condicion fisica': { label: 'Deficit suave', value: 'deficit' },
    'Mejorar mis habitos': { label: 'Equilibrio calorico', value: 'mantenimiento' },
  };

  const nutritionLabels: Record<string, string> = {
    'Ganar masa muscular': 'Anabolismo Activo',
    'Perder grasa': 'Quema de Grasa',
    'Mejorar mi rendimiento': 'Combustible de Rendimiento',
    'Mejorar mi alimentacion': 'Calidad Nutricional',
    'Crear constancia': 'Nutricion Diaria',
    'Mejorar mi condicion fisica': 'Combustible Activo',
    'Mejorar mis habitos': 'Balance Saludable',
  };

  const caloric = caloricMap[goal] ?? { label: 'Mantenimiento', value: 'mantenimiento' as const };

  return {
    nutritionCardLabel: nutritionLabels[goal] ?? 'Nutricion',
    caloricBalanceLabel: caloric.label,
    caloricBalanceValue: caloric.value,
  };
}

function buildSupplements(
  goal: string,
  level: CommitmentLevel,
  modality: TrainingModality = 'gimnasio'
): RecommendedSupplement[] {
  const base: RecommendedSupplement[] = [];

  if (level !== 'Básico' || goal === 'Ganar masa muscular') {
    base.push({
      name: 'Creatina Monohidrato',
      dose: level === 'Extremo' ? '5g exactos' : '3-5g',
      timing: level === 'Extremo' ? 'Post-entreno (dentro de 30 min)' : 'Post-entreno o con desayuno',
      priority: (goal === 'Ganar masa muscular' || goal === 'Mejorar mi rendimiento') ? 'esencial' : 'recomendado',
      reason: 'Aumenta la fosfocreatina muscular, mejora fuerza y potencia entre un 10-15%.',
      icon: 'science',
    });
  }

  if (goal === 'Ganar masa muscular' || goal === 'Perder grasa' || goal === 'Mejorar mi rendimiento' || level === 'Avanzado' || level === 'Extremo') {
    base.push({
      name: 'Proteina Whey',
      dose: level === 'Extremo' ? '30-40g (aislado)' : '25-30g',
      timing: 'Post-entreno o entre comidas',
      priority: goal === 'Ganar masa muscular' ? 'esencial' : 'recomendado',
      reason: 'Perfil completo de aminoacidos esenciales. Acelera la sintesis proteica post-ejercicio.',
      icon: 'egg_alt',
    });
  }

  if (goal === 'Mejorar mi rendimiento' || goal === 'Ganar masa muscular' || level === 'Extremo' || level === 'Avanzado') {
    base.push({
      name: 'Pre-entreno (Cafeina + Beta-alanina)',
      dose: level === 'Extremo' ? '1 porcion completa (150-200mg cafeina)' : '1/2 a 1 porcion',
      timing: '20-30 min antes del entreno',
      priority: goal === 'Mejorar mi rendimiento' ? 'esencial' : 'opcional',
      reason: 'Mejora el enfoque, la tolerancia al dolor muscular y la potencia de salida.',
      icon: 'local_fire_department',
    });
  }

  if (level === 'Avanzado' || level === 'Extremo' || goal === 'Mejorar mis habitos' || goal === 'Mejorar mi alimentacion') {
    base.push({
      name: 'Multivitaminico',
      dose: '1 comprimido / capsula',
      timing: 'Con el desayuno',
      priority: level === 'Extremo' ? 'esencial' : 'recomendado',
      reason: 'Cubre brechas de micronutrientes que impactan en energia, inmunidad y recuperacion.',
      icon: 'medication',
    });
  }

  if (goal === 'Mejorar mi alimentacion' || goal === 'Mejorar mis habitos' || level === 'Avanzado' || level === 'Extremo') {
    base.push({
      name: 'Omega-3 (EPA + DHA)',
      dose: '2-3g de EPA/DHA combinados',
      timing: 'Con la comida principal',
      priority: 'recomendado',
      reason: 'Reduce inflamacion sistemica, mejora la recuperacion articular y funcion cardiovascular.',
      icon: 'water_drop',
    });
  }

  if (level === 'Extremo' || goal === 'Mejorar mi rendimiento' || goal === 'Mejorar mi condicion fisica') {
    base.push({
      name: 'Electrolitos (Sodio + Potasio + Magnesio)',
      dose: '1 porcion en 500ml de agua',
      timing: 'Intra-entreno o post-ejercicio intenso',
      priority: level === 'Extremo' ? 'esencial' : 'opcional',
      reason: 'Previene calambres, mantiene el volumen plasmatico y mejora la contraccion muscular.',
      icon: 'bolt',
    });
  }

  if (goal === 'Mejorar mi condicion fisica' || goal === 'Mejorar mis habitos' || level === 'Básico') {
    base.push({
      name: 'Colageno + Vitamina C',
      dose: '10g de colageno + 100mg Vit C',
      timing: '30 min antes del entrenamiento o antes de dormir',
      priority: 'opcional',
      reason: 'Apoya tendones, cartílagos y articulaciones. Ideal en inicio o recuperacion.',
      icon: 'healing',
    });
  }

  return base;
}

function buildKeyMetrics(
  goal: string,
  level: CommitmentLevel,
  modality: TrainingModality = 'gimnasio'
): KeyMetric[] {
  const allMetrics: KeyMetric[] = [
    { id: 'protein', label: 'Proteína', icon: 'egg_alt', accentColor: '#d6d6d6', description: 'Gramos consumidos vs. tu meta diaria' },
    { id: 'calories', label: 'Calorías', icon: 'local_fire_department', accentColor: '#d6d6d6', description: 'Balance calórico del día' },
    { id: 'hydration', label: 'Hidratación', icon: 'water_drop', accentColor: '#898a8c', description: 'Litros consumidos hoy' },
    { id: 'training', label: 'Entrenamiento', icon: 'fitness_center', accentColor: '#ffffff', description: 'Sesión completada del día' },
    { id: 'sleep', label: 'Sueño', icon: 'bedtime', accentColor: '#898a8c', description: 'Calidad de descanso nocturno' },
    { id: 'supplements', label: 'Suplementos', icon: 'medication', accentColor: '#d6d6d6', description: 'Tomas completadas hoy' },
    { id: 'streak', label: 'Racha', icon: 'local_fire_department', accentColor: '#ffffff', description: 'Días consecutivos completados' },
    { id: 'carbs', label: 'Carbohidratos', icon: 'grain', accentColor: '#898a8c', description: 'Carbos consumidos vs. meta' },
  ];

  const priorityMap: Record<string, string[]> = {
    'Ganar masa muscular': ['protein', 'calories', 'training', 'supplements', 'hydration', 'sleep'],
    'Perder grasa': ['calories', 'protein', 'hydration', 'training', 'streak', 'sleep'],
    'Mejorar mi rendimiento': ['training', 'protein', 'hydration', 'supplements', 'sleep', 'carbs'],
    'Mejorar mi alimentacion': ['calories', 'protein', 'carbs', 'hydration', 'streak', 'supplements'],
    'Crear constancia': ['streak', 'training', 'hydration', 'protein', 'sleep', 'calories'],
    'Mejorar mi condicion fisica': ['training', 'hydration', 'calories', 'streak', 'protein', 'sleep'],
    'Mejorar mis habitos': ['sleep', 'hydration', 'streak', 'protein', 'calories', 'supplements'],
  };

  const levelCount: Record<CommitmentLevel, number> = { Básico: 3, Intermedio: 4, Avanzado: 5, Extremo: 6 };
  const priority = priorityMap[goal] ?? priorityMap['Crear constancia'];
  const count = levelCount[level] ?? 3;

  return priority.slice(0, count).map((id) => allMetrics.find((m) => m.id === id)).filter(Boolean) as KeyMetric[];
}

function buildAiMessage(
  name: string,
  goal: string,
  level: CommitmentLevel,
  modality: TrainingModality = 'gimnasio',
  window: TimeWindow = 'manana'
): string {
  const modalityHint = modality === 'gimnasio' ? 'fuerza e hipertrofia con sobrecarga' : modality === 'calistenia' ? 'fuerza relativa y control neuromuscular' : modality === 'running_endurance' ? 'capacidad aeróbica y umbral de lactato' : 'acondicionamiento híbrido';

  const levelPersona: Record<CommitmentLevel, string> = {
    Básico: `Hola ${name}, soy MAX. Tu protocolo está calibrado en ${goal.toLowerCase()} con foco en ${modalityHint}. Mi meta es guiarte con pasos simples, sostenibles y precisos. ¿En qué nos enfocamos hoy?`,
    Intermedio: `Hola ${name}, soy MAX. Optimizando tu progreso en ${goal.toLowerCase()} enfocado en ${modalityHint}. Monitoreamos tomas, consistencia y nutrientes clave. ¿Qué duda resolvemos ahora?`,
    Avanzado: `${name}, protocolo de alto rendimiento activo en ${goal.toLowerCase()} (${modalityHint}). Control milimétrico de timing de ingesta, superávit/déficit exacto y recuperación celular. ¿Qué variable optimizamos hoy?`,
    Extremo: `PROTOCOLO ÉLITE ACTIVO, ${name}. Soy MAX. Cero concesiones en ${goal.toLowerCase()} para ${modalityHint}. Precisión fisiológica total al gramo. ¿Qué parámetro auditamos hoy?`,
  };
  return levelPersona[level] ?? levelPersona['Básico'];
}

function buildChallengeContent(goal: string, level: CommitmentLevel, streakDays: number = 0) {
  const defaultChallenges: Record<CommitmentLevel, { title: string; description: string }> = {
    Básico: {
      title: 'Desafio Básico: El Habito Diario',
      description: 'Completa tus 3 objetivos del dia, 7 dias seguidos. Sin romper la racha.',
    },
    Intermedio: {
      title: 'Desafio Intermedio: Constancia Atletica',
      description: 'Completa los 4 objetivos diarios durante 14 dias seguidos. Aqui empieza la transformacion real.',
    },
    Avanzado: {
      title: 'Desafio Avanzado: Sistema de Excelencia',
      description: 'Completa 5 objetivos diarios durante 21 dias. Cero fallos. Monitoreo completo de metricas.',
    },
    Extremo: {
      title: 'DESAFIO ELITE: Protocolo Tolerancia Cero',
      description: 'Cero objetivos fallados. Cero excusas. 6 tareas diarias. 30 dias de disciplina total.',
    },
  };

  const goalSpecific: Partial<Record<string, Partial<Record<CommitmentLevel, { title: string; description: string }>>>> = {
    'Ganar masa muscular': {
      Básico: { title: 'Desafio Básico: Primera Semana Muscular', description: 'Completa 3 entrenos esta semana, consume tu proteina diaria y toma 2L de agua.' },
      Intermedio: { title: 'Desafio Intermedio: Mes de Hipertrofia', description: '4 entrenos semanales con sobrecarga progresiva. Meta proteica cumplida cada dia. Creatina 5g sin fallar.' },
      Avanzado: { title: 'Desafio Avanzado: Protocolo Hipertrofia Elite', description: '5 entrenos semanales RPE 8-9. Proteina 2g/kg. Creatina + Whey + multivitaminico. Auditoria semanal de progreso.' },
      Extremo: { title: 'DESAFIO ELITE: Hipertrofia Tolerancia Cero', description: 'Protocolo completo activo 6 dias. Macros exactos al gramo. 6 objetivos diarios. Sin una sola excusa en 30 dias.' },
    },
    'Perder grasa': {
      Básico: { title: 'Desafio Básico: Arranque Saludable', description: 'Camina 20 minutos diarios, reemplaza una comida procesada y toma agua en lugar de gaseosa.' },
      Intermedio: { title: 'Desafio Intermedio: Recomposicion 30 Dias', description: 'Deficit calorico controlado con metas proteicas altas. Entrenos 4x semana. Racha de 30 dias.' },
      Avanzado: { title: 'Desafio Avanzado: Definicion de Alto Rendimiento', description: 'Deficit 350 kcal con proteina 1.9g/kg. Cardio HIIT + fuerza. Sin perdida de masa magra.' },
      Extremo: { title: 'DESAFIO ELITE: Definicion Extrema', description: 'Deficit quirurgico. Proteina 2.2g/kg pesada. Cardio HIIT 5x + fuerza 5x. Registro total de macros al gramo.' },
    },
  };

  const specific = goalSpecific[goal]?.[level];
  const fallback = defaultChallenges[level];
  const chosen = specific ?? fallback;

  return {
    challengeTitle: chosen.title,
    challengeDescription: chosen.description,
  };
}

function buildBadge(goal: string, level: CommitmentLevel) {
  const goalShort: Record<string, string> = {
    'Ganar masa muscular': 'HIPERTROFIA',
    'Perder grasa': 'QUEMA DE GRASA',
    'Mejorar mi rendimiento': 'RENDIMIENTO',
    'Mejorar mi alimentacion': 'NUTRICIÓN',
    'Crear constancia': 'CONSTANCIA',
    'Mejorar mi condicion fisica': 'CONDICIÓN FÍSICA',
    'Mejorar mis habitos': 'HÁBITOS',
  };

  const levelColors: Record<CommitmentLevel, string> = {
    Básico: '#898a8c',
    Intermedio: '#d6d6d6',
    Avanzado: '#d6d6d6',
    Extremo: '#ffffff',
  };

  const levelAlert: Record<CommitmentLevel, string | undefined> = {
    Básico: undefined,
    Intermedio: undefined,
    Avanzado: 'Nivel Avanzado. Protocolo de alta exigencia metabólica y timing de nutrientes activo.',
    Extremo: 'PROTOCOLO ÉLITE ACTIVO. Tolerancia Cero. Rendimiento absoluto sin concesiones.',
  };

  return {
    modeBadge: `${level.toUpperCase()} · ${goalShort[goal] ?? 'PERSONALIZADO'}`,
    modeBadgeColor: levelColors[level] ?? '#ffffff',
    levelAlert: levelAlert[level],
  };
}

function buildTimeWindowData(
  window: TimeWindow,
  allSupplements: RecommendedSupplement[],
  modality: TrainingModality
) {
  const windowTitles: Record<TimeWindow, string> = {
    madrugada: 'VENTANA MADRUGADA · REGENERACIÓN PROFUNDA',
    manana: 'VENTANA MATUTINA · ACTIVACIÓN METABÓLICA',
    tarde: 'VENTANA TARDE · POTENCIA NEUROMUSCULAR',
    noche: 'VENTANA NOCHE · RECUPERACIÓN & SÍNTESIS',
  };

  const windowDesc: Record<TimeWindow, string> = {
    madrugada: 'Fase de reparación celular y reposición neuroendocrina. Prioriza hidratación limpia al despertar.',
    manana: 'Pico de alerta circadiano. 600ml de agua + creatina para saturación de fosfocreatina muscular.',
    tarde: 'Pico de temperatura corporal. Ventana óptima para sesión de fuerza y absorción de aminoácidos.',
    noche: 'Cierre de ventana anabólica. Cero cafeína residual, magnesio y descanso celular innegociable.',
  };

  const modalityNames: Record<TrainingModality, string> = {
    gimnasio: 'Hipertrofia & Sobrecarga Progresiva',
    calistenia: 'Calistenia & Tensión Estática',
    running_endurance: 'Endurance & Capacidad Aeróbica',
    hibrido_cross: 'CrossFit & Atleta Híbrido',
  };

  const windowSupps = allSupplements.filter((s) => {
    const t = s.timing.toLowerCase();
    if (window === 'manana' && (t.includes('mañana') || t.includes('desayuno') || t.includes('ayunas'))) return true;
    if (window === 'tarde' && (t.includes('entreno') || t.includes('pre') || t.includes('post') || t.includes('tarde'))) return true;
    if (window === 'noche' && (t.includes('noche') || t.includes('dormir') || t.includes('cena'))) return true;
    return s.priority === 'esencial';
  });

  return {
    timeWindowBadge: windowTitles[window],
    timeWindowDescription: windowDesc[window],
    trainingModalityLabel: modalityNames[modality],
    windowSupplements: windowSupps.length > 0 ? windowSupps : allSupplements.slice(0, 2),
  };
}

function buildStreakData(streak: number, level: CommitmentLevel) {
  let quote = '';
  if (streak === 0) {
    quote = 'Día 1: Toda gran transformación atlética comienza con un solo día ejecutado a la perfección.';
  } else if (streak < 4) {
    quote = `${streak} días consecutivos: La inercia está arrancando. Protege esta racha como tu mayor activo.`;
  } else if (streak < 14) {
    quote = `${streak} días ininterrumpidos: El hábito ya es parte de tu identidad. Estás superando al 95% de la media.`;
  } else {
    quote = `Racha de Acero (${streak} días): Maestría y disciplina total. Eres la encarnación del protocolo Élite.`;
  }

  return {
    streakStatusQuote: quote,
  };
}

export function getMealFocusTags(goal: string): string[] {
  const map: Record<string, string[]> = {
    'Ganar masa muscular': ['alta proteina', 'hipertrofia', 'superavit', 'leucina'],
    'Perder grasa': ['bajo en calorias', 'alta saciedad', 'alta proteina', 'deficit'],
    'Mejorar mi rendimiento': ['pre-entreno', 'carbos complejos', 'electrolitos', 'recuperacion'],
    'Mejorar mi alimentacion': ['equilibrado', 'micronutrientes', 'fibra', 'natural'],
    'Crear constancia': ['facil de preparar', 'meal prep', 'practico'],
    'Mejorar mi condicion fisica': ['energia', 'ligero', 'pre-actividad'],
    'Mejorar mis habitos': ['natural', 'sin procesados', 'digestivo', 'equilibrado'],
  };
  return map[goal] ?? ['equilibrado'];
}

export function getCaloricBalanceColor(value: 'superavit' | 'deficit' | 'mantenimiento'): string {
  return value === 'superavit' ? '#d6d6d6' : value === 'deficit' ? '#d6d6d6' : '#898a8c';
}

export function getHomeWelcomeMessage(name: string, goal: string, level: CommitmentLevel): string {
  const hour = new Date().getHours();
  if (hour < 6) return `Es de madrugada, ${name}. El descanso nocturno es donde se construye el progreso.`;
  if (hour < 12) return `Buenos días, ${name}. Ejecuta tu primer bloque de disciplina para ${goal.toLowerCase()}.`;
  if (hour < 17) return `Mantén el ritmo, ${name}. La tarde es propicia para consolidar tus objetivos.`;
  if (hour < 21) return `Buenas tardes, ${name}. ¿Has completado tu hidratación y metas de hoy?`;
  return `Buenas noches, ${name}. Cierra el registro antes de descansar para sellar tu racha.`;
}

