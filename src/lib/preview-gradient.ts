// Curated vivid pairs, all in the indigo → violet → magenta → pink family —
// warm pairs (coral/orange) are avoided because a dark scrim layered over
// them for caption text turns them muddy brown.
const PREVIEW_PALETTES: [string, string][] = [
  ["#2b2570", "#7b2ff7"],
  ["#4f0f7a", "#c2266b"],
  ["#6a11cb", "#c21e74"],
  ["#c21e74", "#e94794"],
  ["#833ab4", "#e1306c"],
  ["#1c3fae", "#7b2ff7"],
];

export function previewGradientCss(seed: number, angleDeg = 155): string {
  const [from, to] = PREVIEW_PALETTES[((seed % PREVIEW_PALETTES.length) + PREVIEW_PALETTES.length) % PREVIEW_PALETTES.length];
  return `linear-gradient(${angleDeg}deg, ${from} 0%, ${to} 100%)`;
}
