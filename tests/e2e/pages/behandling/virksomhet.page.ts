import { Page } from "@playwright/test";
import { BehandlingPage } from "./behandling.page";

/**
 * Page Object Model for Virksomhet-steget
 */
export class VirksomhetPage extends BehandlingPage {
  constructor(page: Page) {
    super(page);
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
}
