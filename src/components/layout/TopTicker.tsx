import { todayKey, todayLabel } from "@/lib/date";
import { generateAllDailyViral } from "@/lib/mock/generator";
import { formatCompact } from "@/lib/format";

function buildTickerItems() {
  const dateKey = todayKey();
  const all = generateAllDailyViral(dateKey);
  const items: string[] = [];

  (Object.keys(all) as (keyof typeof all)[]).forEach((platform) => {
    const top = all[platform][0];
    const label =
      platform === "instagram" ? "IG" : platform === "tiktok" ? "TT" : "YT";
    items.push(
      `${label} · TOP DO DIA @${top.creator.toLowerCase()} — ${formatCompact(top.raw.views)} views · score ${top.derived.viralScore}`
    );
  });

  items.push(`Pesquisa automática atualizada · ${todayLabel()}`);
  return items;
}

export function TopTicker() {
  const items = buildTickerItems();
  const loop = [...items, ...items];

  return (
    <div className="tape-label sticky top-0 z-50 flex h-[34px] items-center overflow-hidden border-b border-line bg-ink-2 text-[10px] text-paper/70">
      <div className="marquee-track marquee-track-slow">
        {loop.map((item, i) => (
          <span key={i} className="flex items-center whitespace-nowrap px-4">
            <span className="mr-4 inline-block h-1 w-1 bg-acid" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
