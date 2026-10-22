import { expect, Locator, Page } from "@playwright/test";
import { OpprettNySakPage } from "./opprett-ny-sak.page";

const LANDSPØRSMÅL = "I hvilke land skal arbeidet/næringen utføres i?";
const FLERE_LAND_UKJENT_HVILKE = "Flere land. Ikke kjent hvilke";

type Behandlingstema =
  "Utsendt arbeidstaker / skip / direkte til artikkel 16" | "Arbeid og/eller selvstendig virksomhet i flere land";

/**
 * Page Object for landvalget i «Opprett ny sak/behandling» for EU/EØS-land
 */
export class OpprettSakLandPage {
  private readonly opprettNySak: OpprettNySakPage;

  constructor(readonly page: Page) {
    this.opprettNySak = new OpprettNySakPage(page);
  }

  private get land(): Locator {
    return this.page.getByRole("group", { name: new RegExp(`^${LANDSPØRSMÅL}`) });
  }

  private get landvelger(): Locator {
    return this.land.getByRole("combobox", { name: LANDSPØRSMÅL, exact: true });
  }

  private get flereLandUkjentHvilke(): Locator {
    return this.land.getByRole("radio", { name: FLERE_LAND_UKJENT_HVILKE, exact: true });
  }

  private valgte(): Locator {
    return this.land.getByRole("button", { name: / slett$/ });
  }

  private feilmelding(feil: string): Locator {
    return this.page.getByRole("listitem").filter({ hasText: new RegExp(`^${feil}$`) });
  }

  /**
   * Gå til «Opprett ny sak» og fyll ut en ny EU/EØS-sak fram til landvalget. Brukeren har ingen saker fra før.
   */
  async gåTilLandvalg(url: string, brukerID: string, behandlingstema: Behandlingstema): Promise<void> {
    await this.page.goto(url);
    await this.opprettNySak.fyllInnBrukerId(brukerID);
    await expect(this.page.getByText("Ingen eksisterende saker funnet. Du må opprette en ny sak.")).toBeVisible();
    await this.opprettNySak.velgSakstype("EU/EØS-land");
    await this.opprettNySak.velgSakstema("Medlemskap og lovvalg");
    await this.opprettNySak.velgBehandlingstema(behandlingstema);
    await this.opprettNySak.velgBehandlingstype("Førstegangsbehandling");
    await this.opprettNySak.velgBehandlingsaarsak("Søknad");
    await expect(this.landvelger).toBeVisible();
  }

  async settPeriode(fra: string, til: string): Promise<void> {
    await this.opprettNySak.setFraDato(fra);
    await this.opprettNySak.setTilDato(til);
  }

  /**
   * Søk etter landet og velg det
   */
  async velg(land: string, søketekst: string = land): Promise<void> {
    await this.landvelger.fill(søketekst);
    await this.page.getByRole("listbox").getByRole("option", { name: land, exact: true }).click();
    await expect(this.valgte().filter({ hasText: land })).toHaveCount(1);
  }

  async fjern(land: string): Promise<void> {
    await this.land.getByRole("button", { name: `${land} slett`, exact: true }).click();
  }

  async fjernSisteMedBackspace(): Promise<void> {
    await this.landvelger.press("Backspace");
  }

  /**
   * Verifiser at nøyaktig de oppgitte landene er valgt, i valgt rekkefølge
   */
  async verifiserValgte(forventet: string[]): Promise<void> {
    await expect(this.valgte()).toHaveCount(forventet.length);
    for (const [i, land] of forventet.entries()) {
      await expect(this.valgte().nth(i)).toHaveAccessibleName(`${land} slett`);
    }
  }

  async velgFlereLandUkjentHvilke(): Promise<void> {
    await this.flereLandUkjentHvilke.check();
    await expect(this.landvelger).toHaveCount(0);
  }

  async verifiserFlereLandUkjentHvilkeKanVelges(kanVelges: boolean): Promise<void> {
    await (kanVelges
      ? expect(this.flereLandUkjentHvilke).toBeEnabled()
      : expect(this.flereLandUkjentHvilke).toBeDisabled());
  }

  async verifiserFeilmelding(feil: string): Promise<void> {
    await expect(this.feilmelding(feil)).toHaveCount(1);
  }

  async verifiserIngenFeilmelding(feil: string): Promise<void> {
    await expect(this.feilmelding(feil)).toHaveCount(0);
  }

  async opprett(): Promise<void> {
    await this.opprettNySak.klikkOpprettNyBehandling();
  }
}
