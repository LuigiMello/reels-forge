/**
 * Deterministic PRNG (mulberry32) seeded from a string. Same seed -> same
 * sequence, every time, on server and client. This is what lets "today's"
 * viral research feel stable across reloads without a database: the seed
 * is derived from the calendar date, so it only changes once a day.
 */
export function seedFromString(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  private rand: () => number;

  constructor(seed: string) {
    this.rand = mulberry32(seedFromString(seed));
  }

  float(min = 0, max = 1): number {
    return min + this.rand() * (max - min);
  }

  int(min: number, max: number): number {
    return Math.floor(this.float(min, max + 1));
  }

  pick<T>(arr: readonly T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }

  pickMany<T>(arr: readonly T[], count: number): T[] {
    const pool = [...arr];
    const out: T[] = [];
    for (let i = 0; i < count && pool.length; i++) {
      const idx = this.int(0, pool.length - 1);
      out.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return out;
  }

  bool(chance = 0.5): boolean {
    return this.rand() < chance;
  }
}
