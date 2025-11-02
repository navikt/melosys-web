import { Page } from "@playwright/test";
import { BehandlingPage } from "./behandling.page";

/**
 * Page Object Model for Yrkesgruppe-steget
 */
export class YrkesgruppePage extends BehandlingPage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Vent på at Yrkesgruppe-steget er synlig
   */
  async ventPaYrkesgruppesteg(timeout = 10000): Promise<void> {
    await this.page.waitForSelector("text=Yrkessituasjon", { timeout });
  }

  /**
   * Velg yrkesgruppe ved å klikke på radio-knappen
   */
  async velgYrkesaktiv(): Promise<void> {
    const yrkesaktivRadio = this.page.locator('input[type="radio"][value="ORDINAER"]');
    await yrkesaktivRadio.waitFor({ state: "visible", timeout: 5000 });
    await yrkesaktivRadio.check();
  }
}
