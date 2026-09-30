import { supabase, isSupabaseConfigured } from './supabase';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  isDemo?: boolean;
  isLocalOnly?: boolean;
  /** true cuando la cuenta se creó pero todavía no hay sesión activa
   *  (Supabase exige confirmar el email antes de emitir el token). Mientras
   *  esto sea true, cualquier lectura/escritura a Supabase va a fallar con
   *  401/406 porque auth.uid() es null para el cliente. */
  emailConfirmationPending?: boolean;
}

const ACTIVE_SESSION_KEY = 'maxform_active_session_v2';
const LOCAL_ATHLETES_KEY = 'maxform_local_athletes_v2';

// Limpieza proactiva de claves de contraseñas inseguras de versiones previas
try {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('maxform_registered_users_v1');
    localStorage.removeItem('maxform_active_session_uid_v1');
  }
} catch {
  // Entorno sin localStorage
}

interface LocalAthleteProfile {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string;
}

function getLocalAthletes(): Record<string, LocalAthleteProfile> {
  try {
    const raw = localStorage.getItem(LOCAL_ATHLETES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalAthletes(athletes: Record<string, LocalAthleteProfile>) {
  try {
    localStorage.setItem(LOCAL_ATHLETES_KEY, JSON.stringify(athletes));
  } catch (e) {
    console.warn('Error guardando atletas locales:', e);
  }
}

class AuthService {
  private currentUser: AppUser | null = null;
  private listeners: Array<(user: AppUser | null) => void> = [];

  constructor() {
    this.initSession();
  }

  private async initSession() {
    try {
      if (isSupabaseConfigured()) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const user = session.user;
          const appUser: AppUser = {
            uid: user.id,
            email: user.email || '',
            displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Atleta',
            createdAt: user.created_at || new Date().toISOString(),
          };
          this.setCurrentUser(appUser);
        } else {
          this.loadLocalActiveSession();
        }

        supabase.auth.onAuthStateChange((_event, session) => {
          if (session && session.user) {
            const user = session.user;
            const appUser: AppUser = {
              uid: user.id,
              email: user.email || '',
              displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Atleta',
              createdAt: user.created_at || new Date().toISOString(),
            };
            this.setCurrentUser(appUser);
          } else if (_event === 'SIGNED_OUT') {
            this.setCurrentUser(null);
          }
        });
      } else {
        this.loadLocalActiveSession();
      }
    } catch (err) {
      console.warn('[AuthService] Inicialización de sesión local fallback:', err);
      this.loadLocalActiveSession();
    }
  }

  private loadLocalActiveSession() {
    try {
      const activeRaw = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (activeRaw) {
        const parsed = JSON.parse(activeRaw) as AppUser;
        if (parsed && parsed.uid) {
          this.setCurrentUser(parsed);
          return;
        }
      }
    } catch {
      // Ignorar fallback
    }
    this.setCurrentUser(null);
  }

  private setCurrentUser(user: AppUser | null) {
    this.currentUser = user;
    try {
      if (user) {
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
      }
    } catch {
      // localStorage no disponible
    }
    this.listeners.forEach((listener) => listener(this.currentUser));
  }

  public onAuthStateChanged(callback: (user: AppUser | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  public getCurrentUser(): AppUser | null {
    return this.currentUser;
  }

  /**
   * Registro seguro de nuevo usuario.
   * Regla de seguridad: Si no hay Supabase configurado, no finge almacenamiento de contraseñas con btoa.
   */
  public async register(email: string, password: string, displayName: string): Promise<AppUser> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Por favor ingresa un correo electrónico válido.');
    }
    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }
    if (!cleanName) {
      throw new Error('Por favor ingresa tu nombre.');
    }

    if (!isSupabaseConfigured()) {
      throw new Error(
        'El backend de autenticación en la nube (Supabase) no está configurado en las variables de entorno. ' +
        'Para probar la aplicación puedes continuar en Modo Demo o como Atleta Local sin contraseña.'
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          display_name: cleanName,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('Este correo ya se encuentra registrado. Por favor inicia sesión.');
      }
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No se pudo crear la cuenta de usuario.');
    }

    // Si el proyecto exige confirmar el email, signUp crea el usuario pero no
    // entrega sesión (data.session es null). No hay que tratar esto como un
    // login real: auth.uid() seguirá siendo null hasta que confirme el email,
    // así que cualquier sync a Supabase fallaría en silencio.
    const emailConfirmationPending = !data.session;

    const newUser: AppUser = {
      uid: data.user.id,
      email: cleanEmail,
      displayName: cleanName,
      createdAt: data.user.created_at || new Date().toISOString(),
      emailConfirmationPending,
    };

    if (!emailConfirmationPending) {
      this.setCurrentUser(newUser);
    }
    return newUser;
  }

  /**
   * Inicio de sesión seguro con Supabase.
   */
  public async login(email: string, password: string): Promise<AppUser> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Por favor completa todos los campos.');
    }

    if (!isSupabaseConfigured()) {
      throw new Error(
        'El backend de autenticación en la nube (Supabase) no está configurado. ' +
        'Para ingresar puedes usar el Modo Demo o continuar como Atleta Local.'
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      throw new Error('Credenciales incorrectas o usuario no verificado: ' + error.message);
    }

    if (!data.user) {
      throw new Error('No se pudo recuperar la sesión del usuario.');
    }

    const appUser: AppUser = {
      uid: data.user.id,
      email: data.user.email || cleanEmail,
      displayName: data.user.user_metadata?.display_name || cleanEmail.split('@')[0],
      createdAt: data.user.created_at || new Date().toISOString(),
    };

    this.setCurrentUser(appUser);
    return appUser;
  }

  /**
   * Crear o retomar sesión como Atleta Local explícito (sin pretender ser una cuenta en la nube protegida por contraseña)
   */
  public continueAsLocalAthlete(displayName?: string): AppUser {
    const name = displayName?.trim() || 'Atleta';
    const uid = `local_athlete_${Date.now().toString(36)}`;
    const athletes = getLocalAthletes();

    const profile: LocalAthleteProfile = {
      uid,
      displayName: name,
      email: `${uid}@local.maxmind.app`,
      createdAt: new Date().toISOString(),
    };

    athletes[uid] = profile;
    saveLocalAthletes(athletes);

    const appUser: AppUser = {
      uid,
      email: profile.email,
      displayName: name,
      createdAt: profile.createdAt,
      isLocalOnly: true,
    };

    this.setCurrentUser(appUser);
    return appUser;
  }

  /**
   * Recuperación de contraseña vía Supabase
   */
  public async resetPassword(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Por favor ingresa un correo electrónico válido.');
    }

    if (!isSupabaseConfigured()) {
      throw new Error('El servicio de recuperación de contraseñas requiere Supabase configurado.');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Cierre de sesión
   */
  public async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    this.setCurrentUser(null);
  }

  /**
   * Eliminación completa de cuenta y datos asociados para aislamiento absoluto
   */
  public async deleteAccount(userId: string): Promise<void> {
    const athletes = getLocalAthletes();
    delete athletes[userId];
    saveLocalAthletes(athletes);

    const keysToRemove = [
      `maxform_user_v2_${userId}`,
      `maxform_user_${userId}_profile`,
      `maxform_user_${userId}_state`,
      `maxform_user_${userId}_macros`,
      `maxform_user_${userId}_history`,
      `maxform_user_${userId}_onboarding`,
      `maxform_user_${userId}_supplements`,
      `maxform_user_${userId}_notifications`,
      `maxform_user_${userId}_settings`,
      `maxform_onboarding_draft_${userId}`,
    ];

    keysToRemove.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        // Ignorar
      }
    });

    await this.logout();
  }
}

export const authService = new AuthService();
