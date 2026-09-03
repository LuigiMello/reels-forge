import { generateAccountAudit, generateDailyViral } from "../mock/generator";
import type { AccountAudit, Platform, ViralPost } from "../types";
import type { PlatformConnector } from "./types";

/**
 * Active-by-default data source. Deterministic per day/handle so the app
 * behaves like a real daily research job without needing any credentials.
 * See real-connector.ts for the shape a live integration would take.
 */
export class MockConnector implements PlatformConnector {
  constructor(public platform: Platform) {}

  async fetchDailyViral(dateKey: string): Promise<ViralPost[]> {
    return generateDailyViral(this.platform, dateKey);
  }

  async fetchAccountAudit(handle: string): Promise<AccountAudit> {
    return generateAccountAudit(this.platform, handle);
  }
}
