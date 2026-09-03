import type { Platform } from "../types";
import { MockConnector } from "./mock-connector";
import { REQUIRED_ENV } from "./real-connector";
import type { ConnectorStatus, PlatformConnector } from "./types";

/**
 * Single switch point for going from mock to live data. Every platform is
 * "mock" until its env vars are present AND it's explicitly turned on here
 * — flipping this to `true` for a platform, once real-connector.ts is
 * implemented and its env vars are set, is the entire migration.
 */
const LIVE_ENABLED: Record<Platform, boolean> = {
  instagram: false,
  tiktok: false,
  youtube: false,
};

const connectors: Record<Platform, PlatformConnector> = {
  instagram: new MockConnector("instagram"),
  tiktok: new MockConnector("tiktok"),
  youtube: new MockConnector("youtube"),
};

export function getConnector(platform: Platform): PlatformConnector {
  return connectors[platform];
}

export function getConnectorStatus(platform: Platform): ConnectorStatus {
  const required = REQUIRED_ENV[platform];
  const missingEnv = required.filter((key) => !process.env[key]);
  const configured = missingEnv.length === 0;
  const mode = LIVE_ENABLED[platform] && configured ? "live" : "mock";

  return {
    platform,
    mode,
    configured,
    missingEnv,
    note:
      mode === "live"
        ? "Conectado a dados reais."
        : configured
        ? "Credenciais detectadas, mas o modo live ainda está desligado no registry."
        : `Modo demonstração — configure ${required.join(", ")} para habilitar dados reais.`,
  };
}
