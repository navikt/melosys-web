import { Page } from "@playwright/test";

/**
 * Page Object Model for Virksomhet-steget
 */
export class VirksomhetPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Vent på at Virksomhet-steget er synlig
   */
  async ventPaVirksomhetSteg(timeout = 10000): Promise<void> {
    // Vent på at Virksomhet-tittelen vises i det aktive steget
    await this.page.waitForSelector('.stegFane--aktiv h1:has-text("Virksomhet")', { timeout });
  }

  /**
   * Velg første tilgjengelige virksomhet
   */
  async velgForsteVirksomhet(): Promise<void> {
    // Finn checkboxer i det aktive steget - bruk Nav DS checkbox-klasse
    const forsteCheckbox = this.page.locator(".stegFane--aktiv .navds-checkbox__input").first();
    await forsteCheckbox.waitFor({ state: "visible", timeout: 10000 });

    // Sjekk om den allerede er checket
    const erChecket = await forsteCheckbox.isChecked();
    if (!erChecket) {
      await forsteCheckbox.check();
    }
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
