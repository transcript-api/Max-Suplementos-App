# MAXFORM — Modelo de Datos y Esquema de Base de Datos

Este documento define el modelo relacional normalizado para PostgreSQL / Supabase y la abstracción de repositorio implementada en MAXFORM.

---

## 1. Esquema Relacional Normalizado

### `users`
- `id` (UUID, PK)
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- `last_sign_in_at` (TIMESTAMP WITH TIME ZONE)

### `profiles`
- `user_id` (UUID, PK, FK -> users.id)
- `full_name` (VARCHAR(120), NOT NULL)
- `avatar_url` (TEXT)
- `timezone` (VARCHAR(50), DEFAULT 'UTC')
- `membership_plan` (VARCHAR(20), DEFAULT 'free') -- 'free' | 'pro'
- `pro_expires_at` (TIMESTAMP WITH TIME ZONE)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### `biometrics`
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, NOT NULL)
- `weight_kg` (NUMERIC(5,2))
- `height_cm` (NUMERIC(5,2))
- `target_protein_g` (INTEGER, DEFAULT 150)
- `target_water_ml` (INTEGER, DEFAULT 3000)
- `target_calories` (INTEGER, DEFAULT 2200)
- `recorded_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### `daily_logs`
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, NOT NULL)
- `date` (DATE, NOT NULL) -- YYYY-MM-DD canónico según la zona horaria del atleta
- `protein_g` (INTEGER, DEFAULT 0)
- `water_ml` (INTEGER, DEFAULT 0)
- `form_percentage` (INTEGER, DEFAULT 0)
- `completed_objectives_count` (INTEGER, DEFAULT 0)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- **Restricción de unicidad**: `UNIQUE(user_id, date)`

### `xp_transactions`
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, NOT NULL)
- `amount` (INTEGER, NOT NULL)
- `source` (VARCHAR(50), NOT NULL) -- 'entrenamiento', 'nutricion', 'agua', 'suplemento', 'pasos', 'sueno'
- `reference_date` (DATE, NOT NULL)
- `idempotency_key` (VARCHAR(100), UNIQUE)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### `coupons`
- `code` (VARCHAR(40), PK)
- `plan` (VARCHAR(20), NOT NULL) -- 'pro'
- `duration_days` (INTEGER, NOT NULL)
- `max_uses` (INTEGER, NOT NULL)
- `current_uses` (INTEGER, DEFAULT 0)
- `expires_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### `coupon_redemptions`
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, NOT NULL)
- `coupon_code` (VARCHAR(40), FK -> coupons.code, NOT NULL)
- `redeemed_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- **Restricción de unicidad**: `UNIQUE(user_id, coupon_code)`

### `recipes_catalog`
- `id` (VARCHAR(100), PK)
- `name` (VARCHAR(150), NOT NULL)
- `category` (VARCHAR(50))
- `goal` (VARCHAR(50))
- `protein` (NUMERIC(5,1))
- `calories` (NUMERIC(6,1))
- `carbs` (NUMERIC(5,1))
- `fats` (NUMERIC(5,1))
- `ingredients` (JSONB)
- `instructions` (JSONB)
- `is_custom` (BOOLEAN, DEFAULT FALSE)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### `level_protocols`
- `id` (VARCHAR(50), PK) -- 'Básico', 'Intermedio', 'Avanzado', 'Extremo'
- `weekly_workouts` (VARCHAR(100))
- `workout_duration` (VARCHAR(100))
- `protein_ratio` (VARCHAR(100))
- `hydration_goal` (VARCHAR(100))
- `task_count` (INTEGER)
- `active` (BOOLEAN, DEFAULT TRUE)

### `admin_audit_logs`
- `id` (VARCHAR(100), PK)
- `action` (VARCHAR(100), NOT NULL)
- `admin_user` (VARCHAR(120), NOT NULL)
- `details` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

---

## 2. Niveles de Persistencia (Producción vs. Entorno Local)

- **Persistencia de Producción (Cloud Run / Vercel / Multi-Instancia)**:
  La base de datos autoritaria es **Supabase PostgreSQL**. Los entornos de producción (contenedores Cloud Run o lambdas Vercel) son efímeros y no deben depender del sistema de archivos local. Todas las tablas listadas arriba cuentan con Row Level Security (RLS).
- **Almacenamiento Local de Respaldo (`.data/server_state.json`)**:
  Es una capa de contingencia **exclusivamente para desarrollo local offline**. Permite trabajar sin conexión a Supabase, pero **NO** constituye una solución de producción para infraestructuras multi-instancia o serverless.

---

## 3. Reglas de Seguridad a Nivel de Fila (RLS)

- Cada usuario solo puede ejecutar `SELECT`, `INSERT` o `UPDATE` sobre registros donde `auth.uid() = user_id`.
- Las tablas `coupons`, `xp_transactions`, `level_protocols` y `admin_audit_logs` sólo son modificables a través de funciones y roles de servicio autoritarios del backend (`service_role`) o administradores autenticados.
- Ningún usuario puede consultar registros de otros atletas a excepción de tablas de ranking agregadas de solo lectura.

