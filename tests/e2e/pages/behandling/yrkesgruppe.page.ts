import { Page } from "@playwright/test";

/**
 * Page Object Model for Yrkesgruppe-steget
 */
export class YrkesgruppePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
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

  /**
   * Klikk på Bekreft-knappen (kun i aktivt steg)
   */
  async klikkNeste(): Promise<void> {
    const bekreftKnapp = this.page.locator(".stegFane--aktiv button.stegKnapper__bekreft");
    await bekreftKnapp.waitFor({ state: "visible", timeout: 5000 });
    await bekreftKnapp.click();
  }
}
