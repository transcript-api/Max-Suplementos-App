import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

// Variables de entorno cliente de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder')
  );
};

// Cliente Supabase resiliente (evita crasheos si aún no se han configurado las claves)
let client: SupabaseClient;

if (isSupabaseConfigured()) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
} else {
  // Fallback no bloqueante para entorno de previsualización sin credenciales cargadas
  client = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export const supabase = client;

// Helper para obtener el usuario autenticado actual o sesión anónima/local
export async function ensureAuthUser(): Promise<SupabaseUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return null;
    }
    return data.user;
  } catch (err) {
    console.warn('[Supabase] Error comprobando sesión:', err);
    return null;
  }
}

// Estructura de tipos del Atleta para Supabase
export interface UserProfile {
  id: string;
  name: string;
  level: string;
  levelNumber: number;
  xp: number;
  streakDays: number;
  weightKg: number;
  formAveragePct: number;
  avatarUrl: string;
  commitmentLevel: 'Básico' | 'Intermedio' | 'Avanzado' | 'Extremo';
  subscribed: boolean;
  supplements: {
    wheyDaysRemaining: number;
    creatineDaysRemaining: number;
  };
}

export function createCleanUserProfile(id: string, name: string = 'Atleta'): UserProfile {
  return {
    id,
    name,
    level: "Básico",
    levelNumber: 1,
    xp: 0,
    streakDays: 0,
    weightKg: 70.0,
    formAveragePct: 0,
    avatarUrl: "",
    commitmentLevel: "Básico",
    subscribed: false,
    supplements: {
      wheyDaysRemaining: 0,
      creatineDaysRemaining: 0
    }
  };
}
