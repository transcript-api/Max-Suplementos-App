/**
 * MAXFORM Performance Health System
 * Módulo de Persistencia Offline y Sincronización Automática con Supabase PostgreSQL
 */

import { supabase, ensureAuthUser, isSupabaseConfigured } from './supabase';
import { supabaseRepository } from './supabaseRepository';

export interface OfflineFoodLog {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  timestamp: string;
  synced?: boolean;
}

export interface SyncQueueItem {
  id: string;
  type: 'TASK_UPDATE' | 'FOOD_LOG' | 'MACROS_UPDATE' | 'STATE_FULL' | 'CHALLENGE_CLAIM';
  payload: any;
  timestamp: number;
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  lastError: string | null;
}

const SYNC_QUEUE_KEY = 'maxform_offline_sync_queue_v1';
const FOOD_LOGS_KEY = 'maxform_offline_food_logs_v1';

class OfflineSyncManager {
  private listeners: ((status: SyncStatus) => void)[] = [];
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private lastSyncTime: string | null = null;
  private lastError: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initNetworkListeners();
      this.registerServiceWorker();
    }
  }

  // Registrar Service Worker
  public async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        console.log('MAXFORM Service Worker registrado correctamente:', registration.scope);

        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'TRIGGER_OFFLINE_SYNC') {
            console.log('Disparador de Background Sync recibido desde Service Worker');
            this.syncPendingActions();
          }
        });
      } catch (err) {
        console.warn('Registro de Service Worker omitido o no compatible en este contexto:', err);
      }
    }
  }

  private onlineReconciler: (() => Promise<void>) | null = null;

  public registerReconciler(handler: () => Promise<void>): () => void {
    this.onlineReconciler = handler;
    return () => {
      if (this.onlineReconciler === handler) {
        this.onlineReconciler = null;
      }
    };
  }

  // Escuchar estado de red en vivo
  private initNetworkListeners(): void {
    window.addEventListener('online', async () => {
      console.log('Conexión reestablecida. Iniciando sincronización inteligente con Supabase...');
      this.isOnline = true;
      this.notify();

      if (this.onlineReconciler) {
        try {
          await this.onlineReconciler();
        } catch (e) {
          console.warn('Error durante ejecución del reconciliador online:', e);
        }
      }

      this.syncPendingActions();
    });

    window.addEventListener('offline', () => {
      console.warn('MAXFORM en modo Offline. Cambios registrados localmente en cola protegida.');
      this.isOnline = false;
      this.notify();
    });
  }

  public subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    const status = this.getStatus();
    this.listeners.forEach((l) => l(status));
  }

  public getStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.getQueue().length,
      lastSyncTime: this.lastSyncTime,
      lastError: this.lastError,
    };
  }

  // Cola en localStorage para persistencia segura entre recargas
  public getQueue(): SyncQueueItem[] {
    try {
      const raw = localStorage.getItem(SYNC_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(queue: SyncQueueItem[]): void {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      this.notify();
    } catch (e) {
      console.error('Error guardando cola de sincronización:', e);
    }
  }

  // Limpiar toda la cola tras reconciliación exitosa
  public clearQueue(): void {
    try {
      localStorage.removeItem(SYNC_QUEUE_KEY);
      this.lastSyncTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      this.lastError = null;
      this.notify();
    } catch (e) {
      console.error('Error limpiando cola de sincronización:', e);
    }
  }

  // Filtrar elementos procesados
  public removeQueueItems(idsToRemove: string[]): void {
    const queue = this.getQueue().filter((item) => !idsToRemove.includes(item.id));
    this.saveQueue(queue);
  }

  // Obtener logs de alimentos locales
  public getLocalFoodLogs(): OfflineFoodLog[] {
    try {
      const raw = localStorage.getItem(FOOD_LOGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public saveLocalFoodLog(log: OfflineFoodLog): void {
    const logs = this.getLocalFoodLogs();
    logs.unshift(log);
    try {
      localStorage.setItem(FOOD_LOGS_KEY, JSON.stringify(logs.slice(0, 50)));
    } catch (e) {
      console.error('Error guardando log local de comida:', e);
    }
  }

  // Encolar acción y sincronizar si hay red
  public async queueAction(type: SyncQueueItem['type'], payload: any): Promise<void> {
    const item: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    const queue = this.getQueue();
    queue.push(item);
    this.saveQueue(queue);

    // Si estamos en línea, sincronizar de inmediato
    if (this.isOnline) {
      await this.syncPendingActions();
    }
  }

  // Sincronizar cola pendiente con Supabase
  public async syncPendingActions(): Promise<boolean> {
    if (this.isSyncing) return false;
    const queue = this.getQueue();
    if (queue.length === 0) {
      this.lastSyncTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      this.notify();
      return true;
    }

    if (!isSupabaseConfigured()) {
      // Si Supabase aún no está configurado, la cola se mantiene localmente sin fallar
      this.lastSyncTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      this.notify();
      return true;
    }

    this.isSyncing = true;
    this.notify();

    try {
      const user = await ensureAuthUser();
      const userId = user?.id || 'santiago-athlete-01';

      const remainingQueue: SyncQueueItem[] = [];

      for (const item of queue) {
        try {
          if (item.type === 'TASK_UPDATE' || item.type === 'STATE_FULL') {
            await supabaseRepository.saveAthleteState({
              ...item.payload,
              userId,
            });
          } else if (item.type === 'FOOD_LOG') {
            await supabaseRepository.addFoodLog(userId, {
              name: item.payload.name,
              protein: item.payload.protein,
              carbs: item.payload.carbs,
              fats: item.payload.fats,
              calories: item.payload.calories,
            });
          } else if (item.type === 'MACROS_UPDATE') {
            await supabase
              .from('athlete_states')
              .update({
                protein: item.payload.protein,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', userId);
          }
        } catch (err: any) {
          console.warn(`Error sincronizando item ${item.id} a Supabase:`, err);
          item.retryCount += 1;
          remainingQueue.push(item);
          break;
        }
      }

      this.saveQueue(remainingQueue);
      this.lastSyncTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      this.lastError = remainingQueue.length > 0 ? 'Sincronización parcial diferida' : null;
      return remainingQueue.length === 0;
    } catch (error: any) {
      console.error('Error durante sincronización con Supabase:', error);
      this.lastError = error?.message || 'Error de conexión con Supabase';
      return false;
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }
}

export const offlineSync = new OfflineSyncManager();
