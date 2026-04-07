import { Page } from "@playwright/test";
import { setDatoFelt } from "../../utils/testUtils";
import { BehandlingPage } from "./behandling.page";
import { PrepopulertSaksnummer } from "../../utils/testdataUtils";
import { StegvelgerPage } from "./stegvelger.page";

/**
 * Page Object Model for Inngang-steget
 */
export class InngangPage extends StegvelgerPage {
  constructor(page: Page, saksnummer: PrepopulertSaksnummer) {
    super(page, saksnummer);
  }

  /**
   * Sett fra-dato i søknadsperiode
   */
  async setFraOgMedDato(dato: string): Promise<void> {
    return setDatoFelt("Fra og med", dato, this.page);
  }

  /**
   * Sett til-dato i søknadsperiode
   */
  async setTilOgMedDato(dato: string): Promise<void> {
    return setDatoFelt("Til og med", dato, this.page);
  }

  /**
   * Velg bostedsland for EØS pensjonist-saker
   * @param landkode - Landkode (f.eks. "SE" for Sverige, "DK" for Danmark)
   */
  /**
   * Velg trygdedekning fra dropdown på Inngang-steget
   * @param label - Synlig tekst i dropdown (f.eks. "Helsedel (§ 2-9)")
   */
  async velgTrygdedekning(label: string): Promise<void> {
    await this.page.getByRole("combobox", { name: "Trygdedekning" }).selectOption({ label });
  }

  async velgLand(landkode: string): Promise<void> {
    const landSelect = this.page.getByLabel("Bostedsland");
    // Vent på at debounced API-kall fullføres
    const responsePromise = this.page.waitForResponse((resp) => resp.url().includes("/api/") && resp.status() === 200, {
      timeout: 5000,
    });
    await landSelect.selectOption({ value: landkode });
    await responsePromise;
  }
}
