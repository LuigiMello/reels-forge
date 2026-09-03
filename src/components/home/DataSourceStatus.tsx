import { PLATFORM_CONFIG, PLATFORMS } from "@/lib/platform-config";
import { getConnectorStatus } from "@/lib/connectors/registry";
import { Card, Chip, SectionLabel } from "@/components/ui/primitives";

export function DataSourceStatus() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionLabel index="03">Status da fonte de dados</SectionLabel>
      <Card className="!p-0">
        <div className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {PLATFORMS.map((platform) => {
            const cfg = PLATFORM_CONFIG[platform];
            const status = getConnectorStatus(platform);
            return (
              <div key={platform} className="flex flex-col gap-3 p-6">
                <div className="flex items-center justify-between">
                  <Chip color={cfg.colorA}>{cfg.name}</Chip>
                  <span
                    className="tape-label"
                    style={{ color: status.mode === "live" ? "var(--acid)" : "var(--paper)" }}
                  >
                    {status.mode === "live" ? "● live" : "○ demonstração"}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-paper/50">{status.note}</p>
              </div>
            );
          })}
        </div>
      </Card>
      <p className="mt-4 text-xs text-paper/40">
        Todos os dados exibidos hoje são gerados automaticamente por um simulador estatístico
        diário (mesma seed = mesmo resultado o dia todo). Basta conectar as chaves de API reais
        e ligar o modo <code className="font-mono">live</code> em{" "}
        <code className="font-mono">src/lib/connectors/registry.ts</code> quando você conectar
        suas contas.
      </p>
    </section>
  );
}
