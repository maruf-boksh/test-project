import './BrandLogo.css';

export type BrandTone = 'auto' | 'light' | 'dark';

export interface BrandLogoProps {
  /** 'light' = on light bg (default sidebar), 'dark' = on dark/branded bg (login hero), 'auto' = follow theme */
  tone?: BrandTone;
  /** Show the wordmark next to the mark */
  showWordmark?: boolean;
  /** Pixel size of the mark tile */
  size?: number;
  className?: string;
}

export function BrandMark({ size = 42, tone = 'auto' }: { size?: number; tone?: BrandTone }) {
  return (
    <span
      className={`bl-mark bl-tone-${tone}`}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.28) }}
    >
      <svg
        className="bl-mark-svg"
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bl-stroke" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.78" />
          </linearGradient>
          <linearGradient id="bl-shimmer" x1="0" y1="0" x2="40" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="bl-spark" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="60%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
        </defs>
        <path
          className="bl-v"
          d="M8 10 L20 30 L32 10"
          stroke="url(#bl-stroke)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          className="bl-chart"
          d="M11 22 L17 18 L23 20 L30 12"
          stroke="#FBBF24"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.85"
          fill="none"
        />
        <path
          className="bl-shimmer"
          d="M8 10 L20 30 L32 10"
          stroke="url(#bl-shimmer)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle className="bl-spark" cx="30" cy="12" r="2.4" fill="url(#bl-spark)" />
        <circle className="bl-spark-ring" cx="30" cy="12" r="2.4" fill="none" stroke="#FBBF24" strokeWidth="1" />
      </svg>
    </span>
  );
}

export function BrandWordmark({ tone = 'auto' }: { tone?: BrandTone }) {
  return (
    <span className={`bl-word bl-tone-${tone}`}>
      <span className="bl-word-main">VIZYON</span>
      <span className="bl-word-sub">HR</span>
    </span>
  );
}

export function BrandLogo({ tone = 'auto', showWordmark = true, size = 42, className }: BrandLogoProps) {
  return (
    <span className={`bl-root${className ? ' ' + className : ''}`}>
      <BrandMark size={size} tone={tone} />
      {showWordmark && <BrandWordmark tone={tone} />}
    </span>
  );
}
