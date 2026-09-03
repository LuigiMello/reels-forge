export function formatCompact(n: number): string {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatInt(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(Math.round(n));
}

export function formatPercent(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`;
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m > 0 ? `${m}m${s.toString().padStart(2, "0")}s` : `${s}s`;
}

export function formatHoursAgo(hours: number): string {
  if (hours < 1) return "há minutos";
  if (hours < 24) return `há ${Math.round(hours)}h`;
  const d = Math.round(hours / 24);
  return `há ${d}d`;
}
