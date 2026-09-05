/**
 * MAXFORM Performance Health System
 * Módulo Avanzado de Reconciliación y Resolución de Conflictos Offline/Online
 * 
 * Previene sobrescrituras accidentales combinando los cambios locales pendientes
 * con el último snapshot de Firestore mediante fusión semántica por campos.
 */

import { DailyTaskItem } from '../components/DailyTasks';
import { MacroNutrients, CommitmentLevel } from '../types';
import { SyncQueueItem } from './offlineSync';

export interface LocalAthleteState {
  hydration: number;
  protein: number;
  xp: number;
  streakDays: number;
  commitmentLevel: CommitmentLevel;
  tasks: DailyTaskItem[];
  macros: MacroNutrients;
  lastUpdated?: number;
}

export interface RemoteAthleteData {
  hydration?: number;
  protein?: number;
  xp?: number;
  streakDays?: number;
  commitmentLevel?: CommitmentLevel;
  tasks?: DailyTaskItem[];
  macros?: MacroNutrients;
  lastSyncedAt?: string;
  offlineSynced?: boolean;
  [key: string]: any;
}

export interface ReconciliationResult {
  merged: LocalAthleteState;
  hadConflicts: boolean;
  resolutions: string[];
  summary: string;
}

/**
 * Reconcilia el estado local con los datos remotos de Firestore y la cola offline.
 * 
 * Reglas de Reconciliación:
 * 1. Tareas (Metas): Unión de completaciones (si se completó local o remotamente, queda completada).
 * 2. XP: Progresión monótona (nunca decrece). Se toma el máximo y se agregan deltas pendientes.
 * 3. Hidratación: Se preserva la ingesta local offline sin borrar avances remotos.
 * 4. Nutrición (Macros): Se combinan los registros de alimentos pendientes con el snapshot remoto.
 * 5. Racha: Máximo histórico entre ambos estados.
 * 6. Nivel: Prioriza cambios explícitos pendientes; de lo contrario toma el remoto.
 */
export function reconcileAthleteData(
  local: LocalAthleteState,
  remote: RemoteAthleteData | null | undefined,
  pendingQueue: SyncQueueItem[]
): ReconciliationResult {
  const resolutions: string[] = [];
  let hadConflicts = false;

  // Si no hay datos remotos, se mantiene el estado local intacto
  if (!remote) {
    return {
      merged: { ...local },
      hadConflicts: false,
      resolutions: ['Sin datos previos en Firestore. Se inicializará la cuenta con el estado local.'],
      summary: 'Estado local listo para sincronizar por primera vez.',
    };
  }

  // 1. RECONCILIACIÓN DE TAREAS DIARIAS (METAS)
  const pendingTaskIds = new Set<string>();
  pendingQueue.forEach((item) => {
    if (item.type === 'TASK_UPDATE' && item.payload?.taskId) {
      pendingTaskIds.add(item.payload.taskId);
    } else if (item.type === 'STATE_FULL' && Array.isArray(item.payload?.tasks)) {
      item.payload.tasks.forEach((t: DailyTaskItem) => {
        if (t.completed) pendingTaskIds.add(t.id);
      });
    }
  });

  const remoteTasksMap = new Map<string, DailyTaskItem>();
  if (Array.isArray(remote.tasks)) {
    remote.tasks.forEach((t) => remoteTasksMap.set(t.id, t));
  }

  let tasksChanged = false;
  const mergedTasks: DailyTaskItem[] = local.tasks.map((localTask) => {
    const remoteTask = remoteTasksMap.get(localTask.id);
    const completedOffline = pendingTaskIds.has(localTask.id);
    const localCompleted = localTask.completed;
    const remoteCompleted = !!remoteTask?.completed;

    // Si difieren en estado de completado, hay un conflicto a resolver
    if (localCompleted !== remoteCompleted) {
      hadConflicts = true;
      tasksChanged = true;
    }

    // Regla de unión: Si se completó en local, en la cola offline o en remoto, queda completada
    const isCompleted = localCompleted || remoteCompleted || completedOffline;

    return {
      ...localTask,
      completed: isCompleted,
    };
  });

  if (tasksChanged) {
    resolutions.push(
      'Metas Diarias: Se unificaron las metas completadas offline y en la nube sin sobrescrituras.'
    );
  }

  // 2. RECONCILIACIÓN DE XP (EXPERIENCIA)
  const localXp = Number(local.xp) || 0;
  const remoteXp = Number(remote.xp) || 0;
  let mergedXp = Math.max(localXp, remoteXp);

  // Verificar si hay XP ganado en la cola offline que aún no se reflejó en el snapshot remoto
  let pendingXpDelta = 0;
  pendingQueue.forEach((item) => {
    if (item.type === 'TASK_UPDATE' && item.payload?.xpReward) {
      pendingXpDelta += Number(item.payload.xpReward) || 0;
    }
  });

  if (localXp !== remoteXp) {
    hadConflicts = true;
    if (remoteXp > localXp) {
      // Remote tiene más XP (ej: ganado desde otro dispositivo). Sumamos deltas pendientes si los hay.
      mergedXp = remoteXp + pendingXpDelta;
      resolutions.push(
        `XP: Actualizado a ${mergedXp.toLocaleString('es-ES')} XP integrando el avance remoto con tus acciones locales.`
      );
    } else {
      resolutions.push(
        `XP: Preservados ${localXp.toLocaleString('es-ES')} XP ganados mientras estabas sin conexión.`
      );
    }
  }

  // 3. RECONCILIACIÓN DE HIDRATACIÓN
  const localHydration = Number(local.hydration) || 0;
  const remoteHydration = Number(remote.hydration) || 0;
  let mergedHydration = localHydration;

  if (Math.abs(localHydration - remoteHydration) > 0.05) {
    hadConflicts = true;
    // Si remote es mayor y no hay cambios offline pendientes de agua, adoptar remote
    const hasPendingWater = pendingQueue.some(
      (item) => item.type === 'TASK_UPDATE' && item.payload?.taskId === 'agua'
    );

    if (remoteHydration > localHydration && !hasPendingWater) {
      mergedHydration = remoteHydration;
      resolutions.push(
        `Hidratación: Adoptado valor más reciente del servidor (${remoteHydration}L).`
      );
    } else {
      mergedHydration = Math.max(localHydration, remoteHydration);
      resolutions.push(
        `Hidratación: Preservados ${mergedHydration}L registrados en el dispositivo.`
      );
    }
  }

  // 4. RECONCILIACIÓN DE NUTRICIÓN Y MACROS
  const remoteMacros: MacroNutrients = remote.macros || {
    protein: Number(remote.protein) || 0,
    carbs: Number(remote.carbs) || 0,
    fats: Number(remote.fats) || 0,
    calories: Number(remote.calories) || 0,
  };

  const localMacros = local.macros;

  // Sumar alimentos registrados offline que sigan en cola
  let pendingProtein = 0;
  let pendingCarbs = 0;
  let pendingFats = 0;
  let pendingCalories = 0;

  pendingQueue.forEach((item) => {
    if (item.type === 'FOOD_LOG' && item.payload) {
      pendingProtein += Number(item.payload.protein) || 0;
      pendingCarbs += Number(item.payload.carbs) || 0;
      pendingFats += Number(item.payload.fats) || 0;
      pendingCalories += Number(item.payload.calories) || 0;
    }
  });

  const mergedMacros: MacroNutrients = {
    protein: Math.max(localMacros.protein, remoteMacros.protein + pendingProtein),
    carbs: Math.max(localMacros.carbs, remoteMacros.carbs + pendingCarbs),
    fats: Math.max(localMacros.fats, remoteMacros.fats + pendingFats),
    calories: Math.max(localMacros.calories, remoteMacros.calories + pendingCalories),
  };

  const mergedProtein = mergedMacros.protein;

  if (
    Math.abs(localMacros.protein - remoteMacros.protein) > 1 ||
    Math.abs(localMacros.calories - remoteMacros.calories) > 10
  ) {
    hadConflicts = true;
    resolutions.push(
      `Nutrición: Macros reconciliados (${mergedMacros.protein}g proteína, ${mergedMacros.calories} kcal) combinando entradas offline con la nube.`
    );
  }

  // 5. RECONCILIACIÓN DE RACHA DE DÍAS (STREAK)
  const localStreak = Number(local.streakDays) || 0;
  const remoteStreak = Number(remote.streakDays) || 0;
  const mergedStreak = Math.max(localStreak, remoteStreak);

  if (localStreak !== remoteStreak) {
    hadConflicts = true;
    resolutions.push(
      `Racha: Mantenida la racha más alta de ${mergedStreak} días consecutivos.`
    );
  }

  // 6. NIVEL DE COMPROMISO
  let mergedCommitment = local.commitmentLevel;
  const hasPendingLevelChange = pendingQueue.some(
    (item) => item.type === 'STATE_FULL' && item.payload?.commitmentLevel
  );

  if (remote.commitmentLevel && remote.commitmentLevel !== local.commitmentLevel) {
    hadConflicts = true;
    if (!hasPendingLevelChange) {
      mergedCommitment = remote.commitmentLevel;
      resolutions.push(`Nivel de Compromiso: Sincronizado a "${remote.commitmentLevel}".`);
    } else {
      resolutions.push(`Nivel de Compromiso: Mantenido "${local.commitmentLevel}" configurado localmente.`);
    }
  }

  // Resumen comprensible
  const summary = hadConflicts
    ? `Sincronización reconciliada con éxito (${resolutions.length} aspectos resueltos sin pérdida de datos).`
    : 'Datos en perfecta sincronía con la nube.';

  return {
    merged: {
      hydration: mergedHydration,
      protein: mergedProtein,
      xp: mergedXp,
      streakDays: mergedStreak,
      commitmentLevel: mergedCommitment,
      tasks: mergedTasks,
      macros: mergedMacros,
      lastUpdated: Date.now(),
    },
    hadConflicts,
    resolutions,
    summary,
  };
}
