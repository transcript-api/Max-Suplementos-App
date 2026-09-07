// Mapeo inteligente de fotografías reales de ingredientes para recetas uruguayas y brasileñas
export interface IngredientVisual {
  name: string;
  image: string;
  category: 'proteina' | 'carbohidrato' | 'vegetal' | 'grasa_saludable' | 'condimento';
}

const INGREDIENT_IMAGE_MAP: { keywords: string[]; image: string; category: IngredientVisual['category'] }[] = [
  // Carnes y Proteínas de Uruguay & Brasil
  {
    keywords: ['pollo', 'frango', 'pechuga', 'peito'],
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&auto=format&fit=crop&q=80',
    category: 'proteina',
  },
  {
    keywords: ['lomo', 'cuadril', 'vacio', 'vacío', 'asado', 'matambre', 'ternera', 'picanha', 'patinho', 'carne', 'alcatra', 'bife', 'mignon'],
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=300&auto=format&fit=crop&q=80',
    category: 'proteina',
  },
  {
    keywords: ['huevo', 'huevos', 'ovo', 'ovos', 'clara', 'claras'],
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=300&auto=format&fit=crop&q=80',
    category: 'proteina',
  },
  {
    keywords: ['salmon', 'salmón', 'pescado', 'peixe', 'tilapia', 'tilápia', 'merluza', 'camaron', 'camarão', 'camarones', 'pescadilla'],
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&auto=format&fit=crop&q=80',
    category: 'proteina',
  },
  {
    keywords: ['queso', 'queijo', 'ricota', 'ricotta', 'minas', 'coalho', 'requeijao', 'requeijão', 'mozzarella', 'magro'],
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&auto=format&fit=crop&q=80',
    category: 'proteina',
  },
  {
    keywords: ['whey', 'proteina en polvo', 'proteína'],
    image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=300&auto=format&fit=crop&q=80',
    category: 'proteina',
  },

  // Carbohidratos Complejos
  {
    keywords: ['boniato', 'batata doce', 'batata-doce', 'camote'],
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&auto=format&fit=crop&q=80',
    category: 'carbohidrato',
  },
  {
    keywords: ['mandioca', 'yuca', 'tapioca', 'farofa', 'goma', 'mandioquinha', 'batata-baroa', 'polvilho'],
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&auto=format&fit=crop&q=80',
    category: 'carbohidrato',
  },
  {
    keywords: ['arroz', 'integral'],
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=80',
    category: 'carbohidrato',
  },
  {
    keywords: ['avena', 'aveia', 'flocos', 'harina de avena'],
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=300&auto=format&fit=crop&q=80',
    category: 'carbohidrato',
  },
  {
    keywords: ['porotos', 'frijoles', 'feijao', 'feijão', 'lentejas', 'garbanzos'],
    image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=300&auto=format&fit=crop&q=80',
    category: 'carbohidrato',
  },
  {
    keywords: ['papa', 'papines', 'batata inglesa'],
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&auto=format&fit=crop&q=80',
    category: 'carbohidrato',
  },
  {
    keywords: ['maiz', 'milho', 'cuscuz', 'flocao', 'polenta'],
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&auto=format&fit=crop&q=80',
    category: 'carbohidrato',
  },

  // Vegetales y Frutas
  {
    keywords: ['calabaza', 'zapallo', 'zapallito', 'zucchini', 'abobora', 'abóbora', 'calabacin'],
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&auto=format&fit=crop&q=80',
    category: 'vegetal',
  },
  {
    keywords: ['espinaca', 'acelga', 'couve', 'verdes', 'rucula', 'rúcula', 'lechuga', 'alface'],
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80',
    category: 'vegetal',
  },
  {
    keywords: ['tomate', 'tomates', 'salsa', 'pomodoro', 'cherry'],
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=80',
    category: 'vegetal',
  },
  {
    keywords: ['cebolla', 'cebola', 'morron', 'morrón', 'pimiento', 'pimentao'],
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300&auto=format&fit=crop&q=80',
    category: 'vegetal',
  },
  {
    keywords: ['zanahoria', 'cenoura'],
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&auto=format&fit=crop&q=80',
    category: 'vegetal',
  },
  {
    keywords: ['limon', 'limón', 'limao', 'limão'],
    image: 'https://images.unsplash.com/photo-1533082879395-3c730f6dd61e?w=300&auto=format&fit=crop&q=80',
    category: 'vegetal',
  },
  {
    keywords: ['banana', 'platano', 'plátano'],
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop&q=80',
    category: 'carbohidrato',
  },
  {
    keywords: ['acai', 'açaí'],
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=300&auto=format&fit=crop&q=80',
    category: 'carbohidrato',
  },
  {
    keywords: ['palta', 'aguacate', 'abacate'],
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&auto=format&fit=crop&q=80',
    category: 'grasa_saludable',
  },
  {
    keywords: ['oliva', 'aceite', 'azeite', 'ghee'],
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=80',
    category: 'grasa_saludable',
  },
  {
    keywords: ['chia', 'linhaca', 'linhaça', 'semillas', 'sementes'],
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=300&auto=format&fit=crop&q=80',
    category: 'grasa_saludable',
  },
  {
    keywords: ['ajo', 'alho', 'perejil', 'salsa criolla', 'chimichurri', 'oregano', 'orégano', 'pimienta', 'sal', 'louro', 'laurel', 'vinagre'],
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&auto=format&fit=crop&q=80',
    category: 'condimento',
  },
];

const DEFAULT_INGREDIENT_IMAGE = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300&auto=format&fit=crop&q=80';

export function getIngredientImage(ingredientName: string): { image: string; category: IngredientVisual['category'] } {
  const lower = ingredientName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  for (const item of INGREDIENT_IMAGE_MAP) {
    for (const kw of item.keywords) {
      const normalizedKw = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (lower.includes(normalizedKw)) {
        return { image: item.image, category: item.category };
      }
    }
  }

  return { image: DEFAULT_INGREDIENT_IMAGE, category: 'vegetal' };
}
