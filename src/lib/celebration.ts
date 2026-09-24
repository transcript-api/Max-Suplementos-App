/**
 * Utilidades de Celebración y Efectos Visuales
 * Utiliza canvas-confetti y Web Audio API para una experiencia inmersiva y ultraligera (<5KB).
 */

import confetti from 'canvas-confetti';

/**
 * Devuelve la clave de fecha local (YYYY-MM-DD)
 */
export const getTodayDateKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const STORAGE_PREFIX = 'maxmind_energy_100_celebrated_';

/**
 * Verifica si el usuario ya celebró el 100% de energía en el día actual
 */
export const hasCelebratedEnergyToday = (userId: string = 'default'): boolean => {
  try {
    const today = getTodayDateKey();
    const key = `${STORAGE_PREFIX}${userId}_${today}`;
    const legacyKey = `${STORAGE_PREFIX}${today}`;
    return localStorage.getItem(key) === 'true' || localStorage.getItem(legacyKey) === 'true';
  } catch {
    return false;
  }
};

/**
 * Registra que el usuario ya recibió la celebración del 100% de energía hoy
 */
export const markCelebratedEnergyToday = (userId: string = 'default'): void => {
  try {
    const today = getTodayDateKey();
    const key = `${STORAGE_PREFIX}${userId}_${today}`;
    localStorage.setItem(key, 'true');
    localStorage.setItem(`${STORAGE_PREFIX}${today}`, 'true');
  } catch {
    // Manejo seguro en caso de cuota de localStorage excedida o modo privado
  }
};

/**
 * Reinicia la marca de celebración de hoy (útil para pruebas o modo demo)
 */
export const resetCelebratedEnergyToday = (userId: string = 'default'): void => {
  try {
    const today = getTodayDateKey();
    localStorage.removeItem(`${STORAGE_PREFIX}${userId}_${today}`);
    localStorage.removeItem(`${STORAGE_PREFIX}${today}`);
  } catch {
    // Ignorar errores de localStorage
  }
};

/**
 * Dispara una secuencia de fuegos artificiales de confeti con canvas-confetti
 */
export const triggerEnergyCelebrationConfetti = (): void => {
  try {
    // 1. Ráfaga inicial desde el centro con colores atléticos
    confetti({
      particleCount: 90,
      spread: 90,
      origin: { y: 0.6, x: 0.5 },
      colors: ['#2563eb', '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#eab308'],
      ticks: 250,
      gravity: 0.9,
      scalar: 1.1,
      disableForReducedMotion: true,
    });

    // 2. Cañón izquierdo
    setTimeout(() => {
      confetti({
        particleCount: 65,
        angle: 55,
        spread: 70,
        origin: { x: 0.05, y: 0.75 },
        colors: ['#ffd700', '#2563eb', '#38bdf8', '#10b981', '#ffffff'],
        ticks: 240,
        gravity: 1.0,
        disableForReducedMotion: true,
      });
    }, 180);

    // 3. Cañón derecho
    setTimeout(() => {
      confetti({
        particleCount: 65,
        angle: 125,
        spread: 70,
        origin: { x: 0.95, y: 0.75 },
        colors: ['#ffd700', '#ef4444', '#ec4899', '#8b5cf6', '#ffffff'],
        ticks: 240,
        gravity: 1.0,
        disableForReducedMotion: true,
      });
    }, 360);

    // 4. Lluvia de estrellas doradas
    setTimeout(() => {
      confetti({
        particleCount: 45,
        spread: 120,
        origin: { y: 0.35, x: 0.5 },
        shapes: ['star'],
        colors: ['#ffd700', '#facc15', '#fef08a', '#fbbf24'],
        ticks: 280,
        scalar: 1.25,
        gravity: 0.75,
        disableForReducedMotion: true,
      });
    }, 550);
  } catch (err) {
    console.warn('Confetti could not be triggered:', err);
  }
};

/**
 * Reproduce un acorde triunfal sintetizado mediante Web Audio API (sin descargas de audio)
 */
export const playCelebrationSound = (): void => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Acorde triunfal: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.42);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  } catch {
    // Manejo silencioso si el navegador bloquea audio antes de interacción
  }
};
