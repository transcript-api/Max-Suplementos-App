-- ==============================================================================
-- MAXFORM PERFORMANCE SYSTEM - SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- Arquitectura Relacional con Row Level Security (RLS) y Triggers de Sincronización
-- ==============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla: Perfiles de Usuario (profiles) vinculada a Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT DEFAULT 'Atleta',
  commitment_level TEXT DEFAULT 'Básico' CHECK (commitment_level IN ('Básico', 'Intermedio', 'Avanzado', 'Extremo')),
  avatar_url TEXT DEFAULT '',
  is_pro BOOLEAN DEFAULT FALSE,
  pro_expiry TIMESTAMPTZ,
  referral_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden leer su propio perfil" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 3. Tabla: Estado Operativo y Gamificación del Atleta (athlete_states)
CREATE TABLE IF NOT EXISTS public.athlete_states (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  level_name TEXT DEFAULT 'Básico',
  streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  form_score NUMERIC(5,2) DEFAULT 0.00,
  completed_objectives INTEGER DEFAULT 0,
  hydration NUMERIC(4,2) DEFAULT 0.00,
  protein NUMERIC(6,2) DEFAULT 0.00,
  challenges_completed INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  first_dashboard_seen BOOLEAN DEFAULT FALSE,
  state_payload JSONB DEFAULT '{}'::jsonb,
  last_active_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.athlete_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden leer su propio estado" 
  ON public.athlete_states FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden modificar su propio estado" 
  ON public.athlete_states FOR ALL 
  USING (auth.uid() = user_id);

-- 4. Tabla: Objetivos Diarios (daily_tasks)
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL, -- ej: 'agua', 'entrenamiento', 'nutricion', 'suplemento'
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  detail TEXT DEFAULT '',
  xp_reward INTEGER DEFAULT 10,
  completed BOOLEAN DEFAULT FALSE,
  date DATE DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_key, date)
);

ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestión de tareas propias" 
  ON public.daily_tasks FOR ALL 
  USING (auth.uid() = user_id);

-- 5. Tabla: Registros Nutricionales y de Comidas (food_logs)
CREATE TABLE IF NOT EXISTS public.food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  protein NUMERIC(6,2) DEFAULT 0.00,
  carbs NUMERIC(6,2) DEFAULT 0.00,
  fats NUMERIC(6,2) DEFAULT 0.00,
  calories NUMERIC(6,2) DEFAULT 0.00,
  micronutrients JSONB DEFAULT '{}'::jsonb,
  date DATE DEFAULT CURRENT_DATE,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestión de logs nutricionales propios" 
  ON public.food_logs FOR ALL 
  USING (auth.uid() = user_id);

-- 6. Tabla: Auditoría Transaccional de XP (xp_transactions) - Anti-exploit
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  objective_id TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'task_completion', 'challenge', 'streak_bonus'
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, objective_id, date) -- Garantiza 1 recompensa diaria por objetivo
);

ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura de transacciones de XP propias" 
  ON public.xp_transactions FOR SELECT 
  USING (auth.uid() = user_id);

-- 7. Tabla: Datos Biométricos (biometrics)
CREATE TABLE IF NOT EXISTS public.biometrics (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,2),
  age INTEGER,
  target_hydration_liters NUMERIC(4,2) DEFAULT 3.00,
  target_protein_grams NUMERIC(6,2) DEFAULT 160.00,
  target_calories NUMERIC(6,2) DEFAULT 2400.00,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.biometrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestión de biometría propia" 
  ON public.biometrics FOR ALL 
  USING (auth.uid() = user_id);

-- 8. Tabla: Suplementación e Inventario (supplements)
CREATE TABLE IF NOT EXISTS public.supplements (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  whey_days_remaining INTEGER DEFAULT 0,
  creatine_days_remaining INTEGER DEFAULT 0,
  auto_replenish_enabled BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestión de inventario de suplementos propio" 
  ON public.supplements FOR ALL 
  USING (auth.uid() = user_id);

-- 9. Trigger automático: Al crear un usuario en auth.users, instanciar perfil y estado inicial en public
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );

  INSERT INTO public.athlete_states (user_id, xp, level, streak_days, form_score)
  VALUES (NEW.id, 0, 1, 0, 0);

  INSERT INTO public.supplements (user_id, whey_days_remaining, creatine_days_remaining)
  VALUES (NEW.id, 0, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Índices para optimización de consultas
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON public.daily_tasks(user_id, date);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON public.food_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_xp_tx_user_date ON public.xp_transactions(user_id, date);
