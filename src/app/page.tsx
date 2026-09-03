import { Hero } from "@/components/home/Hero";
import { TodaySnapshot } from "@/components/home/TodaySnapshot";
import { SystemMap } from "@/components/home/SystemMap";
import { DataSourceStatus } from "@/components/home/DataSourceStatus";
import { Footer } from "@/components/layout/Footer";
import { generateAllDailyViral } from "@/lib/mock/generator";
import { todayKey } from "@/lib/date";
import type { ViralPost } from "@/lib/types";

function interleave(all: ReturnType<typeof generateAllDailyViral>): ViralPost[] {
  const { instagram, tiktok, youtube } = all;
  const max = Math.max(instagram.length, tiktok.length, youtube.length);
  const out: ViralPost[] = [];
  for (let i = 0; i < max; i++) {
    if (instagram[i]) out.push(instagram[i]);
    if (tiktok[i]) out.push(tiktok[i]);
    if (youtube[i]) out.push(youtube[i]);
  }
  return out;
}

export default function Home() {
  const all = generateAllDailyViral(todayKey());
  const wallPosts = interleave(all).slice(0, 16);

  return (
    <>
      <Hero wallPosts={wallPosts} />
      <TodaySnapshot />
      <SystemMap />
      <DataSourceStatus />
      <Footer />
    </>
  );
}
