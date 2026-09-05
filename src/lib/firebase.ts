import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} from "firebase/firestore";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Inicializar Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
export const auth = getAuth(app);

// Helper para usuario anónimo o autenticado
export async function ensureAuthUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          unsubscribe();
          resolve(cred.user);
        } catch (e) {
          console.warn("Autenticación Firebase offline o limitada:", e);
          unsubscribe();
          resolve(null);
        }
      }
    });
  });
}

// Estructura de tipos principales de MAXFORM
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
