type LogoVariant = "full" | "mark" | "square";
type LogoScheme = "navy" | "white";

interface LogoProps {
  variant?: LogoVariant;
  scheme?: LogoScheme;
  height?: number;
  className?: string;
}

const MARK_PATH = "M 72 11.9 A 44 44 0 1 0 72 88.1 L 64.5 75.1 A 29 29 0 1 1 64.5 24.9 Z";

export default function Logo({
  variant = "full",
  scheme = "navy",
  height = 36,
  className,
}: LogoProps) {
  const markFill = scheme === "navy" ? "#1B3055" : "#ffffff";
  const textFill = scheme === "navy" ? "#1B3055" : "#ffffff";
  const dotFill  = scheme === "navy" ? "#C9A84C" : "#D9BE6A";

  if (variant === "mark" || variant === "square") {
    return (
      <svg
        height={height}
        width={height}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Careviews"
      >
        <path d={MARK_PATH} fill={markFill} />
        <circle cx="82" cy="50" r="8" fill={dotFill} />
      </svg>
    );
  }

  // Full horizontal lockup — proportional from a 240×50 baseline
  const k  = height / 50;
  const vw = Math.round(240 * k);
  const vh = height;
  const markScale = (0.5 * k).toFixed(4);
  const textX     = Math.round(64 * k);
  const textY     = (32.5 * k).toFixed(1);
  const fontSize  = (22 * k).toFixed(1);

  return (
    <svg
      height={vh}
      width={vw}
      viewBox={`0 0 ${vw} ${vh}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Careviews"
    >
      <g transform={`scale(${markScale})`}>
        <path d={MARK_PATH} fill={markFill} />
        <circle cx="82" cy="50" r="8" fill={dotFill} />
      </g>
      <text
        x={textX}
        y={textY}
        fontFamily="'Jost', sans-serif"
        fontWeight="600"
        fontSize={fontSize}
        letterSpacing="0.5"
        fill={textFill}
      >
        Careviews
      </text>
    </svg>
  );
}
