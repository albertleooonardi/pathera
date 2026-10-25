import { cn, getScoreTone } from "@/lib/utils";

type ScoreRingProps = {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  label?: string;
};

const ScoreRing = ({
  value,
  size = 48,
  stroke = 4,
  className = "",
  label,
}: ScoreRingProps) => {
  const clamped = Math.max(0, Math.min(100, value || 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--foreground) / 0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getScoreTone(clamped)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span
        className="absolute inset-0 flex flex-col items-center justify-center font-mono font-medium leading-none"
        style={{ fontSize: Math.max(10, size * 0.24) }}
      >
        {label ?? `${clamped.toFixed(0)}`}
      </span>
    </div>
  );
};

export default ScoreRing;
