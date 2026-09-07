export interface RecipeIngredient {
  name: string;
  quantity: string;
  note?: string;
}

export interface RecipeItem {
  id: string;
  name: string;
  country: 'uruguay' | 'brasil' | 'frontera';
  countryLabel: string;
  flag: string;
  category: 'almuerzo_cena' | 'desayuno_merienda' | 'post_entreno' | 'snack_rapido';
  categoryLabel: string;
  goal: 'hipertrofia' | 'definicion' | 'rendimiento' | 'rapido';
  goalLabel: string;
  protein: number; // en gramos
  calories: number; // en kcal
  carbs: number; // en gramos
  fats: number; // en gramos
  fiber?: number; // en gramos
  prepTimeMinutes: number;
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado';
  xpReward: number;
  image: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  nutritionTip: string;
  isCustom?: boolean;
}

export const INITIAL_RECIPES: RecipeItem[] = [
  // ==========================================
  // 🇺🇾 URUGUAY (Platos Rioplatenses Fitness)
  // ==========================================
  {
    id: 'uy-chivito-al-plato-fit',
    name: 'Chivito al Plato Fit Rioplatense',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 52,
    calories: 540,
    carbs: 22,
    fats: 16,
    prepTimeMinutes: 20,
    difficulty: 'Fácil',
    xpReward: 30,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    description: 'La versión definitiva de alto rendimiento del clásico nacional uruguayo. Sin el pan blanco calórico ni mayonesa pesada, pero con lomo magro, jamón cocido natural, huevos a la plancha, morrones y ensalada fresca.',
    ingredients: [
      { name: 'Bife de lomo vacuno magro', quantity: '200g' },
      { name: 'Jamón cocido magro / pechuga feteada', quantity: '40g' },
      { name: 'Queso magro o dambo light', quantity: '30g' },
      { name: 'Huevos a la plancha', quantity: '2 unidades' },
      { name: 'Tomate redondo y lechuga criolla', quantity: '150g' },
      { name: 'Morrones rojos asados', quantity: '50g' },
      { name: 'Aceite de oliva virgen extra', quantity: '1 cucharadita (5ml)' }
    ],
    instructions: [
      'Dorar el bife de lomo en una plancha bien caliente con una gota de oliva y sal marina durante 3 minutos por lado.',
      'En la misma plancha, sellar el jamón magro y derretir el queso encima del bife.',
      'Cocinar los 2 huevos a la plancha con spray vegetal hasta que la clara cuaje conservando la yema tierna.',
      'Montar una base generosa de lechuga, tomate en rodajas y morrones asados.',
      'Coronar con el lomo con queso y los huevos a la plancha. Condimentar con orégano y pimienta negra recién molida.'
    ],
    nutritionTip: 'Aporta más de 50g de proteína de máxima biodisponibilidad y alto contenido de hierro hemo y creatina natural para recarga muscular post-entreno.'
  },
  {
    id: 'uy-milanesa-nalga-horno-calabaza',
    name: 'Milanesa de Nalga al Horno con Puré de Calabaza',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'rendimiento',
    goalLabel: 'Rendimiento Deportivo',
    protein: 48,
    calories: 490,
    carbs: 45,
    fats: 11,
    prepTimeMinutes: 30,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
    description: 'El clásico hogar uruguayo en versión limpia: nalga desgrasada rebozada en avena molida y semillas, horneada sin fritura y acompañada de puré dulce de calabaza asada.',
    ingredients: [
      { name: 'Nalga de ternera magra cortada fina', quantity: '180g' },
      { name: 'Huevo campero batido con ajo y perejil', quantity: '1 unidad' },
      { name: 'Avena extrafina molida / salvado', quantity: '40g' },
      { name: 'Calabaza o zapallo criollo', quantity: '250g' },
      { name: 'Nuez moscada y sal marina', quantity: 'al gusto' }
    ],
    instructions: [
      'Pasar el filete de nalga por el huevo condimentado con ajo y perejil fresco picado.',
      'Empanar suavemente con la avena molida presionando con la palma de la mano.',
      'Llevar a horno precalentado a 200°C sobre placa antiadherente por 15-18 minutos hasta dorar.',
      'Hervir o asar la calabaza y pisarla con un toque de nuez moscada y sal.',
      'Servir caliente con una rodaja de limón exprimido.'
    ],
    nutritionTip: 'La calabaza aporta carbohidratos complejos de absorción media y betacarotenos antiinflamatorios ideales para recuperación muscular.'
  },
  {
    id: 'uy-colita-cuadril-boniato',
    name: 'Colita de Cuadril a la Plancha con Boniato Asado',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 46,
    calories: 520,
    carbs: 38,
    fats: 14,
    prepTimeMinutes: 25,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&auto=format&fit=crop&q=80',
    description: 'El corte noble de la parrilla uruguaya preparado de forma magra, acompañado del clásico boniato dulce asado con romero.',
    ingredients: [
      { name: 'Colita de cuadril magra (sin grasa periférica)', quantity: '180g' },
      { name: 'Boniato uruguayo (batata dulce)', quantity: '200g' },
      { name: 'Romero fresco y sal gruesa', quantity: 'al gusto' },
      { name: 'Aceite de oliva virgen extra', quantity: '1 cucharadita (5ml)' }
    ],
    instructions: [
      'Cortar el boniato en rodajas o bastones con piel y hornear a 200°C con romero por 25 minutos.',
      'Calentar la sartén o plancha de hierro a fuego vivo.',
      'Sellar el medallón de colita de cuadril durante 4 a 5 minutos por lado manteniendo el punto jugoso.',
      'Dejar reposar la carne 2 minutos antes de cortar para retener sus jugos naturales.'
    ],
    nutritionTip: 'El boniato aporta carbohidratos con almidón resistente que nutre la microbiota y asegura recarga de glucógeno limpia sin picos bruscos de insulina.'
  },
  {
    id: 'uy-tarta-pascualina-hiperproteica',
    name: 'Tarta Pascualina Hiperproteica con Ricota y Claras',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'definicion',
    goalLabel: 'Definición / Corte',
    protein: 38,
    calories: 380,
    carbs: 26,
    fats: 10,
    prepTimeMinutes: 35,
    difficulty: 'Intermedio',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1554998171-7e599bc95ccd?w=800&auto=format&fit=crop&q=80',
    description: 'El ícono de las panaderías y mesas uruguayas reinventado con masa integral casera, espinaca tierna, ricota magra artesanal y abundantes huevos duros.',
    ingredients: [
      { name: 'Espinaca o acelga fresca blanqueada', quantity: '250g' },
      { name: 'Ricota magra / queso cottage', quantity: '120g' },
      { name: 'Huevos duros enteros', quantity: '2 unidades' },
      { name: 'Claras de huevo líquidas', quantity: '2 unidades' },
      { name: 'Masa integral fina (solo base)', quantity: '1 tapa (50g)' },
      { name: 'Nuez moscada, sal y pimienta', quantity: 'al gusto' }
    ],
    instructions: [
      'Escurrir muy bien la espinaca para retirar todo el exceso de líquido.',
      'Mezclar en un bowl la espinaca picada, ricota magra, claras de huevo, nuez moscada y sal.',
      'Forrar una tartera con la masa integral fina.',
      'Verter el relleno y ahuecar para colocar los 2 huevos duros enteros.',
      'Hornear a 180°C durante 25 a 30 minutos hasta que la superficie esté dorada y firme.'
    ],
    nutritionTip: 'Excelente relación volumen-calorías: alto poder de saciedad con magnesio, calcio y folatos esenciales para el sistema neuromuscular.'
  },
  {
    id: 'uy-gramajo-fit-lomo-claras',
    name: 'Revuelto Gramajo Fitness (Lomo, Claras y Papines al Horno)',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'rendimiento',
    goalLabel: 'Rendimiento Deportivo',
    protein: 44,
    calories: 430,
    carbs: 35,
    fats: 9,
    prepTimeMinutes: 20,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    description: 'Plato tradicional de bodegón uruguayo adaptado: en lugar de papas fritas grasosas, usamos papas horneadas crujientes en bastones finos, lomo magro picado y claras salteadas.',
    ingredients: [
      { name: 'Lomo de ternera o jamón cocido magro en tiras', quantity: '140g' },
      { name: 'Claras de huevo + 1 huevo entero', quantity: '4 unidades (3 claras + 1 huevo)' },
      { name: 'Papas cortadas en bastones muy finos', quantity: '180g' },
      { name: 'Arvejas frescas hervidas', quantity: '40g' },
      { name: 'Cebolla picada fina', quantity: '30g' }
    ],
    instructions: [
      'Cocinar los bastones de papa en horno con spray vegetal o airfryer hasta que queden crocantes.',
      'Saltear la cebolla y las tiras de carne magra en una sartén antiadherente con una pizca de sal marina.',
      'Sumar las arvejas y las papas doradas.',
      'Bajar el fuego, volcar los huevos y claras batidas removiendo suavemente durante 60 segundos hasta que queden cremosos pero no secos.'
    ],
    nutritionTip: 'Carbohidratos limpios con electrolitos y potasio de la papa para evitar calambres y acelerar la síntesis de glucógeno muscular.'
  },
  {
    id: 'uy-cazuela-lentejas-lomo-criolla',
    name: 'Cazuela Criolla de Lentejas y Lomo Magro',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 42,
    calories: 460,
    carbs: 52,
    fats: 6,
    prepTimeMinutes: 35,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80',
    description: 'Cuchara invernal y reconfortante de la cocina uruguaya. Reemplazamos el chorizo y panceta por cubos de lomo desgrasado, lentejas ricas en hierro y verduras frescas.',
    ingredients: [
      { name: 'Lentejas secas remojadas o cocidas', quantity: '180g cocidas' },
      { name: 'Carne vacuna magra (lomo o peceto) en cubos', quantity: '150g' },
      { name: 'Zanahoria, puerro y cebolla picados', quantity: '120g' },
      { name: 'Tomate triturado natural', quantity: '100g' },
      { name: 'Caldo casero de verduras sin sodio', quantity: '200ml' },
      { name: 'Pimentón dulce y hojas de laurel', quantity: 'al gusto' }
    ],
    instructions: [
      'Dorar los cubos de carne en una olla con laurel y pimentón dulce.',
      'Agregar las verduras picadas y rehogar 5 minutos.',
      'Incorporar el tomate triturado y el caldo casero caliente.',
      'Añadir las lentejas y cocinar a fuego lento durante 20 minutos hasta espesar.',
      'Servir en cazuela humeante espolvoreando perejil fresco picado.'
    ],
    nutritionTip: 'Gran aporte de hierro vegetal reforzado por el hierro hemo de la ternera y fibra prebiótica para salud digestiva.'
  },
  {
    id: 'uy-asado-magro-ensalada-criolla',
    name: 'Bife Ancho Magro con Ensalada Criolla Clásica',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'definicion',
    goalLabel: 'Definición / Corte',
    protein: 47,
    calories: 420,
    carbs: 12,
    fats: 18,
    prepTimeMinutes: 15,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    description: 'La tradición parrillera uruguaya en su máxima pureza proteica: corte vacuno magro asado al punto deseado y ensalada criolla fresca de cebolla, morrón y tomate.',
    ingredients: [
      { name: 'Bife de cuadril o bife angosto desgrasado', quantity: '200g' },
      { name: 'Tomate perita en cubos', quantity: '100g' },
      { name: 'Cebolla colorada picada', quantity: '40g' },
      { name: 'Morrón verde y rojo en cubitos', quantity: '40g' },
      { name: 'Vinagre de manzana y aceite de oliva', quantity: '1 cucharada' }
    ],
    instructions: [
      'Cocinar el bife a fuego vivo en plancha o parrilla con sal gruesa 4 minutos por lado.',
      'Preparar la salsa criolla mezclando cebolla, tomate y morrones con vinagre de manzana y oliva.',
      'Dejar macerar la criolla 10 minutos para suavizar la cebolla.',
      'Servir el bife caliente bañado con la ensalada criolla crujiente.'
    ],
    nutritionTip: 'Muy bajo en carbohidratos, ideal para fases de definición o cenas proteicas con alto valor biológico.'
  },
  {
    id: 'uy-pastel-carne-zapallo',
    name: 'Pastel de Carne Uruguayo con Cubierta de Zapallo',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 45,
    calories: 460,
    carbs: 38,
    fats: 12,
    prepTimeMinutes: 35,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
    description: 'El clásico pastel de carne familiar con carne picada ultra magra, huevo duro picado y una cremosa cubierta de puré de zapallo kabutiá gratinado.',
    ingredients: [
      { name: 'Carne picada de ternera magra (nalga/lomo)', quantity: '180g' },
      { name: 'Zapallo criollo o kabutiá cocido', quantity: '250g' },
      { name: 'Huevo duro picado', quantity: '1 unidad' },
      { name: 'Cebolla y morrón picaditos', quantity: '60g' },
      { name: 'Queso magro rallado para gratinar', quantity: '15g' }
    ],
    instructions: [
      'Saltear la carne con la cebolla y el morrón en una sartén con condimentos criollos.',
      'Agregar el huevo duro picado y colocar la preparación en una fuente para horno.',
      'Pisar el zapallo con sal y pimienta hasta obtener un puré homogéneo.',
      'Cubrir la carne con el puré de zapallo y espolvorear el queso magro.',
      'Llevar a gratinar a horno fuerte a 220°C por 12 minutos.'
    ],
    nutritionTip: 'El zapallo kabutiá aporta saciedad con la mitad de calorías que la papa tradicional, ideal para controlar calorías sin pasar hambre.'
  },
  {
    id: 'uy-pescado-corvina-vegetales',
    name: 'Corvina Negra Rioplatense a la Plancha con Vegetales',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'definicion',
    goalLabel: 'Definición / Corte',
    protein: 42,
    calories: 330,
    carbs: 14,
    fats: 9,
    prepTimeMinutes: 15,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80',
    description: 'Pescado fresco de las costas uruguayas con alto contenido en ácidos grasos Omega-3 y textura delicada, acompañado de calabacines y tomates asados.',
    ingredients: [
      { name: 'Filete de corvina negra o merluza fresca', quantity: '200g' },
      { name: 'Zucchini / zapallito verde en rodajas', quantity: '150g' },
      { name: 'Tomates cherry', quantity: '80g' },
      { name: 'Diente de ajo y perejil picado', quantity: '1 unidad' },
      { name: 'Aceite de oliva virgen extra', quantity: '1 cucharadita' }
    ],
    instructions: [
      'Pincelar el filete con limón, ajo y perejil fresco picado.',
      'Dorar en sartén antiadherente con oliva a fuego medio-alto por 3-4 minutos por lado.',
      'Saltear al mismo tiempo los zapallitos y los tomatitos cherry con orégano.',
      'Servir con una rodaja de limón fresco.'
    ],
    nutritionTip: 'Proteína ligera de rápida digestión con perfil de aminoácidos perfecto para cenar antes de dormir y promover la regeneración muscular nocturna.'
  },
  {
    id: 'uy-polenta-tuco-carne-magra',
    name: 'Polenta Cremosa con Tuco Magro y Orégano Silvestre',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'rendimiento',
    goalLabel: 'Rendimiento Deportivo',
    protein: 39,
    calories: 470,
    carbs: 58,
    fats: 7,
    prepTimeMinutes: 20,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop&q=80',
    description: 'El plato tradicional de los domingos uruguayos con harina de maíz de molienda fina y salsa casera con cubos de carne desgrasada.',
    ingredients: [
      { name: 'Harina de maíz para polenta cocida', quantity: '180g (cocida)' },
      { name: 'Lomo o nalga en tiritas magras', quantity: '160g' },
      { name: 'Salsa de tomate casera sin azúcar', quantity: '120g' },
      { name: 'Zanahoria rallada y cebolla', quantity: '50g' },
      { name: 'Orégano seco uruguayo', quantity: 'al gusto' }
    ],
    instructions: [
      'Cocinar la polenta en agua hirviendo con sal marina y remover hasta lograr textura cremosa.',
      'En otra sartén, dorar la carne picada a cuchillo con cebolla, zanahoria y salsa de tomate.',
      'Dejar espesar la salsa durante 10 minutos a fuego suave.',
      'Servir la polenta caliente en plato hondo con el tuco encima y orégano abundante.'
    ],
    nutritionTip: 'Ideal para días de entrenamiento intenso de piernas o sesiones de alta demanda energética gracias a su glucógeno limpio y cero digestión pesada.'
  },
  {
    id: 'uy-tortilla-espinaca-claras',
    name: 'Tortilla Rioplatense de Espinacas y Claras al Horno',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'definicion',
    goalLabel: 'Definición / Corte',
    protein: 34,
    calories: 280,
    carbs: 14,
    fats: 8,
    prepTimeMinutes: 18,
    difficulty: 'Fácil',
    xpReward: 20,
    image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&auto=format&fit=crop&q=80',
    description: 'Tortilla esponjosa alta en fibra y minerales con espinaca salteada, cebolla caramelizada sin azúcar y mezcla de claras con queso magro.',
    ingredients: [
      { name: 'Espinaca fresca picada', quantity: '200g' },
      { name: 'Claras de huevo pasteurizadas', quantity: '4 unidades' },
      { name: 'Huevo entero campero', quantity: '1 unidad' },
      { name: 'Queso magro uruguayo picado en cubos', quantity: '30g' },
      { name: 'Cebolla salteada', quantity: '40g' }
    ],
    instructions: [
      'Saltear la cebolla y la espinaca en una sartén con spray vegetal hasta marchitar.',
      'Batir las 4 claras y el huevo entero en un bowl con sal y pimienta.',
      'Unir los vegetales y los cubos de queso a los huevos.',
      'Cocinar en sartén antiadherente tapada a fuego lento 5 minutos por lado.'
    ],
    nutritionTip: 'Calorías muy controladas (280 kcal) con 34g de proteína pura para mantener masa muscular durante déficit calórico.'
  },
  {
    id: 'uy-omelette-dambo-jamon-avena',
    name: 'Omelette Criollo de Queso Dambo Light y Jamón Magro',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'desayuno_merienda',
    categoryLabel: 'Desayuno / Merienda',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 36,
    calories: 340,
    carbs: 8,
    fats: 16,
    prepTimeMinutes: 10,
    difficulty: 'Fácil',
    xpReward: 20,
    image: 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=800&auto=format&fit=crop&q=80',
    description: 'Desayuno potente y tradicional de atleta: huevos camperos, lomito magro feteado y queso dambo con reducción de grasa.',
    ingredients: [
      { name: 'Huevos enteros', quantity: '2 unidades' },
      { name: 'Claras de huevo', quantity: '2 unidades' },
      { name: 'Jamón cocido magro / lomito', quantity: '40g' },
      { name: 'Queso dambo uruguayo bajo en grasa', quantity: '30g' },
      { name: 'Orégano y pimienta', quantity: 'al gusto' }
    ],
    instructions: [
      'Batir los huevos y las claras hasta que queden espumosos.',
      'Volcar en una sartén caliente con spray vegetal.',
      'Cuando empiece a cuajar, colocar el jamón y el queso dambo en una mitad.',
      'Plegar la otra mitad y apagar el fuego para fundir el queso con el calor residual.'
    ],
    nutritionTip: 'Excelente arranque del día con colina cerebral, aminoácidos de liberación progresiva y saciedad prolongada.'
  },
  {
    id: 'uy-panqueque-avena-ricota-miel',
    name: 'Panqueque Rioplatense de Avena, Ricota y Frutos Rojos',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'desayuno_merienda',
    categoryLabel: 'Desayuno / Merienda',
    goal: 'rendimiento',
    goalLabel: 'Rendimiento Deportivo',
    protein: 30,
    calories: 360,
    carbs: 42,
    fats: 7,
    prepTimeMinutes: 12,
    difficulty: 'Fácil',
    xpReward: 20,
    image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&auto=format&fit=crop&q=80',
    description: 'El clásico panqueque casero transformado en combustible deportivo con avena arrollada, ricota magra cremosa y frutos del bosque.',
    ingredients: [
      { name: 'Harina de avena integral', quantity: '50g' },
      { name: 'Claras de huevo', quantity: '3 unidades' },
      { name: 'Ricota magra artesanal', quantity: '60g' },
      { name: 'Arándanos o frutillas frescas', quantity: '50g' },
      { name: 'Esencia de vainilla y canela', quantity: 'al gusto' }
    ],
    instructions: [
      'Licuar o procesar la avena con las claras, la vainilla y un toque de canela.',
      'Cocinar en sartén antiadherente durante 2 minutos por lado.',
      'Untar con la ricota magra tibia y cubrir con arándanos frescos.'
    ],
    nutritionTip: 'Antioxidantes y polifenoles naturales que reducen el estrés oxidativo provocado por entrenamientos de alta intensidad.'
  },
  {
    id: 'uy-hamburguesa-cuadril-plancha',
    name: 'Hamburguesa Casera de Cuadril con Huevo a la Plancha',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 48,
    calories: 490,
    carbs: 26,
    fats: 16,
    prepTimeMinutes: 15,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    description: 'Medallón 100% cuadril picado sin rellenos artificiales, servido al plato con rodajas de tomate, cebolla asada y huevo campero.',
    ingredients: [
      { name: 'Cuadril picado magro sin grasa', quantity: '180g' },
      { name: 'Huevo campero', quantity: '1 unidad' },
      { name: 'Pan integral tostado de masa madre', quantity: '1 rodaja (40g)' },
      { name: 'Tomate y lechuga criolla', quantity: '80g' },
      { name: 'Mostaza dijon y sal marina', quantity: 'al gusto' }
    ],
    instructions: [
      'Moldear el cuadril picado en forma de hamburguesa gruesa y salar solo por fuera.',
      'Cocinar en plancha muy caliente durante 3 minutos por lado.',
      'Cocinar el huevo en la misma plancha con spray vegetal.',
      'Servir sobre la rodaja de pan integral tostada con mostaza dijon y verduras frescas.'
    ],
    nutritionTip: 'Zinc, selenio y proteína biodisponible que estimulan la producción natural de testosterona y la síntesis proteica miofibrilar.'
  },

  // ==========================================
  // 🇧🇷 BRASIL (Platos Fitness e Hiperproteicos)
  // ==========================================
  {
    id: 'br-picanha-magra-mandioca-vinagrete',
    name: 'Picanha Magra Grelhada com Mandioca e Vinagrete',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 46,
    calories: 480,
    carbs: 38,
    fats: 14,
    prepTimeMinutes: 20,
    difficulty: 'Fácil',
    xpReward: 30,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
    description: 'O sabor inconfundível do churrasco brasileiro adaptado para atletas: picanha com a capa de gordura removida antes do consumo, servida com mandioca (aipim) cozida na água e sal e vinagrete fresco.',
    ingredients: [
      { name: 'Bife de picanha bovina sem a capa de gordura', quantity: '180g' },
      { name: 'Mandioca (aipim) cozida macia', quantity: '160g' },
      { name: 'Tomate picadinho para vinagrete', quantity: '60g' },
      { name: 'Cebola roxa e cheiro-verde picados', quantity: '40g' },
      { name: 'Vinagre de maçã e azeite extravirgem', quantity: '1 colher de chá' }
    ],
    instructions: [
      'Selar a picanha em grelha ou frigideira bem quente durante 3 a 4 minutos de cada lado mantendo o centro rosado.',
      'Cozinhar a mandioca em água fervente com sal marinho até ficar bem macia.',
      'Preparar o vinagrete misturando o tomate, cebola, cheiro-verde, vinagre e azeite.',
      'Fatiar a carne em tiras contra a fibra e servir com a mandioca quente e o vinagrete.'
    ],
    nutritionTip: 'A mandioca é um carboidrato complexo de baixo índice glicêmico e fácil digestão, ideal para reposição de energia limpa.'
  },
  {
    id: 'br-feijoada-fit-lombo-couve',
    name: 'Feijoada Fit Proteica com Lombo Suíno e Couve Refogada',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 48,
    calories: 510,
    carbs: 48,
    fats: 10,
    prepTimeMinutes: 40,
    difficulty: 'Intermedio',
    xpReward: 30,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80',
    description: 'A joia da culinária brasileira sem embutidos gordurosos: feijão preto encorpado com lombo de porco magro, patinho bovino em cubos, couve mineira refogada no alho e arroz integral.',
    ingredients: [
      { name: 'Feijão preto cozido com caldo encorpado', quantity: '180g' },
      { name: 'Lombo suíno magro em cubos', quantity: '100g' },
      { name: 'Patinho bovino em cubos', quantity: '80g' },
      { name: 'Couve manteiga fatiada fininha', quantity: '100g' },
      { name: 'Arroz integral cozido', quantity: '100g' },
      { name: 'Alho, louro e laranja em rodelas', quantity: 'ao gosto' }
    ],
    instructions: [
      'Dourar os cubos de lombo e patinho na panela de pressão com alho e folhas de louro.',
      'Adicionar o feijão preto e água necessária, cozinhando até os grãos amaciarem e o caldo engrossar.',
      'Refogar a couve fatiada rapidamente no alho com spray de azeite por apenas 2 minutos para manter a crocância.',
      'Montar o prato com o arroz integral, a feijoada rica em carnes magras e a couve fresca.'
    ],
    nutritionTip: 'A couve e a laranja fornecem vitamina C que multiplica por 3 a absorção do ferro vegetal presente no feijão preto.'
  },
  {
    id: 'br-escondidinho-batata-doce-frango',
    name: 'Escondidinho Fit de Batata Doce com Frango Desfiado',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'rendimiento',
    goalLabel: 'Rendimiento Deportivo',
    protein: 44,
    calories: 420,
    carbs: 46,
    fats: 7,
    prepTimeMinutes: 30,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop&q=80',
    description: 'A clássica refeição de marmita fitness brasileira: peito de frango desfiado suculento refogado no tomate e cheiro-verde, coberto com purê leve de batata doce e gratinado.',
    ingredients: [
      { name: 'Peito de frango desfiado cozido', quantity: '160g' },
      { name: 'Batata doce cozida e amassada', quantity: '200g' },
      { name: 'Requeijão light ou creme de ricota', quantity: '30g' },
      { name: 'Tomate e cebola refogados', quantity: '60g' },
      { name: 'Queijo muçarela light ralado para gratinar', quantity: '15g' }
    ],
    instructions: [
      'Refogar o frango desfiado com cebola, alho, tomate fresco picado e páprica defumada.',
      'Misturar a batata doce amassada com o requeijão light até formar um purê aveludado.',
      'Em um refratário individual, dispor a camada de frango refogado.',
      'Cobrir com o purê de batata doce e salpicar o queijo muçarela light.',
      'Levar ao forno a 200°C por 15 minutos até dourar a superfície.'
    ],
    nutritionTip: 'Combinação clássica de proteína de altíssimo valor biológico com carboidrato lento que garante energia constante para treinos pesados.'
  },
  {
    id: 'br-crepioca-frango-queijo-minas',
    name: 'Crepioca Fit de Frango com Queijo Minas Frescal',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'desayuno_merienda',
    categoryLabel: 'Desayuno / Merienda',
    goal: 'rapido',
    goalLabel: 'Rápido (<15 min)',
    protein: 38,
    calories: 330,
    carbs: 22,
    fats: 9,
    prepTimeMinutes: 10,
    difficulty: 'Fácil',
    xpReward: 20,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80',
    description: 'O lanche mais amado das academias brasileiras: massa crocante feita de goma de tapioca batida com ovo e recheada com frango desfiado temperado e queijo minas.',
    ingredients: [
      { name: 'Goma de tapioca hidratada', quantity: '30g' },
      { name: 'Ovo inteiro + 1 clara', quantity: '2 unidades (1 ovo + 1 clara)' },
      { name: 'Peito de frango desfiado temperado', quantity: '100g' },
      { name: 'Queijo minas frescal light ralado', quantity: '30g' },
      { name: 'Orégano e chia', quantity: '1 colher de chá' }
    ],
    instructions: [
      'Bater o ovo, a clara e a goma de tapioca em um bowl com um garfo até ficar homogêneo.',
      'Despejar em frigideira antiaderente pré-aquecida em fogo médio.',
      'Quando firmar o fundo, virar o disco e espalhar o frango desfiado e o queijo minas.',
      'Dobrar ao meio e deixar dourar até o queijo derreter suavemente.'
    ],
    nutritionTip: 'Sem glúten, rápida absorção e perfeita para café da manhã ou lanche pós-treino com praticidade extrema.'
  },
  {
    id: 'br-strogonoff-frango-iogurte-grego',
    name: 'Strogonoff de Frango Fit com Iogurte Grego e Arroz',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 46,
    calories: 440,
    carbs: 38,
    fats: 8,
    prepTimeMinutes: 20,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80',
    description: 'O preferido dos brasileiros sem creme de leite pesado: tiras de peito de frango douradas, molho de tomate natural e iogurte grego proteico, acompanhado de arroz branco soltinho.',
    ingredients: [
      { name: 'Peito de frango em cubos', quantity: '180g' },
      { name: 'Iogurte grego natural desnatado', quantity: '100g' },
      { name: 'Extrato de tomate puro e mostarda dijon', quantity: '2 colheres de sopa' },
      { name: 'Cogumelos champignon frescos fatiados', quantity: '50g' },
      { name: 'Arroz branco ou integral cozido', quantity: '100g' }
    ],
    instructions: [
      'Grelhar os cubos de frango em fogo alto com alho e cebola até dourar bem.',
      'Adicionar os cogumelos fatiados e refogar por 2 minutos.',
      'Acrescentar o extrato de tomate e a mostarda.',
      'Desligar o fogo e misturar o iogurte grego para criar um molho cremoso sem talhar.',
      'Servir acompanhado do arroz quente.'
    ],
    nutritionTip: 'Corta mais de 250 kcal em comparação ao strogonoff tradicional mantendo toda a cremosidade e elevando o teor proteico.'
  },
  {
    id: 'br-moqueca-peixe-camarao-light',
    name: 'Moqueca Baiana Fit de Pescada e Camarão',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'definicion',
    goalLabel: 'Definición / Corte',
    protein: 45,
    calories: 370,
    carbs: 18,
    fats: 11,
    prepTimeMinutes: 25,
    difficulty: 'Intermedio',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
    description: 'Prato aromático do litoral nordestino com peixe branco nobre e camarões cozidos em leite de coco light, tomates, pimentões coloridos e coentro fresco.',
    ingredients: [
      { name: 'Filé de pescada amarela ou tilápia', quantity: '160g' },
      { name: 'Camarões limpos', quantity: '80g' },
      { name: 'Leite de coco light', quantity: '80ml' },
      { name: 'Pimentão vermelho e amarelo fatiados', quantity: '60g' },
      { name: 'Tomate e cebola em rodelas', quantity: '80g' },
      { name: 'Coentro fresco picado e azeite de dendê', quantity: 'gotas apenas' }
    ],
    instructions: [
      'Temperar o peixe e os camarões com limão, alho e sal marinho.',
      'Em uma panela de barro ou fundo grosso, montar camadas de cebola, pimentões, tomate e peixe.',
      'Regar com o leite de coco light e algumas gotas de azeite de dendê para dar cor e aroma característicos.',
      'Cozinhar tampado em fogo médio durante 15 minutos.',
      'Adicionar os camarões e o coentro nos últimos 5 minutos de cozimento.'
    ],
    nutritionTip: 'Rico em ácidos graxos antimicrobianos (MCTs do coco) e astaxantina antioxidante dos camarões para rápida recuperação muscular.'
  },
  {
    id: 'br-acai-bowl-whey-banana',
    name: 'Açaí Bowl Proteico com Whey Protein Isolado',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'post_entreno',
    categoryLabel: 'Pós-Treino / Snack',
    goal: 'rendimiento',
    goalLabel: 'Rendimiento Deportivo',
    protein: 34,
    calories: 390,
    carbs: 45,
    fats: 7,
    prepTimeMinutes: 5,
    difficulty: 'Fácil',
    xpReward: 20,
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop&q=80',
    description: 'Polpa de açaí puro 100% sem xarope de guaraná batida com scoop de whey protein, banana e sementes de chia.',
    ingredients: [
      { name: 'Polpa pura de açaí congelada (sem xarope)', quantity: '150g' },
      { name: 'Whey Protein Isolado (baunilha ou morango)', quantity: '30g (1 scoop)' },
      { name: 'Banana prata congelada fatiada', quantity: '1 unidade pequena (80g)' },
      { name: 'Água gelada ou leite desnatado', quantity: '50ml' },
      { name: 'Sementes de chia ou granola sem açúcar', quantity: '1 colher de sobremesa' }
    ],
    instructions: [
      'Quebrar a polpa de açaí e colocar no liquidificador ou processador.',
      'Adicionar o scoop de whey, a banana congelada e os 50ml de água.',
      'Bater na função pulsar até obter uma consistência espessa e cremosa.',
      'Despejar em uma tigela e finalizar com rodelas de morango e sementes de chia.'
    ],
    nutritionTip: 'O açaí é rico em antocianinas que aceleram a remoção de ácido lático e combatem o estresse oxidativo pós-treino pesado.'
  },
  {
    id: 'br-baiao-de-dois-fit-proteico',
    name: 'Baião de Dois Fit com Feijão Fradinho e Carne Seca Magra',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 44,
    calories: 480,
    carbs: 52,
    fats: 9,
    prepTimeMinutes: 30,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop&q=80',
    description: 'Clássico nordestino preparado de forma equilibrada: feijão-fradinho, arroz integral, carne seca totalmente dessalgada e desengordurada e cubinhos de queijo coalho tostados na frigideira.',
    ingredients: [
      { name: 'Feijão-fradinho ou feijão de corda cozido', quantity: '140g' },
      { name: 'Carne seca magra desfiada e dessalgada', quantity: '120g' },
      { name: 'Arroz integral cozido', quantity: '100g' },
      { name: 'Queijo coalho light em cubos dourados', quantity: '30g' },
      { name: 'Coentro, cebola roxa e pimenta-de-cheiro', quantity: 'ao gosto' }
    ],
    instructions: [
      'Refogar a cebola e a pimenta-de-cheiro no spray de azeite.',
      'Adicionar a carne seca magra desfiada e tostar por alguns minutos.',
      'Incorporar o feijão-fradinho e o arroz integral já cozidos misturando tudo delicadamente.',
      'Em outra frigideira, dourar os cubos de queijo coalho e misturar por cima ao servir junto com o coentro fresco.'
    ],
    nutritionTip: 'Combinação clássica de aminoácidos complementares de arroz e feijão com proteína completa e densidade mineral alta.'
  },
  {
    id: 'br-frango-quiabo-arroz-integral',
    name: 'Frango com Quiabo Mineiro e Arroz Integral',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'definicion',
    goalLabel: 'Definición / Corte',
    protein: 43,
    calories: 390,
    carbs: 34,
    fats: 7,
    prepTimeMinutes: 25,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80',
    description: 'A tradição de Minas Gerais em versão fit: sobrecoxa sem pele ou peito de frango ensopado com quiabo refogado sem baba e temperos naturais.',
    ingredients: [
      { name: 'Peito ou filé de coxa sem pele em pedaços', quantity: '180g' },
      { name: 'Quiabo fresco cortado em rodelas', quantity: '120g' },
      { name: 'Tomate e cebola picados', quantity: '80g' },
      { name: 'Arroz integral cozido', quantity: '100g' },
      { name: 'Cúrcuma (açafrão-da-terra) e cheiro-verde', quantity: 'ao gosto' }
    ],
    instructions: [
      'Refogar o quiabo em frigideira quente com algumas gotas de vinagre para remover a baba e reservar.',
      'Dourar o frango na panela com alho, cebola e cúrcuma em pó.',
      'Adicionar o tomate e um pouco de água para criar um molho aromático.',
      'Juntar o quiabo e cozinhar por 8 minutos até amaciar.',
      'Servir com o arroz integral bem quentinho.'
    ],
    nutritionTip: 'O quiabo é repleto de mucilagens e fibras solúveis que auxiliam no controle glicêmico e na saúde gastrointestinal.'
  },
  {
    id: 'br-salpicao-frango-iogurte-maca',
    name: 'Salpicão de Frango Fit com Iogurte e Maçã Verde',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'definicion',
    goalLabel: 'Definición / Corte',
    protein: 41,
    calories: 320,
    carbs: 24,
    fats: 6,
    prepTimeMinutes: 15,
    difficulty: 'Fácil',
    xpReward: 20,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    description: 'Refrescante e crocante: frango desfiado com cenoura ralada, maçã verde em cubinhos, milho verde e molho leve de iogurte natural com mostarda.',
    ingredients: [
      { name: 'Peito de frango cozido e desfiado', quantity: '160g' },
      { name: 'Cenoura ralada fininha', quantity: '80g' },
      { name: 'Maçã verde em cubinhos com casca', quantity: '50g' },
      { name: 'Milho verde em grãos cozido', quantity: '40g' },
      { name: 'Iogurte natural desnatado ou creme de ricota', quantity: '80g' },
      { name: 'Mostarda dijon e suco de limão', quantity: '1 colher de chá' }
    ],
    instructions: [
      'Misturar o iogurte desnatado com o limão, mostarda e sal para criar o molho cremoso.',
      'Em uma travessa, combinar o frango desfiado, a cenoura, a maçã verde e o milho.',
      'Envolver todos os ingredientes com o molho de iogurte.',
      'Servir gelado acompanhado de folhas de alface americana crocante.'
    ],
    nutritionTip: 'Perfeito para marmitas ou dias quentes: alta saciedade, fibras abundantes e zero maionese industrializada.'
  },
  {
    id: 'br-hamburguer-patinho-moido-aveia',
    name: 'Hambúrguer de Patinho Moído na Frigideira com Aveia',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 47,
    calories: 440,
    carbs: 28,
    fats: 12,
    prepTimeMinutes: 15,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80',
    description: 'O corte bovino mais magro do Brasil (patinho moído) enriquecido com farelo de aveia e temperos frescos, grelhado sem óleo.',
    ingredients: [
      { name: 'Patinho bovino moído magro', quantity: '180g' },
      { name: 'Farelo de aveia integral', quantity: '20g' },
      { name: 'Cebola ralada e alho amassado', quantity: '30g' },
      { name: 'Queijo muçarela light', quantity: '25g' },
      { name: 'Sal rosa e pimenta-do-reino', quantity: 'ao gosto' }
    ],
    instructions: [
      'Misturar o patinho moído com a aveia, cebola ralada, alho e temperos.',
      'Modelar discos grossos de hambúrguer.',
      'Aquecer bem a frigideira antiaderente e grelhar por 4 minutos de cada lado.',
      'Cobrir com o queijo muçarela light no último minuto e abafar com uma tampa para derreter.'
    ],
    nutritionTip: 'A carne vermelha magra é a principal fonte natural de creatina e ferro biodisponível para força e potência muscular.'
  },
  {
    id: 'br-panqueca-aveia-frango-requeijao',
    name: 'Panqueca de Aveia com Frango e Requeijão Light',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'rendimiento',
    goalLabel: 'Rendimiento Deportivo',
    protein: 42,
    calories: 390,
    carbs: 32,
    fats: 8,
    prepTimeMinutes: 20,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&auto=format&fit=crop&q=80',
    description: 'Massa levinha de farelo de aveia com claras, recheada com frango desfiado cremoso e molho de tomate caseiro por cima.',
    ingredients: [
      { name: 'Peito de frango cozido e desfiado', quantity: '140g' },
      { name: 'Farelo de aveia', quantity: '35g' },
      { name: 'Ovo + 2 claras de ovo', quantity: '3 unidades' },
      { name: 'Requeijão cremoso light', quantity: '30g' },
      { name: 'Molho de tomate pelado batido', quantity: '60g' }
    ],
    instructions: [
      'Bater a aveia, o ovo e as claras com uma pitada de sal no liquidificador.',
      'Fazer discos finos na frigideira antiaderente.',
      'Misturar o frango desfiado com o requeijão light.',
      'Rechear as panquecas, enrolar e colocar em um prato com o molho de tomate aquecido.'
    ],
    nutritionTip: 'As beta-glucanas da aveia melhoram a sensibilidade à insulina e sustentam o fornecimento de energia para o músculo.'
  },
  {
    id: 'br-tilapia-pure-mandioquinha',
    name: 'Filé de Tilápia Grelhado com Purê de Mandioquinha',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'definicion',
    goalLabel: 'Definición / Corte',
    protein: 41,
    calories: 350,
    carbs: 32,
    fats: 6,
    prepTimeMinutes: 20,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1535400255456-984241443b29?w=800&auto=format&fit=crop&q=80',
    description: 'Tilápia macia e dourada na frigideira, servida com o aveludado purê de mandioquinha (batata-baroa) com noz-moscada.',
    ingredients: [
      { name: 'Filé de tilápia fresca', quantity: '200g' },
      { name: 'Mandioquinha (batata-baroa) cozida', quantity: '160g' },
      { name: 'Alho, limão taiti e cheiro-verde', quantity: 'ao gosto' },
      { name: 'Azeite de oliva virgen extra', quantity: '1 colher de chá' }
    ],
    instructions: [
      'Temperar a tilápia com suco de limão, alho amassado e sal marinho.',
      'Grelhar na frigideira com o azeite por 3 minutos de cada lado até ficar dourada.',
      'Amassar a mandioquinha ainda quente com um garfo e ajustar o sal.',
      'Servir a tilápia sobre o purê quentinho com cheiro-verde salpicado.'
    ],
    nutritionTip: 'A mandioquinha é uma das raízes mais digestivas do mundo, perfeita para quem busca digestão leve antes de treinar.'
  },
  {
    id: 'br-tapioca-ovos-mexidos-chia',
    name: 'Tapioca Crocante com Ovos Mexidos e Chia',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'desayuno_merienda',
    categoryLabel: 'Desayuno / Merienda',
    goal: 'rapido',
    goalLabel: 'Rápido (<15 min)',
    protein: 26,
    calories: 310,
    carbs: 28,
    fats: 10,
    prepTimeMinutes: 8,
    difficulty: 'Fácil',
    xpReward: 20,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80',
    description: 'O café da manhã tradicional do Nordeste brasileiro: goma de tapioca peneirada na frigideira com recheio cremoso de ovos e sementes de chia.',
    ingredients: [
      { name: 'Goma de tapioca hidratada', quantity: '35g' },
      { name: 'Ovos inteiros camperos', quantity: '2 unidades' },
      { name: 'Clara de ovo', quantity: '1 unidade' },
      { name: 'Sementes de chia', quantity: '1 colher de chá' },
      { name: 'Sal e orégano', quantity: 'ao gosto' }
    ],
    instructions: [
      'Peneirar a goma de tapioca sobre a frigideira aquecida formando um disco uniforme.',
      'Deixar firmar por 1 minuto e meio e virar.',
      'Em outra frigideira, mexer os ovos e a clara em fogo brando até ficarem cremosos.',
      'Rechear a tapioca, polvilhar a chia e dobrar ao meio.'
    ],
    nutritionTip: 'A chia adiciona gorduras boas e fibras que diminuem a velocidade de absorção do carboidrato da tapioca.'
  },

  // ====================================================
  // 🇺🇾 Y 🇧🇷 MÁS PLATOS DE FRONTERA, RIO DE LA PLATA Y BRASIL (Completando +50 Platos)
  // ====================================================
  {
    id: 'uy-suprema-pollo-chimichurri',
    name: 'Suprema de Pollo Criolla con Chimichurri Fit',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'definicion',
    goalLabel: 'Definición / Corte',
    protein: 48,
    calories: 370,
    carbs: 8,
    fats: 14,
    prepTimeMinutes: 15,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&auto=format&fit=crop&q=80',
    description: 'Pechuga entera a la plancha bañada con chimichurri casero con hierbas silvestres rioplatenses y ensalada verde.',
    ingredients: [
      { name: 'Pechuga de pollo sin piel', quantity: '200g' },
      { name: 'Orégano, ají molido y perejil fresco', quantity: '2 cucharadas' },
      { name: 'Ajo picado fino', quantity: '1 diente' },
      { name: 'Vinagre de vino y aceite de oliva', quantity: '1 cucharada' },
      { name: 'Mix de hojas verdes', quantity: '100g' }
    ],
    instructions: [
      'Marinar la pechuga 10 minutos con el chimichurri.',
      'Cocinar a la plancha a fuego medio durante 5 minutos por lado hasta que quede jugosa.',
      'Acompañar con ensalada de hojas verdes aderezada con limón.'
    ],
    nutritionTip: 'El chimichurri aporta antioxidantes naturales del orégano y ajo que mejoran la circulación y perfusión muscular.'
  },
  {
    id: 'br-almondegas-patinho-tomate',
    name: 'Almôndegas Fit de Patinho com Molho Rústico',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 44,
    calories: 410,
    carbs: 24,
    fats: 11,
    prepTimeMinutes: 25,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&auto=format&fit=crop&q=80',
    description: 'Almôndegas artesanais feitas de carne bovina magra ligadas com farelo de aveia e cozidas em molho rústico de tomates frescos.',
    ingredients: [
      { name: 'Patinho moído bovino', quantity: '180g' },
      { name: 'Farelo de aveia', quantity: '20g' },
      { name: 'Ovo batido', quantity: '1 unidade' },
      { name: 'Molho de tomate caseiro sem açúcar', quantity: '150g' },
      { name: 'Manjericão fresco e alho', quantity: 'ao gosto' }
    ],
    instructions: [
      'Misturar a carne com o ovo, aveia, sal e temperos formando bolinhas.',
      'Dourar levemente na frigideira com spray de azeite.',
      'Despejar o molho de tomate rústico e deixar cozinhar por 12 minutos em fogo baixo.',
      'Finalizar com folhas de manjericão fresco.'
    ],
    nutritionTip: 'O licopeno do molho de tomate cozido é um poderoso protetor celular contra inflamação induzida por treinos de alta carga.'
  },
  {
    id: 'uy-revuelto-zapallitos-carne',
    name: 'Revuelto Rioplatense de Zapallitos y Carne Magra',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'definicion',
    goalLabel: 'Definición / Corte',
    protein: 40,
    calories: 310,
    carbs: 12,
    fats: 10,
    prepTimeMinutes: 15,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    description: 'Comida de casa uruguaya de preparación instantánea: zapallitos redondos salteados con carne magra picada y huevos.',
    ingredients: [
      { name: 'Carne picada de ternera magra', quantity: '160g' },
      { name: 'Zapallitos verdes cortados en cubos', quantity: '200g' },
      { name: 'Huevos de campo', quantity: '2 unidades' },
      { name: 'Cebolla picada', quantity: '40g' },
      { name: 'Orégano seco y sal', quantity: 'al gusto' }
    ],
    instructions: [
      'Saltear la cebolla y la carne en una sartén antiadherente hasta dorar.',
      'Añadir los zapallitos en cubos y cocinar 5 minutos.',
      'Verter los 2 huevos y revolver suavemente hasta integrar.'
    ],
    nutritionTip: 'Plato volumétrico con alto contenido de agua y potasio que deshincha y mantiene la ingesta calórica al mínimo.'
  },
  {
    id: 'br-bife-a-cavalo-fit',
    name: 'Bife a Cavalo Fit com Feijão Carioca e Ovo Mole',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 48,
    calories: 490,
    carbs: 36,
    fats: 14,
    prepTimeMinutes: 18,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800&auto=format&fit=crop&q=80',
    description: 'Tradição dos botecos e casas brasileiras: bife de alcatra macio coroado com ovo caipira estalado na água e feijão carioca.',
    ingredients: [
      { name: 'Bife de alcatra bovina magra', quantity: '180g' },
      { name: 'Ovo caipira com gema mole', quantity: '1 unidade' },
      { name: 'Feijão carioca cozido com caldo', quantity: '150g' },
      { name: 'Arroz branco ou integral', quantity: '80g' },
      { name: 'Sal e pimenta moída', quantity: 'ao gosto' }
    ],
    instructions: [
      'Grelhar o bife de alcatra na frigideira bem quente durante 3 minutos de cada lado.',
      'Fazer o ovo na frigideira com uma colher de sopa de água quente tampando para cozinhar a vapor sem óleo.',
      'Colocar o ovo sobre o bife ainda quente e servir com arroz e feijão carioca.'
    ],
    nutritionTip: 'A gema do ovo caipira fornece fosfolipídios, biotina e vitamina D essenciais para a integridade celular.'
  },
  {
    id: 'uy-canelones-ricota-espinaca',
    name: 'Canelones Caseros de Ricota y Espinaca Gratinados',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'rendimiento',
    goalLabel: 'Rendimiento Deportivo',
    protein: 38,
    calories: 420,
    carbs: 45,
    fats: 9,
    prepTimeMinutes: 30,
    difficulty: 'Intermedio',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80',
    description: 'Plato festivo uruguayo con masa ligera de avena y claras, relleno de ricota magra artesanal y espinacas con salsa fileto.',
    ingredients: [
      { name: 'Panqueques finos de avena y claras', quantity: '3 unidades' },
      { name: 'Ricota magra', quantity: '150g' },
      { name: 'Espinaca picada cocida', quantity: '120g' },
      { name: 'Salsa de tomate fileto natural', quantity: '100g' },
      { name: 'Nuez moscada y queso magro', quantity: '20g' }
    ],
    instructions: [
      'Mezclar la ricota con la espinaca bien escurrida y nuez moscada.',
      'Rellenar los 3 panqueques finos de avena y enrollar en una fuente.',
      'Cubrir con salsa fileto y una lluvia fina de queso magro.',
      'Gratinar en horno a 200°C por 12 minutos.'
    ],
    nutritionTip: 'Excelente fuente de caseína y calcio de digestión lenta para mantener la saciedad durante horas.'
  },
  {
    id: 'br-bobo-camarao-mandioca',
    name: 'Bobó de Camarão Fit com Purê Rústico de Aipim',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'rendimiento',
    goalLabel: 'Rendimiento Deportivo',
    protein: 42,
    calories: 390,
    carbs: 36,
    fats: 8,
    prepTimeMinutes: 25,
    difficulty: 'Intermedio',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=800&auto=format&fit=crop&q=80',
    description: 'Camarões selecionados salteados em azeite de oliva e envoltos em purê aveludado de mandioca com leite de coco light e cheiro-verde.',
    ingredients: [
      { name: 'Camarões limpos médios', quantity: '180g' },
      { name: 'Mandioca cozida batida com caldo', quantity: '150g' },
      { name: 'Leite de coco light', quantity: '50ml' },
      { name: 'Tomate, cebola e pimentão picados', quantity: '60g' },
      { name: 'Coentro e limão', quantity: 'ao gosto' }
    ],
    instructions: [
      'Temperar os camarões com limão e sal e selar por 2 minutos na frigideira.',
      'Bater a mandioca cozida com o leite de coco até formar um creme suave.',
      'Misturar o refogado com o purê de mandioca e adicionar os camarões.',
      'Ferver por 3 minutos e salpicar coentro fresco antes de servir.'
    ],
    nutritionTip: 'O camarão possui baixo teor de gordura e é uma das melhores fontes de iodo e zinco para a função tireoidiana.'
  },
  {
    id: 'uy-lengua-vinagreta-magra',
    name: 'Lengua a la Vinagreta Criolla con Papines al Vapor',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'definicion',
    goalLabel: 'Definición / Corte',
    protein: 43,
    calories: 380,
    carbs: 22,
    fats: 13,
    prepTimeMinutes: 20,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    description: 'Entrada y plato frío icónico de las mesas uruguayas: tiernizada, desgrasada y marinada en vinagre de manzana, ajo, perejil y huevo duro picado.',
    ingredients: [
      { name: 'Lengua vacuna tiernizada y desgrasada', quantity: '180g' },
      { name: 'Huevo duro picado fino', quantity: '1 unidad' },
      { name: 'Perejil fresco picado y ajo', quantity: '3 cucharadas' },
      { name: 'Papines cocidos al vapor', quantity: '120g' },
      { name: 'Vinagre de manzana y oliva virgen', quantity: '1 cucharada' }
    ],
    instructions: [
      'Filetear la lengua previamente cocida en fetas muy finas.',
      'Mezclar el ajo, perejil, huevo duro picado, vinagre y oliva.',
      'Colocar las fetas de lengua en una fuente cubriéndolas con la vinagreta.',
      'Acompañar con los papines al vapor tibios.'
    ],
    nutritionTip: 'Corte riquísimo en hierro, zinc y complejo B con una textura tierna que asimila nutrientes sin pesadez estomacal.'
  },
  {
    id: 'br-caldo-verde-fit-frango',
    name: 'Caldo Verde Fit com Couve e Frango Desfiado',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'definicion',
    goalLabel: 'Definición / Corte',
    protein: 38,
    calories: 290,
    carbs: 22,
    fats: 5,
    prepTimeMinutes: 20,
    difficulty: 'Fácil',
    xpReward: 20,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80',
    description: 'Sopa aconchegante adaptada para dieta: base aveludada de batata inglesa e abobrinha com frango desfiado e tiras finas de couve.',
    ingredients: [
      { name: 'Peito de frango cozido e desfiado', quantity: '150g' },
      { name: 'Batata inglesa cozida', quantity: '100g' },
      { name: 'Abobrinha verde (para dar volume sem calorias)', quantity: '150g' },
      { name: 'Couve-manteiga cortada em tiras finas', quantity: '80g' },
      { name: 'Alho dourado e azeite', quantity: 'ao gosto' }
    ],
    instructions: [
      'Cozinhar a batata com a abobrinha e bater com o mixer até formar um caldo cremoso.',
      'Adicionar o frango desfiado temperado ao caldo.',
      'Acrescentar a couve nos últimos 2 minutos mantendo-a verde e vibrante.',
      'Finalizar com um fio de azeite e alho torrado.'
    ],
    nutritionTip: 'Excelente opción para cenar en noches frías: hidratación, calor y proteína pura para recuperación mientras dormís.'
  },
  {
    id: 'uy-matambre-arrollado-magro',
    name: 'Matambre Arrollado Magro Casero con Verduras',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 46,
    calories: 420,
    carbs: 10,
    fats: 16,
    prepTimeMinutes: 30,
    difficulty: 'Intermedio',
    xpReward: 30,
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&auto=format&fit=crop&q=80',
    description: 'Plato festivo uruguayo elaborado con matambre vacuno desgrasado, relleno de zanahoria rallada, morrón rojo, huevo duro y espinaca.',
    ingredients: [
      { name: 'Matambre vacuno limpio y desgrasado', quantity: '180g' },
      { name: 'Huevos duros enteros', quantity: '2 unidades' },
      { name: 'Zanahoria en juliana', quantity: '50g' },
      { name: 'Hojas de espinaca crudas', quantity: '40g' },
      { name: 'Gelatina sin sabor y orégano', quantity: 'al gusto' }
    ],
    instructions: [
      'Extender el matambre, desgrasar al máximo y salpimentar.',
      'Colocar las hojas de espinaca, zanahoria y los huevos duros alineados en el centro.',
      'Arrollar con fuerza y atar con hilo de cocina.',
      'Hervir en caldo aromático durante 2 horas hasta que quede tierno.',
      'Prensarlo y dejar enfriar para cortar en rodajas perfectas.'
    ],
    nutritionTip: 'Contiene colágeno natural que protege tendones y articulaciones de atletas sometidos a alto impacto en sentadillas y sprints.'
  },
  {
    id: 'br-salmao-maracuja-aspargos',
    name: 'Salmão Grelhado com Molho de Maracujá e Aspargos',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'definicion',
    goalLabel: 'Definición / Corte',
    protein: 42,
    calories: 440,
    carbs: 14,
    fats: 22,
    prepTimeMinutes: 15,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=80',
    description: 'Filé de salmão selado na frigideira com redução azedinha de polpa de maracujá fresco e aspargos salteados.',
    ingredients: [
      { name: 'Filé de salmão fresco com pele', quantity: '190g' },
      { name: 'Polpa de maracujá fresca sem açúcar', quantity: '60g' },
      { name: 'Aspargos verdes frescos', quantity: '100g' },
      { name: 'Gengibre ralado e sal marinho', quantity: 'ao gosto' }
    ],
    instructions: [
      'Grelhar o salmão com a pele para baixo em fogo médio até ficar crocante e virar por 2 minutos.',
      'Em uma panelinha, reduzir a polpa de maracujá com gengibre por 3 minutos até encorpar.',
      'Saltear os aspargos rapidamente na mesma frigideira do peixe.',
      'Servir o salmão regado com o molho de maracujá e os aspargos verdes.'
    ],
    nutritionTip: 'Altíssima concentração de ômega-3 EPA e DHA que acelera a regeneração de tecidos e modula a inflamação celular.'
  },
  {
    id: 'uy-ensalada-campera-atun-huevo',
    name: 'Ensalada Campera Rioplatense de Atún y Huevo Campero',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'rapido',
    goalLabel: 'Rápido (<15 min)',
    protein: 44,
    calories: 380,
    carbs: 26,
    fats: 11,
    prepTimeMinutes: 10,
    difficulty: 'Fácil',
    xpReward: 20,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    description: 'Ensalada fresca y contundente: lomos de atún al natural, papas hervidas en cubos, huevos duros, tomates y aceitunas descarozadas.',
    ingredients: [
      { name: 'Atún al natural escurrido', quantity: '150g' },
      { name: 'Huevos duros', quantity: '2 unidades' },
      { name: 'Papa hervida en cubos', quantity: '140g' },
      { name: 'Tomate redondo en gajos', quantity: '100g' },
      { name: 'Cebolla colorada y perejil', quantity: '30g' }
    ],
    instructions: [
      'Hervir la papa y los huevos con antelación.',
      'Cortar los tomates en gajos y la cebolla en pluma.',
      'Mezclar en un bowl grande el atún desmenuzado, las papas y los vegetales.',
      'Coronar con los huevos duros partidos al medio y perejil fresco.'
    ],
    nutritionTip: 'Sin cocción en el momento: la comida salvavidas perfecta para llevar al trabajo o comer en 5 minutos post-gym.'
  },
  {
    id: 'br-omelete-queijo-coalho-tomate',
    name: 'Omelete Brasileira de Queijo Coalho e Tomate',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'desayuno_merienda',
    categoryLabel: 'Desayuno / Merienda',
    goal: 'rapido',
    goalLabel: 'Rápido (<15 min)',
    protein: 32,
    calories: 320,
    carbs: 6,
    fats: 18,
    prepTimeMinutes: 8,
    difficulty: 'Fácil',
    xpReward: 20,
    image: 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=800&auto=format&fit=crop&q=80',
    description: 'Omelete alta e dourada recheada com cubinhos de queijo coalho levemente tostados, tomate picado e orégano fresco.',
    ingredients: [
      { name: 'Ovos caipiras inteiros', quantity: '3 unidades' },
      { name: 'Clara de ovo', quantity: '1 unidade' },
      { name: 'Queijo coalho light em cubos', quantity: '35g' },
      { name: 'Tomate picadinho sem sementes', quantity: '60g' },
      { name: 'Orégano seco e manjericão', quantity: 'ao gosto' }
    ],
    instructions: [
      'Bater os ovos e a clara com sal marinho até espumar.',
      'Dourar levemente os cubinhos de coalho na frigideira.',
      'Despejar os ovos e espalhar o tomate por cima.',
      'Tapar e deixar cozinhar até a superfície firmar mantendo o queijo derretido no centro.'
    ],
    nutritionTip: 'Excelente densidade de micronutrientes: selênio, fósforo, vitamina A e B12 para fortalecimento imunológico.'
  },
  {
    id: 'uy-pescado-a-la-parrilla-limon',
    name: 'Pescado a las Brasas con Chimichurri de Limón y Romero',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'definicion',
    goalLabel: 'Definición / Corte',
    protein: 44,
    calories: 340,
    carbs: 6,
    fats: 12,
    prepTimeMinutes: 20,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80',
    description: 'Pescado entero abierto a la parrilla (tipo espalmar), cocinado con humo de leña de coronilla, rociado con jugo de limón y hierbas.',
    ingredients: [
      { name: 'Pescado blanco entero abierto o filetes gruesos', quantity: '220g' },
      { name: 'Jugo y ralladura de limones criollos', quantity: '2 unidades' },
      { name: 'Romero y tomillo frescos', quantity: 'al gusto' },
      { name: 'Aceite de oliva virgen', quantity: '1 cucharadita' },
      { name: 'Sal gruesa de mar', quantity: 'al gusto' }
    ],
    instructions: [
      'Salar el pescado y colocarlo en la parrilla o plancha bien caliente.',
      'Pincelar constantemente con el chimichurri de limón, romero y oliva.',
      'Cocinar 6 minutos del lado de la piel hasta que quede crujiente y dar vuelta 2 minutos más.'
    ],
    nutritionTip: 'Cero carbohidratos, altísima biodisponibilidad y rico en potasio y fósforo para recuperación muscular y articular.'
  },
  {
    id: 'br-picadinho-carne-legumes',
    name: 'Picadinho Carioca de Carne com Legumes e Arroz',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 45,
    calories: 460,
    carbs: 42,
    fats: 10,
    prepTimeMinutes: 25,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80',
    description: 'Um clássico das casas brasileiras: patinho ou coxão mole em cubinhos dourados na panela com cenoura, vagem e caldo aromático de carne.',
    ingredients: [
      { name: 'Patinho bovino cortado na ponta da faca em cubinhos', quantity: '180g' },
      { name: 'Cenoura e vagem picadinhas', quantity: '100g' },
      { name: 'Arroz branco ou integral soltinho', quantity: '100g' },
      { name: 'Tomate pelado e cebola picada', quantity: '60g' },
      { name: 'Cheiro-verde picadinho', quantity: 'ao gosto' }
    ],
    instructions: [
      'Selar a carne aos poucos em panela bem quente com uma gota de azeite até criar aquele fundinho dourado.',
      'Acrescentar a cebola, alho e tomate picados e deixar murchar.',
      'Adicionar a cenoura, vagem e um pouco de água fervente.',
      'Cozinhar por 15 minutos até a carne e os legumes ficarem macios com caldo aveludado.',
      'Servir acompanhado do arroz branco com cheiro-verde.'
    ],
    nutritionTip: 'Refeição perfeitamente balanceada: rica em vitaminas lipossolúveis da cenoura e ferro de fácil absorção.'
  },
  {
    id: 'uy-bife-lomo-morrones-quinoa',
    name: 'Bife de Lomo Uruguayo con Morrones Asados y Quinoa',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'rendimiento',
    goalLabel: 'Rendimiento Deportivo',
    protein: 46,
    calories: 430,
    carbs: 34,
    fats: 10,
    prepTimeMinutes: 20,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    description: 'Lomo de ternera jugoso sellado a la perfección con morrones rojos quemados a las brasas y ensalada tibia de quinoa con ciboulette.',
    ingredients: [
      { name: 'Medallón de lomo vacuno', quantity: '180g' },
      { name: 'Quinoa cocida al dente', quantity: '120g' },
      { name: 'Morrones rojos asados', quantity: '80g' },
      { name: 'Ciboulette o cebollino picado', quantity: '2 cucharadas' },
      { name: 'Aceite de oliva virgen extra', quantity: '1 cucharadita' }
    ],
    instructions: [
      'Sellar el lomo en sartén de hierro bien caliente durante 3 minutos por lado.',
      'Mezclar la quinoa tibia con el ciboulette picado, sal marina y una gota de oliva.',
      'Cortar los morrones asados en tiras.',
      'Montar el plato con la quinoa, el bife jugoso y los morrones encima.'
    ],
    nutritionTip: 'La quinoa es un pseudocereal completo con los 9 aminoácidos esenciales, ideal para potenciar la síntesis proteica.'
  },
  {
    id: 'br-farofa-fit-aveia-cenoura',
    name: 'Frango Grelhado com Farofa Fit de Aveia e Cenoura',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 47,
    calories: 460,
    carbs: 36,
    fats: 12,
    prepTimeMinutes: 15,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&auto=format&fit=crop&q=80',
    description: 'O acompanhamento favorito do brasileiro reinventado: peito de frango grelhado com farofa crocante feita com flocos de aveia tostados, ovos mexidos e cenoura ralada.',
    ingredients: [
      { name: 'Filé de peito de frango', quantity: '190g' },
      { name: 'Flocos de aveia grossos', quantity: '35g' },
      { name: 'Ovo inteiro campero', quantity: '1 unidade' },
      { name: 'Cenoura ralada fininha', quantity: '50g' },
      { name: 'Cebola e alho refogados com azeite', quantity: '1 colher de chá' }
    ],
    instructions: [
      'Grelhar o filé de frango temperado até ficar dourado e suculento.',
      'Em outra frigideira, refogar a cebola e alho com azeite.',
      'Adicionar o ovo mexido e a cenoura ralada.',
      'Jogar os flocos de aveia e mexer em fogo médio por 3 minutos até tostar e ficar bem crocante como uma farofa tradicional.',
      'Servir a farofa quentinha ao lado do frango grelhado.'
    ],
    nutritionTip: 'Substitui a farinha de mandioca refinada por fibras solúveis e insolúveis que melhoram o trânsito intestinal e prolongam a energia.'
  },
  {
    id: 'uy-sopa-criolla-proteica',
    name: 'Sopa Criolla Reparadora de Carne y Verduras del Huerto',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'definicion',
    goalLabel: 'Definición / Corte',
    protein: 36,
    calories: 270,
    carbs: 18,
    fats: 5,
    prepTimeMinutes: 25,
    difficulty: 'Fácil',
    xpReward: 20,
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80',
    description: 'Caldo de cocción lenta con osobuco desgrasado, puerro, apio, zapallito y zanahoria para reposición celular de invierno.',
    ingredients: [
      { name: 'Carne vacuna magra desmenuzada', quantity: '150g' },
      { name: 'Caldo casero de huesos y verduras desgrasado', quantity: '350ml' },
      { name: 'Apio, puerro y zanahoria en rodajas', quantity: '120g' },
      { name: 'Zapallito en cubitos', quantity: '80g' },
      { name: 'Hojas de laurel y pimienta en grano', quantity: 'al gusto' }
    ],
    instructions: [
      'Cocinar la carne en el caldo casero con las hierbas hasta que esté suave y tierna.',
      'Incorporar las verduras y cocinar 12 minutos manteniendo su frescura.',
      'Servir caliente en cuenco hondo.'
    ],
    nutritionTip: 'Máxima hidratación con electrolitos (sodio, potasio, magnesio) esenciales para prevenir fatiga del sistema nervioso central.'
  },
  {
    id: 'uy-matambre-leche-desgrasada',
    name: 'Matambre Tiernizado a la Leche Desgrasada con Calabaza',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 48,
    calories: 460,
    carbs: 24,
    fats: 15,
    prepTimeMinutes: 40,
    difficulty: 'Intermedio',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&auto=format&fit=crop&q=80',
    description: 'Técnica gaucha uruguaya para tiernizar el matambre: cocido a fuego lento en leche descremada con hierbas aromáticas, ajo y servido con calabaza asada caramelizada al horno.',
    ingredients: [
      { name: 'Matambre vacuno magro desgrasado', quantity: '200g' },
      { name: 'Leche descremada / deslactosada', quantity: '250ml' },
      { name: 'Calabaza criolla en cubos asada', quantity: '200g' },
      { name: 'Dientes de ajo aplastados y laurel', quantity: '2 unidades' },
      { name: 'Romero fresco y pimienta negra', quantity: 'al gusto' }
    ],
    instructions: [
      'Desgrasar minuciosamente el matambre y cortar en porciones medianas.',
      'Colocar en una cacerola con la leche descremada, ajo aplastado, laurel y sal marina.',
      'Cocinar tapado a fuego suave durante 35 minutos hasta que la carne quede sumamente blanda.',
      'Dorar a horno fuerte los últimos 5 minutos con la calabaza asada con romero.'
    ],
    nutritionTip: 'La cocción lenta en lácteos predigiere el tejido conectivo facilitando una absorción ultrarrápida de aminoácidos esenciales.'
  },
  {
    id: 'uy-albondigas-ternera-pure-mixto',
    name: 'Albóndigas Criollas de Ternera con Puré Mixto',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'rendimiento',
    goalLabel: 'Rendimiento Deportivo',
    protein: 45,
    calories: 440,
    carbs: 42,
    fats: 9,
    prepTimeMinutes: 30,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    description: 'Albóndigas tiernas de ternera magra con avena fina en lugar de pan rallado, estofadas en salsa de tomate natural y servidas con puré mixto de calabaza y papa.',
    ingredients: [
      { name: 'Carne picada de ternera magra (nalga/bola de lomo)', quantity: '180g' },
      { name: 'Avena instantánea molida', quantity: '25g' },
      { name: 'Huevo campero batido', quantity: '1 unidad' },
      { name: 'Puré mixto de papa y calabaza', quantity: '200g' },
      { name: 'Salsa casera de tomates y orégano', quantity: '120g' }
    ],
    instructions: [
      'Amasar la carne picada con el huevo, la avena molida, ajo y perejil picado.',
      'Formar bolitas de tamaño parejo y dorar en sartén con una gota de aceite.',
      'Agregar la salsa de tomate y dejar cocinar 15 minutos a fuego suave.',
      'Acompañar con el puré mixto caliente espolvoreado con nuez moscada.'
    ],
    nutritionTip: 'El puré mixto aporta electrolitos y carbohidratos de asimilación dual perfectos para reponer los depósitos de glucógeno hepático y muscular.'
  },
  {
    id: 'uy-frittata-zapallito-ricota',
    name: 'Tarta Criolla de Zapallitos y Ricota sin Masa',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'definicion',
    goalLabel: 'Definición / Corte',
    protein: 36,
    calories: 290,
    carbs: 16,
    fats: 8,
    prepTimeMinutes: 25,
    difficulty: 'Fácil',
    xpReward: 20,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
    description: 'Solución fitness para eliminar la masa calórica de las tartas tradicionales: abundantes zapallitos en cubos, ricota magra artesanal, claras batidas a punto nieve y toque de orégano serrano.',
    ingredients: [
      { name: 'Zapallitos redondos salteados escurridos', quantity: '250g' },
      { name: 'Ricota magra o requesón descremado', quantity: '120g' },
      { name: 'Claras de huevo a nieve + 1 yema', quantity: '4 claras + 1 yema' },
      { name: 'Cebolla salteada dorada', quantity: '40g' },
      { name: 'Queso magro rallado fino', quantity: '20g' }
    ],
    instructions: [
      'Saltear los zapallitos y escurrir en un colador para eliminar el exceso de humedad.',
      'Mezclar con la ricota magra desmenuzada y la cebolla dorada.',
      'Incorporar las claras batidas a nieve con movimientos envolventes.',
      'Volcar en molde de silicona y hornear a 190°C durante 20 minutos hasta que infle y dore.'
    ],
    nutritionTip: 'Apenas 290 kcal con 36g de proteína neta. Máximo volumen en plato para calmar el apetito en etapas de recorte calórico.'
  },
  {
    id: 'uy-bife-cuadril-huevos-ensalada-fit',
    name: 'Bife de Cuadril con Huevos al Agua y Ensalada Rusa Fit',
    country: 'uruguay',
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 47,
    calories: 480,
    carbs: 32,
    fats: 13,
    prepTimeMinutes: 20,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&auto=format&fit=crop&q=80',
    description: 'El clásico bife a caballo rioplatense pero con huevos cocinados al agua vaporizada y ensalada rusa ligera con mayonesa de yogur griego y mostaza.',
    ingredients: [
      { name: 'Bife de cuadril vacuno magro', quantity: '180g' },
      { name: 'Huevos cocinados al agua/plancha', quantity: '2 unidades' },
      { name: 'Papa y zanahoria hervidas en cubos con arvejas', quantity: '150g' },
      { name: 'Yogur natural descremado con limón y mostaza', quantity: '50g' },
      { name: 'Sal marina y pimienta negra', quantity: 'al gusto' }
    ],
    instructions: [
      'Grelhar el bife en plancha bien caliente 3-4 minutos por lado.',
      'Cocinar los 2 huevos en sartén con 2 cucharadas de agua tapada para que cuajen perfectamente.',
      'Armar la ensalada rusa mezclando los vegetales hervidos fríos con el aderezo proteico de yogur y mostaza.',
      'Servir el bife coronado con los huevos y la ensalada fresca al costado.'
    ],
    nutritionTip: 'El aderezo de yogur griego añade 6g adicionales de proteína láctea de alta calidad sustituyendo los aceites refinados de la mayonesa comercial.'
  },
  {
    id: 'br-escondidinho-mandioquinha-patinho',
    name: 'Escondidinho de Mandioquinha com Patinho Moído',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia',
    goalLabel: 'Hipertrofia Muscular',
    protein: 46,
    calories: 450,
    carbs: 42,
    fats: 10,
    prepTimeMinutes: 30,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
    description: 'Receita queridinha do fitness brasileiro: carne bovina magra refogada no alho, cebola e tomate fresco, coberta por um purê aveludado de mandioquinha (batata-baroa) e queijo gratinado.',
    ingredients: [
      { name: 'Patinho bovino moído bem magro', quantity: '180g' },
      { name: 'Mandioquinha (batata-baroa) cozida', quantity: '200g' },
      { name: 'Tomate e cebola picadinhos', quantity: '60g' },
      { name: 'Queijo muçarela light ralado', quantity: '20g' },
      { name: 'Cheiro-verde e páprica defumada', quantity: 'ao gosto' }
    ],
    instructions: [
      'Refogar o patinho moído na panela bem quente com cebola, alho, páprica e tomate até secar o caldinho.',
      'Amassar a mandioquinha com um garfo com um pouquinho de água do cozimento até virar purê.',
      'Em um refratário, colocar a carne no fundo e cobrir com o purê de mandioquinha.',
      'Polvilhar o queijo muçarela light e levar ao forno alto por 12 minutos para dourar.'
    ],
    nutritionTip: 'A mandioquinha tem carboidratos de rápida assimilação muscular sem provocar fermentação ou inchaço estomacal.'
  },
  {
    id: 'br-crepioca-doce-banana-whey',
    name: 'Crepioca Doce com Banana, Canela e Whey Protein',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'desayuno_merienda',
    categoryLabel: 'Desayuno / Merienda',
    goal: 'rendimiento',
    goalLabel: 'Rendimiento Deportivo',
    protein: 35,
    calories: 360,
    carbs: 38,
    fats: 6,
    prepTimeMinutes: 10,
    difficulty: 'Fácil',
    xpReward: 20,
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&auto=format&fit=crop&q=80',
    description: 'A versão doce mais pedida nas academias brasileiras: massa proteica de tapioca batida com ovo e whey protein, recheada com banana fatiada e canela aquecida.',
    ingredients: [
      { name: 'Goma de tapioca hidratada', quantity: '25g' },
      { name: 'Whey protein de baunilha ou chocolate', quantity: '20g' },
      { name: 'Ovo inteiro + 1 clara', quantity: '2 unidades' },
      { name: 'Banana prata fatiada', quantity: '1 unidade (80g)' },
      { name: 'Canela em pó do ceilão', quantity: '1 colher de chá' }
    ],
    instructions: [
      'Misturar no bowl a tapioca, o whey protein, o ovo e a clara com um garfo até dissolver.',
      'Despejar na frigideira antiaderente untada e dourar os dois lados.',
      'Rechear com a banana fatiada e salpicar canela em pó abundante.',
      'Dobrar como um crepe e saborear quentinho.'
    ],
    nutritionTip: 'A canela atua como sensibilizadora natural dos receptores de insulina melhorando a captação de glicose pós-treino.'
  },
  {
    id: 'br-cuscuz-nordestino-ovos-coalho',
    name: 'Cuscuz Nordestino Fit com Ovos Mexidos e Queijo Coalho',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'desayuno_merienda',
    categoryLabel: 'Desayuno / Merienda',
    goal: 'rendimiento',
    goalLabel: 'Rendimiento Deportivo',
    protein: 30,
    calories: 380,
    carbs: 45,
    fats: 9,
    prepTimeMinutes: 15,
    difficulty: 'Fácil',
    xpReward: 20,
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80',
    description: 'A energia pura do Nordeste brasileiro: flocão de milho hidratado e cozido no vapor da cuscuzeira, servido com ovos caipiras mexidos na manteiga ghee e queijo coalho light tostado.',
    ingredients: [
      { name: 'Flocão de milho para cuscuz hidratado com água e sal', quantity: '60g (cru)' },
      { name: 'Ovos caipiras inteiros', quantity: '2 unidades' },
      { name: 'Clara de ovo', quantity: '1 unidade' },
      { name: 'Queijo coalho light em cubos dourados', quantity: '25g' },
      { name: 'Manteiga ghee ou azeite', quantity: '1 pontinha de colher' }
    ],
    instructions: [
      'Hidratar o flocão com água e uma pitada de sal por 10 minutos.',
      'Cozinhar na cuscuzeira no vapor por 8 minutos até subir o aroma característico.',
      'Mexer os ovos e a clara em fogo brando deixando-os bem úmidos e cremosos.',
      'Tostar os cubinhos de queijo coalho e servir sobre o cuscuz fumegante.'
    ],
    nutritionTip: 'Sem glúten e rico em carotenoides naturais (luteína e zeaxantina) que apoiam a visão e combatem radicais livres.'
  },
  {
    id: 'br-file-mignon-suino-abacaxi',
    name: 'Filé Mignon Suíno com Abacaxi Grelhado e Arroz Integral',
    country: 'brasil',
    countryLabel: 'Brasil',
    flag: '🇧🇷',
    category: 'almuerzo_cena',
    categoryLabel: 'Almuerzo / Cena',
    goal: 'definicion',
    goalLabel: 'Definición / Corte',
    protein: 46,
    calories: 420,
    carbs: 36,
    fats: 8,
    prepTimeMinutes: 20,
    difficulty: 'Fácil',
    xpReward: 25,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
    description: 'O corte suíno mais magro e nobre grelhado com rodelas de abacaxi douradas na frigideira, que fornecem bromelina para acelerar a digestão de proteínas.',
    ingredients: [
      { name: 'Filé mignon suíno fatiado em medalhões', quantity: '190g' },
      { name: 'Abacaxi fresco em rodelas grelhadas', quantity: '100g' },
      { name: 'Arroz integral soltinho cozido', quantity: '100g' },
      { name: 'Alecrim fresco, alho e sal', quantity: 'ao gosto' }
    ],
    instructions: [
      'Temperar os medalhões de filé suíno com alecrim fresco, alho amassado e sal.',
      'Grelhar na frigideira por 4 minutos de cada lado até ficarem dourados por fora e suculentos por dentro.',
      'Grelhar as fatias de abacaxi na mesma frigideira até caramelizar levemente.',
      'Servir acompanhado do arroz integral quentinho.'
    ],
    nutritionTip: 'A bromelina do abacaxi é uma enzima proteolítica natural que quebra as moléculas de proteína acelerando sua absorção celular.'
  }
];

// Helper para cargar recetas base + las agregadas por el usuario en localStorage
const CUSTOM_RECIPES_KEY = 'maxform_custom_recipes_catalog_v1';

export function getAllRecipes(): RecipeItem[] {
  if (typeof window === 'undefined') return INITIAL_RECIPES;
  try {
    const raw = localStorage.getItem(CUSTOM_RECIPES_KEY);
    if (!raw) return INITIAL_RECIPES;
    const customList: RecipeItem[] = JSON.parse(raw);
    return [...customList, ...INITIAL_RECIPES];
  } catch {
    return INITIAL_RECIPES;
  }
}

export function saveNewCustomRecipe(recipe: Omit<RecipeItem, 'id' | 'isCustom'>): RecipeItem {
  const newRecipe: RecipeItem = {
    ...recipe,
    id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    isCustom: true,
  };

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CUSTOM_RECIPES_KEY);
      const list: RecipeItem[] = raw ? JSON.parse(raw) : [];
      list.unshift(newRecipe);
      localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error guardando receta personalizada:', e);
    }
  }

  return newRecipe;
}

export function deleteCustomRecipe(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(CUSTOM_RECIPES_KEY);
    if (!raw) return;
    const list: RecipeItem[] = JSON.parse(raw);
    const filtered = list.filter((r) => r.id !== id);
    localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error eliminando receta:', e);
  }
}
