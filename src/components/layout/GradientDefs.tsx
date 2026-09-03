/** Shared SVG gradient defs (0x0, purely referenced via url(#ig-gradient) by other SVGs — ScoreGauge, etc). */
export function GradientDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4f5bd5" />
          <stop offset="22%" stopColor="#962fbf" />
          <stop offset="50%" stopColor="#d62976" />
          <stop offset="75%" stopColor="#fa7e1e" />
          <stop offset="100%" stopColor="#feda75" />
        </linearGradient>
      </defs>
    </svg>
  );
}
