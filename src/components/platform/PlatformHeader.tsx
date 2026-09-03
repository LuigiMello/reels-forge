import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PlatformConfig } from "@/lib/types";

export function PlatformHeader({
  cfg,
  eyebrow,
  title,
  description,
  links,
}: {
  cfg: PlatformConfig;
  eyebrow: string;
  title: string;
  description: string;
  links?: { href: string; label: string }[];
}) {
  return (
    <header className="border-b border-line px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <p className="tape-label mb-4" style={{ color: cfg.colorA }}>
          {eyebrow}
        </p>
        <h1 className="font-display text-5xl font-bold leading-none text-paper sm:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-paper/60">{description}</p>
        {links && links.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="tape-label inline-flex items-center gap-1.5 border border-line-strong px-4 py-2.5 text-paper/80 transition-colors hover:text-paper"
                style={{ borderColor: "var(--line-strong)" }}
              >
                {l.label}
                <ArrowUpRight size={13} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
