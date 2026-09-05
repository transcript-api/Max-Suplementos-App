import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from './firebase';

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

  private initSession() {
    // Escuchar cambios en Firebase Auth si está disponible
    try {
      if (auth) {
        firebaseOnAuthStateChanged(auth, (fbUser) => {
          if (fbUser && fbUser.email) {
            const appUser: AppUser = {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || fbUser.email.split('@')[0],
              createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
            };
            this.setCurrentUser(appUser);
            return;
          }
          // Si no hay usuario de Firebase autenticado por email, comprobar sesión local
          this.loadLocalActiveSession();
        });
      } else {
        this.loadLocalActiveSession();
      }
    } catch {
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

  // Registro de nuevo usuario
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

    // Intentar registrar en Firebase Auth
    try {
      if (auth) {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        if (cred.user) {
          uid = cred.user.uid;
        }
      }
    } catch (fbErr: any) {
      // Si Firebase responde con email-already-in-use, relanzar
      if (fbErr.code === 'auth/email-already-in-use') {
        throw new Error('Este correo ya se encuentra registrado. Por favor inicia sesión.');
      }
      console.warn('Registro Firebase online diferido o local fallback:', fbErr.message);
    }

    // Registrar en almacenamiento de usuarios para aislamiento estricto
    const users = getLocalUsers();
    // Verificar si el correo ya existe localmente
    const existing = Object.values(users).find((u) => u.email === cleanEmail);
    if (existing) {
      throw new Error('Este correo electrónico ya está registrado.');
    }

    users[uid] = {
      uid,
      email: cleanEmail,
      displayName: cleanName,
      passwordHash: btoa(password), // Simulación de verificación local
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

  // Inicio de sesión
  public async login(email: string, password: string): Promise<AppUser> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Por favor completa todos los campos.');
    }

    // Intentar en Firebase Auth
    try {
      if (auth) {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        if (cred.user) {
          const appUser: AppUser = {
            uid: cred.user.uid,
            email: cred.user.email || cleanEmail,
            displayName: cred.user.displayName || cleanEmail.split('@')[0],
            createdAt: cred.user.metadata.creationTime || new Date().toISOString(),
          };
          this.setCurrentUser(appUser);
          return appUser;
        }
      }
    } catch (fbErr: any) {
      console.warn('Login Firebase online diferido, verificando local:', fbErr.code);
    }

    // Verificación en usuarios locales
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

  // Recuperación de contraseña
  public async resetPassword(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Por favor ingresa un correo electrónico válido.');
    }

    try {
      if (auth) {
        await sendPasswordResetEmail(auth, cleanEmail);
      }
    } catch (e) {
      console.warn('Reset password email online diferido:', e);
    }
  }

  // Cierre de sesión
  public async logout(): Promise<void> {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
    } catch (e) {
      console.warn('Firebase signOut error:', e);
    }
    this.setCurrentUser(null);
  }

  // Eliminación completa de cuenta (aislamiento y privacidad)
  public async deleteAccount(userId: string): Promise<void> {
    const users = getLocalUsers();
    delete users[userId];
    saveLocalUsers(users);

    // Limpiar claves asociadas a este usuario
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
