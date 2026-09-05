import React from 'react';

interface MaxMindLogoProps {
  variant?: 'full' | 'symbol' | 'horizontal';
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isDark?: boolean;
}

/**
 * MAXMIND Official Logo Component
 * - 100% Vector SVG
 * - Transparent background (sin fondo)
 * - Two-tone faceted geometric emblem
 * - Geometric wordmark with the signature blue triangle in the 'A'
 * - Adaptive to dark and light backgrounds
 */
export const MaxMindLogo: React.FC<MaxMindLogoProps> = ({
  variant = 'horizontal',
  className = '',
  size = 'md',
  isDark = true,
}) => {
  // Dimensiones según tamaño
  const getDimensions = () => {
    switch (size) {
      case 'xs':
        return variant === 'symbol' ? 'h-6 w-6' : 'h-6';
      case 'sm':
        return variant === 'symbol' ? 'h-8 w-8' : 'h-7';
      case 'md':
        return variant === 'symbol' ? 'h-10 w-10' : 'h-9';
      case 'lg':
        return variant === 'symbol' ? 'h-14 w-14' : 'h-12';
      case 'xl':
        return variant === 'symbol' ? 'h-20 w-20' : 'h-16';
      default:
        return 'h-9';
    }
  };

  const primaryFill = isDark ? '#F8FAFC' : '#091122';
  const blueBevel = isDark ? '#3B82F6' : '#2563EB';

  if (variant === 'symbol') {
    return (
      <svg
        viewBox="0 0 400 320"
        className={`${getDimensions()} ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="MAXMIND Symbol"
      >
        <defs>
          <linearGradient id="sym-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="sym-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={primaryFill} />
            <stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#020617'} />
          </linearGradient>
        </defs>

        <g transform="translate(200, 160)">
          {/* Left Outer Pillar */}
          <polygon
            points="-150,-60 -110,-110 -110,48 -150,98"
            fill="url(#sym-body-grad)"
          />
          {/* Left Inner Diagonal Bevel */}
          <polygon
            points="-105,-150 -8,-35 -8,-8 -105,-123"
            fill="url(#sym-blue-grad)"
          />
          {/* Left Inner Diagonal Body */}
          <polygon
            points="-105,-123 -8,-8 -8,98 -105,-15"
            fill="url(#sym-body-grad)"
          />

          {/* Right Outer Pillar */}
          <polygon
            points="150,-60 110,-110 110,48 150,98"
            fill="url(#sym-body-grad)"
          />
          {/* Right Inner Diagonal Bevel */}
          <polygon
            points="105,-150 8,-35 8,-8 112,-123"
            fill="url(#sym-blue-grad)"
          />
          {/* Right Inner Diagonal Body */}
          <polygon
            points="105,-123 8,-8 8,98 105,-15"
            fill="url(#sym-body-grad)"
          />
        </g>
      </svg>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 1000 680"
          className={`w-full max-w-[340px] h-auto`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="MAXMIND Logo"
        >
          <defs>
            <linearGradient id="full-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="full-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={primaryFill} />
              <stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#020617'} />
            </linearGradient>
          </defs>

          {/* Emblem */}
          <g transform="translate(500, 210)">
            <polygon points="-168,-65 -122,-118 -122,55 -168,110" fill="url(#full-body-grad)" />
            <polygon points="-116,-165 -9,-38 -9,-9 -116,-136" fill="url(#full-blue-grad)" />
            <polygon points="-116,-136 -9,-9 -9,110 -116,-15" fill="url(#full-body-grad)" />

            <polygon points="168,-65 122,-118 122,55 168,110" fill="url(#full-body-grad)" />
            <polygon points="116,-165 9,-38 9,-9 116,-136" fill="url(#full-blue-grad)" />
            <polygon points="116,-136 9,-9 9,110 116,-15" fill="url(#full-body-grad)" />
          </g>

          {/* Wordmark */}
          <g fill="url(#full-body-grad)">
            <path d="M 120 560 L 120 495 L 140 495 L 175 536 L 210 495 L 230 495 L 230 560 L 214 560 L 214 518 L 182 556 L 168 556 L 136 518 L 136 560 Z" />
            <path d="M 252 560 L 290 495 L 308 495 L 346 560 L 328 560 L 318 542 L 280 542 L 270 560 Z M 287 528 L 311 528 L 299 508 Z" />
            <path d="M 366 560 L 398 526 L 368 495 L 388 495 L 409 517 L 430 495 L 450 495 L 420 526 L 452 560 L 432 560 L 409 535 L 386 560 Z" />
            <path d="M 470 560 L 470 495 L 490 495 L 525 536 L 560 495 L 580 495 L 580 560 L 564 560 L 564 518 L 532 556 L 518 556 L 486 518 L 486 560 Z" />
            <path d="M 605 560 L 605 495 L 623 495 L 623 560 Z" />
            <path d="M 648 560 L 648 495 L 666 495 L 706 542 L 706 495 L 724 495 L 724 560 L 706 560 L 666 513 L 666 560 Z" />
            <path d="M 748 560 L 748 495 L 784 495 C 810 495 826 508 826 527.5 C 826 547 810 560 784 560 Z M 766 544 L 782 544 C 797 544 807 538 807 527.5 C 807 517 797 511 782 511 L 766 511 Z" />
          </g>

          {/* Accent Blue Triangle Inside 'A' */}
          <polygon points="299,520 286,542 312,542" fill="url(#full-blue-grad)" />
        </svg>
      </div>
    );
  }

  // Variant 'horizontal' (Ideal for Header, Mobile App Bar, etc.)
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon Symbol */}
      <svg
        viewBox="0 0 400 320"
        className={`${getDimensions()} w-auto shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="MAXMIND"
      >
        <defs>
          <linearGradient id="horiz-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="horiz-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={primaryFill} />
            <stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#020617'} />
          </linearGradient>
        </defs>

        <g transform="translate(200, 160)">
          <polygon points="-150,-60 -110,-110 -110,48 -150,98" fill="url(#horiz-body-grad)" />
          <polygon points="-105,-150 -8,-35 -8,-8 -105,-123" fill="url(#horiz-blue-grad)" />
          <polygon points="-105,-123 -8,-8 -8,98 -105,-15" fill="url(#horiz-body-grad)" />

          <polygon points="150,-60 110,-110 110,48 150,98" fill="url(#horiz-body-grad)" />
          <polygon points="105,-150 8,-35 8,-8 112,-123" fill="url(#horiz-blue-grad)" />
          <polygon points="105,-123 8,-8 8,98 105,-15" fill="url(#horiz-body-grad)" />
        </g>
      </svg>

      {/* Styled Wordmark with the Signature Blue 'A' */}
      <div className="flex flex-col justify-center select-none">
        <div className="flex items-center tracking-[0.22em] font-extrabold text-[17px] leading-tight font-sans uppercase">
          <span style={{ color: primaryFill }}>M</span>
          <span className="relative inline-flex items-center justify-center mx-[1px]">
            <span style={{ color: primaryFill }}>A</span>
            {/* Embedded Signature Triangle in A */}
            <span
              className="absolute bottom-[2px] w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[5.5px]"
              style={{ borderBottomColor: blueBevel }}
            />
          </span>
          <span style={{ color: primaryFill }}>XMIND</span>
        </div>
        <span className="text-[8.5px] font-bold tracking-[0.28em] text-[#3B82F6] dark:text-[#60A5FA] uppercase mt-0.5">
          Performance
        </span>
      </div>
    </div>
  );
};
