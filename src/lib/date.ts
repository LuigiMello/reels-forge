/** Today's date key in America/Sao_Paulo, e.g. "2026-09-03". Drives the daily seed. */
export function todayKey(): string {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(now); // en-CA -> YYYY-MM-DD
}

export function todayLabel(): string {
  const now = new Date();
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(now);
}
