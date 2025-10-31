import { Page } from "@playwright/test";

/**
 * Page Object Model for Inngang-steget
 */
export class InngangPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Vent på at Inngang-steget er synlig
   */
  async ventPaInngangSteg(timeout = 10000): Promise<void> {
    await this.page.waitForSelector("text=Kontroller inngangsvilkår", { timeout });
  }

  /**
   * Klikk på Bekreft-knappen i Inngang-steget (kun i aktivt steg)
   */
  async klikkNeste(): Promise<void> {
    const bekreftKnapp = this.page.locator(".stegFane--aktiv button.stegKnapper__bekreft");
    await bekreftKnapp.waitFor({ state: "visible", timeout: 5000 });
    await bekreftKnapp.click();
  }
}
