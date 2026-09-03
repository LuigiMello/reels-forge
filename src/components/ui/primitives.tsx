import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionLabel({
  index,
  children,
  className,
}: {
  index?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex items-center gap-3", className)}>
      {index && <span className="tape-label text-flame">{index}</span>}
      <span className="tape-label text-paper/50">{children}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function Card({
  children,
  className,
  accent,
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <div
      className={cn(
        "relative border border-line bg-ink-2 p-5 transition-colors",
        className
      )}
      style={accent ? { borderTopColor: accent, borderTopWidth: 3 } : undefined}
    >
      {children}
    </div>
  );
}

export function Chip({
  children,
  className,
  color,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <span
      className={cn(
        "tape-label inline-flex items-center gap-1.5 border border-line-strong px-2 py-1 text-[10px] text-paper/80",
        className
      )}
    >
      {color && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: color }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export function StatNumber({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <div>
      <div className="tape-label mb-1 text-[10px] text-paper/50">{label}</div>
      <div
        className="font-mono text-2xl font-semibold leading-none"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-paper/40">{hint}</div>}
    </div>
  );
}

export function ScoreGauge({ score, size = 76 }: { score: number; size?: number }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;
  const color = score >= 75 ? "var(--acid)" : score >= 50 ? "var(--signal)" : "var(--flame)";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth={5}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 400ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-semibold">
        {score}
      </div>
    </div>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
}) {
  return (
    <button
      className={cn(
        "tape-label inline-flex min-h-11 items-center justify-center gap-2 px-5 py-3 text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary" && "bg-acid text-ink hover:bg-paper",
        variant === "outline" && "border border-line-strong text-paper hover:border-acid hover:text-acid",
        variant === "ghost" && "text-paper/70 hover:text-paper",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
