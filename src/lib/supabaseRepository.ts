import { supabase, isSupabaseConfigured } from './supabase';
import { UserAppState } from './userStore';

export class SupabaseRepository {
  /**
   * Carga el estado del atleta desde Supabase PostgreSQL
   */
  async loadAthleteState(userId: string): Promise<UserAppState | null> {
    if (!isSupabaseConfigured() || !userId || userId.includes('demo')) {
      return null;
    }

    try {
      // 1. Cargar estado de la tabla athlete_states
      const { data, error } = await supabase
        .from('athlete_states')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      // Si hay un payload completo serializado en JSONB, rehidratarlo
      if (data.state_payload && typeof data.state_payload === 'object' && Object.keys(data.state_payload).length > 0) {
        return {
          ...data.state_payload,
          userId: data.user_id,
          xp: data.xp,
          level: data.level,
          levelName: data.level_name || 'Básico',
          streakDays: data.streak_days,
          formScore: Number(data.form_score) || 0,
          completedObjectives: data.completed_objectives || 0,
          hydration: Number(data.hydration) || 0,
          protein: Number(data.protein) || 0,
          onboardingCompleted: data.onboarding_completed ?? true,
          firstDashboardSeen: data.first_dashboard_seen ?? false,
          updatedAt: data.updated_at || new Date().toISOString(),
        };
      }

      return null;
    } catch (err) {
      console.warn('[SupabaseRepository] Error cargando estado:', err);
      return null;
    }
  }

  /**
   * Guarda o actualiza el estado del atleta en Supabase PostgreSQL
   */
  async saveAthleteState(state: UserAppState): Promise<boolean> {
    if (!isSupabaseConfigured() || !state?.userId || state.userId.includes('demo')) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('athlete_states')
        .upsert({
          user_id: state.userId,
          xp: state.xp || 0,
          level: state.level || 1,
          level_name: state.levelName || 'Básico',
          streak_days: state.streakDays || 0,
          form_score: state.formScore || 0,
          completed_objectives: state.completedObjectives || 0,
          hydration: state.hydration || 0,
          protein: state.protein || 0,
          challenges_completed: state.challengesCompleted || 0,
          onboarding_completed: state.onboardingCompleted ?? true,
          first_dashboard_seen: state.firstDashboardSeen ?? false,
          state_payload: state,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) {
        console.warn('[SupabaseRepository] Error al guardar en athlete_states:', error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.warn('[SupabaseRepository] Error en persistencia Supabase:', err);
      return false;
    }
  }

  /**
   * Registra un alimento consumido en la tabla food_logs
   */
  async addFoodLog(userId: string, foodLog: {
    name: string;
    protein: number;
    carbs?: number;
    fats?: number;
    calories?: number;
    micronutrients?: any;
  }): Promise<boolean> {
    if (!isSupabaseConfigured() || !userId || userId.includes('demo')) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('food_logs')
        .insert({
          user_id: userId,
          name: foodLog.name,
          protein: foodLog.protein || 0,
          carbs: foodLog.carbs || 0,
          fats: foodLog.fats || 0,
          calories: foodLog.calories || 0,
          micronutrients: foodLog.micronutrients || {},
          logged_at: new Date().toISOString(),
        });

      if (error) {
        console.warn('[SupabaseRepository] Error insertando food_log:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[SupabaseRepository] Error guardando alimento en Supabase:', err);
      return false;
    }
  }

  /**
   * Suscribe en tiempo real a los cambios del usuario usando Supabase Realtime Channels
   */
  subscribeToAthleteChanges(userId: string, onChange: (newState: any) => void): () => void {
    if (!isSupabaseConfigured() || !userId || userId.includes('demo')) {
      return () => {};
    }

    try {
      const channel = supabase
        .channel(`athlete_changes_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'athlete_states',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (payload.new && (payload.new as any).state_payload) {
              onChange((payload.new as any).state_payload);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('[SupabaseRepository] Error creando canal Realtime:', err);
      return () => {};
    }
  }
}

export const supabaseRepository = new SupabaseRepository();
