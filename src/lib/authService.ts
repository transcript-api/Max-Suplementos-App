import { supabase, isSupabaseConfigured } from './supabase';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  isDemo?: boolean;
}

const LOCAL_USERS_KEY = 'maxform_registered_users_v1';
const ACTIVE_SESSION_KEY = 'maxform_active_session_uid_v1';

// Recuperar usuarios locales registrados para fallback offline y multi-cuenta instantánea
function getLocalUsers(): Record<string, { email: string; passwordHash: string; displayName: string; uid: string; createdAt: string }> {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalUsers(users: Record<string, any>) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Error guardando usuarios locales:', e);
  }
}

class AuthService {
  private currentUser: AppUser | null = null;
  private listeners: Array<(user: AppUser | null) => void> = [];

  constructor() {
    this.initSession();
  }

  private async initSession() {
    // Escuchar cambios de sesión en Supabase Auth si está configurado
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
    const activeUid = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (activeUid) {
      const users = getLocalUsers();
      const local = users[activeUid];
      if (local) {
        this.setCurrentUser({
          uid: local.uid,
          email: local.email,
          displayName: local.displayName,
          createdAt: local.createdAt,
        });
        return;
      }
    }
    this.setCurrentUser(null);
  }

  private setCurrentUser(user: AppUser | null) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(ACTIVE_SESSION_KEY, user.uid);
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
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

  // Registro de nuevo usuario en Supabase Auth
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

    let uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Registro con Supabase Auth
    if (isSupabaseConfigured()) {
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

      if (data.user) {
        uid = data.user.id;
      }
    }

    // Registrar también localmente para alta disponibilidad offline
    const users = getLocalUsers();
    const existing = Object.values(users).find((u) => u.email === cleanEmail);
    if (existing && !isSupabaseConfigured()) {
      throw new Error('Este correo electrónico ya está registrado.');
    }

    users[uid] = {
      uid,
      email: cleanEmail,
      displayName: cleanName,
      passwordHash: btoa(password),
      createdAt: new Date().toISOString(),
    };
    saveLocalUsers(users);

    const newUser: AppUser = {
      uid,
      email: cleanEmail,
      displayName: cleanName,
      createdAt: new Date().toISOString(),
    };

    this.setCurrentUser(newUser);
    return newUser;
  }

  // Inicio de sesión con Supabase Auth
  public async login(email: string, password: string): Promise<AppUser> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Por favor completa todos los campos.');
    }

    // Intentar inicio de sesión en Supabase
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        console.warn('[Supabase Auth] Fallo online, verificando sesión local:', error.message);
      } else if (data.user) {
        const appUser: AppUser = {
          uid: data.user.id,
          email: data.user.email || cleanEmail,
          displayName: data.user.user_metadata?.display_name || cleanEmail.split('@')[0],
          createdAt: data.user.created_at || new Date().toISOString(),
        };
        this.setCurrentUser(appUser);
        return appUser;
      }
    }

    // Verificación en usuarios locales (fallback offline)
    const users = getLocalUsers();
    const found = Object.values(users).find(
      (u) => u.email === cleanEmail && u.passwordHash === btoa(password)
    );

    if (!found) {
      throw new Error('Credenciales incorrectas. Verifica tu correo y contraseña.');
    }

    const appUser: AppUser = {
      uid: found.uid,
      email: found.email,
      displayName: found.displayName,
      createdAt: found.createdAt,
    };

    this.setCurrentUser(appUser);
    return appUser;
  }

  // Recuperación de contraseña vía Supabase
  public async resetPassword(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Por favor ingresa un correo electrónico válido.');
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) {
        throw new Error(error.message);
      }
    }
  }

  // Cierre de sesión
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

  // Eliminación completa de cuenta (aislamiento y privacidad)
  public async deleteAccount(userId: string): Promise<void> {
    const users = getLocalUsers();
    delete users[userId];
    saveLocalUsers(users);

    const keysToRemove = [
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

    keysToRemove.forEach((k) => localStorage.removeItem(k));
    await this.logout();
  }
}

export const authService = new AuthService();
