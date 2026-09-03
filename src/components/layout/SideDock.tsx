"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Feather, Home } from "lucide-react";
import { InstagramGlyph, TikTokGlyph, YouTubeGlyph } from "@/components/icons/PlatformGlyphs";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Início", icon: Home, accent: "var(--acid)" },
  { href: "/pesquisa", label: "Pesquisa", icon: Compass, accent: "var(--signal)" },
  { href: "/roteiro", label: "Roteiro", icon: Feather, accent: "var(--flame)" },
  { href: "/instagram", label: "Instagram", icon: InstagramGlyph, accent: "var(--ig-1)" },
  { href: "/tiktok", label: "TikTok", icon: TikTokGlyph, accent: "var(--tt-2)" },
  { href: "/youtube", label: "YouTube", icon: YouTubeGlyph, accent: "var(--yt-1)" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SideDock() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop vertical dock */}
      <nav
        aria-label="Navegação principal"
        className="fixed left-0 top-0 z-50 hidden h-screen w-[76px] flex-col items-center border-r border-line bg-ink pt-16 md:flex"
      >
        <Link
          href="/"
          className="text-grad-ig mb-8 font-display text-2xl font-bold leading-none"
          aria-label="Reels Forge — início"
        >
          RF
        </Link>
        <ul className="flex flex-col items-center gap-1">
          {NAV.map(({ href, label, icon: Icon, accent }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href} className="group relative">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-12 w-12 flex-col items-center justify-center gap-0.5 border-l-2 border-transparent transition-colors",
                    active ? "text-paper" : "text-paper/50 hover:text-paper"
                  )}
                  style={active ? { borderColor: accent } : undefined}
                >
                  <Icon size={18} strokeWidth={1.75} color={active ? accent : undefined} />
                </Link>
                <span
                  role="tooltip"
                  className="tape-label pointer-events-none absolute left-16 top-1/2 z-50 -translate-y-1/2 whitespace-nowrap border border-line bg-ink-2 px-2 py-1 text-[10px] text-paper opacity-0 shadow-[4px_4px_0_0_var(--line)] transition-opacity group-hover:opacity-100"
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile horizontal nav */}
      <nav
        aria-label="Navegação principal"
        className="sticky top-[34px] z-40 flex w-full items-center gap-1 overflow-x-auto border-b border-line bg-ink px-3 py-2.5 md:hidden"
      >
        {NAV.map(({ href, label, icon: Icon, accent }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "tape-label flex shrink-0 items-center gap-1.5 whitespace-nowrap border px-3 py-2 text-[10px] transition-colors",
                active ? "text-paper" : "border-line text-paper/70"
              )}
              style={active ? { borderColor: accent, background: "var(--ink-2)" } : undefined}
            >
              <Icon size={13} strokeWidth={1.75} color={active ? accent : undefined} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
