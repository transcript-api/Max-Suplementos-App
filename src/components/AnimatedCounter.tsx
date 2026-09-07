import React from 'react';
import { useCountUp } from '../hooks/useCountUp';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (val: number) => string;
  prefix?: string;
  suffix?: string;
  className?: string;
  showDeltaBadge?: boolean;
  deltaBadgeLabel?: string;
  deltaBadgeClassName?: string;
}

/**
 * Componente AnimatedCounter:
 * Muestra un número con animación suave de incremento (counter-up) utilizando
 * requestAnimationFrame y una función de desaceleración armónica.
 * Incluye un badge flotante interactivo con la ganancia (+XP o +%) cuando el valor se incrementa.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 850,
  formatter,
  prefix = '',
  suffix = '',
  className = '',
  showDeltaBadge = true,
  deltaBadgeLabel = '',
  deltaBadgeClassName = '',
}) => {
  const { value: animatedValue, isAnimating, delta } = useCountUp(value, duration);

  const formattedValue = formatter
    ? formatter(animatedValue)
    : animatedValue.toLocaleString('es-ES');

  return (
    <span className="relative inline-flex items-center">
      <span
        className={`transition-transform duration-300 inline-block tabular-nums ${
          isAnimating ? 'scale-105 text-[#38bdf8] drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]' : ''
        } ${className}`}
      >
        {prefix}
        {formattedValue}
        {suffix}
      </span>

      {/* Micro-badge flotante al aumentar el valor */}
      {showDeltaBadge && delta > 0 && (
        <span
          className={`absolute -top-3.5 -right-3 sm:-right-4 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-black rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 animate-bounce pointer-events-none z-10 whitespace-nowrap ${deltaBadgeClassName}`}
        >
          +{delta.toLocaleString('es-ES')}
          {deltaBadgeLabel ? ` ${deltaBadgeLabel}` : ''}
        </span>
      )}
    </span>
  );
};
