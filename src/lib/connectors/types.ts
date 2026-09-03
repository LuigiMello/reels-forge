import type { AccountAudit, Platform, ViralPost } from "../types";

/**
 * Contract every data source must implement, mock or real. The rest of the
 * app only ever talks to `getConnector(platform)` — swapping the mock for a
 * live API means writing one class that implements this interface, nothing
 * in the UI changes.
 */
export interface PlatformConnector {
  platform: Platform;
  /** Today's ranked viral content for this platform. */
  fetchDailyViral(dateKey: string): Promise<ViralPost[]>;
  /** Look up / audit a single account by handle. */
  fetchAccountAudit(handle: string): Promise<AccountAudit>;
}

export interface ConnectorStatus {
  platform: Platform;
  mode: "mock" | "live";
  configured: boolean;
  missingEnv: string[];
  note: string;
}
