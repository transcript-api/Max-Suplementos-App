import { useState, useEffect, useRef } from 'react';

/**
 * Hook useCountUp: Realiza una animación de incremento/decremento suave de valores numéricos
 * utilizando requestAnimationFrame con función de easing cúbica.
 * 
 * @param targetValue Valor objetivo al que debe llegar el contador.
 * @param duration Duración de la transición en milisegundos (por defecto 800ms).
 * @returns Objeto con:
 *  - value: valor numérico actual animado.
 *  - isAnimating: verdadero mientras la transición está en curso.
 *  - delta: diferencia positiva o negativa detectada en el último cambio.
 */
export function useCountUp(
  targetValue: number,
  duration = 800
): { value: number; isAnimating: boolean; delta: number } {
  const [displayValue, setDisplayValue] = useState<number>(targetValue);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [delta, setDelta] = useState<number>(0);

  const prevTargetRef = useRef<number>(targetValue);
  const startValRef = useRef<number>(targetValue);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const deltaTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const prev = prevTargetRef.current;
    if (prev !== targetValue) {
      const diff = targetValue - prev;
      setDelta(diff);
      startValRef.current = displayValue;
      prevTargetRef.current = targetValue;
      startTimeRef.current = null;
      setIsAnimating(true);

      // Limpiar timeout previo de delta badge si existía
      if (deltaTimeoutRef.current) {
        clearTimeout(deltaTimeoutRef.current);
      }

      // Función de easing out cúbico para desaceleración natural
      const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

      const step = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(1, elapsed / duration);
        const easedProgress = easeOutCubic(progress);

        const current = Math.round(
          startValRef.current + (targetValue - startValRef.current) * easedProgress
        );
        setDisplayValue(current);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          setDisplayValue(targetValue);
          setIsAnimating(false);
          // Mantener el badge de delta visible por 1.8 segundos antes de ocultarlo
          deltaTimeoutRef.current = setTimeout(() => {
            setDelta(0);
          }, 1800);
        }
      };

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(step);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetValue, duration]);

  useEffect(() => {
    return () => {
      if (deltaTimeoutRef.current) clearTimeout(deltaTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { value: displayValue, isAnimating, delta };
}
