import { expect, Locator, Page } from "@playwright/test";
import { getSakId } from "../utils/testUtils";

// UI Constants
const SELECTORS = {
  CUSTOM_RADIO_PANEL_TITLE: ".customRadioPanelTittel",
} as const;

/**
 * Assertions and verification methods for OpprettNySakPage
 * This class contains all methods that verify state, get information, or assert conditions
 */
export class OpprettNySakAssertions {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Verifiser at "Hvem skal saken opprettes på?" seksjonen er vist korrekt
   */
  async verifiserBrukertypeValg(): Promise<void> {
    await expect(
      this.page.locator(".opprettnysak .undertittel:has-text('Hvem skal saken opprettes på?')"),
    ).toBeVisible();
    await expect(this.page.locator(".opprettnysak .navds-radio__content:has-text('Bruker')")).toBeVisible();
    await expect(this.page.locator(".opprettnysak .navds-radio__content:has-text('Virksomhet')")).toBeVisible();
    await expect(this.page.locator(".opprettnysak .navds-radio input[value='BRUKER']")).toBeChecked();
  }

  /**
   * Verifiser at "Informasjon om bruker" seksjonen er vist korrekt
   */
  async verifiserBrukerInfoValg(): Promise<void> {
    await expect(this.page.locator(".opprettnysak .undertittel:has-text('Informasjon om bruker')")).toBeVisible();
    await expect(this.page.locator(".opprettnysak label:has-text('Brukers f.nr. eller d-nr.:')")).toBeVisible();
    await expect(this.page.locator(".opprettnysak input[name='brukerID']")).toBeVisible();
  }

  /**
   * Verifiser at "Legg behandlingen til en eksisterende sak?" checkbox er synlig
   */
  async verifiserLeggBehandlingenCheckbox(): Promise<void> {
    await expect(this.page.locator(".navds-checkbox:has-text('Legg behandlingen i mine oppgaver')")).toBeVisible();
    await expect(this.page.locator("input[name='skalTilordnes']")).not.toBeChecked();
  }

  /**
   * Verifiser at aksjonsknappene er synlige
   */
  async verifiserAksjonsKnapper(): Promise<void> {
    await expect(this.page.locator("button:has-text('Opprett ny behandling')")).toBeVisible();
    await expect(this.page.locator("button:has-text('Avbryt')")).toBeVisible();
  }

  /**
   * Verifiser at sakstype-select er synlig og har riktig innhold
   */
  async verifiserSakstypeSelect(): Promise<void> {
    await expect(this.page.locator("select[name='sakstype']")).toBeVisible();
  }

  /**
   * Hent sak-titel fra locator
   */
  async hentSaksTittel(sakLocator: Locator): Promise<string | null> {
    const tittelElement = sakLocator.locator(SELECTORS.CUSTOM_RADIO_PANEL_TITLE);
    return await tittelElement.textContent();
  }

  /**
   * Sjekker om det finnes feilmeldinger på siden
   * @param feilmelding Valgfri spesifikk feilmelding å lete etter
   * @returns true hvis feilmelding finnes
   *
   * Note: Søker på hele siden da feilmeldinger typisk vises som globale varsler,
   * ikke innenfor individuelle sak-elementer.
   */
  async harFeilmelding(feilmelding?: string): Promise<boolean> {
    if (feilmelding) {
      // Sjekk etter spesifikk feilmelding
      return await this.page
        .locator(".navds-alert--error, .navds-alert--warning")
        .filter({ hasText: feilmelding })
        .isVisible()
        .catch(() => false);
    }

    // Sjekk etter generelle feilmeldinger
    return await this.page
      .locator(".navds-alert--error, .navds-alert--warning")
      .isVisible()
      .catch(() => false);
  }

  /**
   * Tell antall saker som vises
   */
  async tellAntallSaker(): Promise<number> {
    return await this.page.locator(".customRadioPanel").count();
  }

  /**
   * Sjekk om opprett-ny-sak siden er synlig
   */
  async erOpprettNySakSidenSynlig(): Promise<boolean> {
    return await this.page.locator(".opprettnysak").isVisible();
  }

  /**
   * Verifiser hvilke behandlingstyper som er tilgjengelige for en valgt sak
   * @param valgtSak Den valgte saken
   * @param forventedeBehandlingstyper Array med forventede behandlingstyper
   */
  async verifiserTilgjengeligeBehandlingstyper(valgtSak: Locator, forventedeBehandlingstyper: string[]): Promise<void> {
    await expect(
      this.page.getByRole("group", { name: "Behandlingstype" }),
      `Behandlingstype-gruppe for sak ${getSakId(valgtSak!)} skal være synlig`,
    ).toBeVisible();

    // Hent alle faktiske radiobuttons som er tilstede
    let alleRadioButtons = this.page.getByRole("group", { name: "Behandlingstype" }).getByRole("radio");
    let antallRadioButtons = await alleRadioButtons.count();

    // Prøv alternative selektorer hvis ingen radiobuttons finnes
    if (antallRadioButtons === 0) {
      const alternativeRadios = await this.page
        .getByRole("group", { name: "Behandlingstype" })
        .locator("input[type='radio']")
        .count();
      const navdsRadios = await this.page
        .getByRole("group", { name: "Behandlingstype" })
        .locator(".navds-radio")
        .count();

      // Bruk alternative selektorer hvis de finner radiobuttons
      if (alternativeRadios > 0) {
        alleRadioButtons = this.page.getByRole("group", { name: "Behandlingstype" }).locator("input[type='radio']");
        antallRadioButtons = alternativeRadios;
      } else if (navdsRadios > 0) {
        alleRadioButtons = this.page.getByRole("group", { name: "Behandlingstype" }).locator(".navds-radio input");
        antallRadioButtons = navdsRadios;
      }
    }

    const faktiskeTilgjengeligeBehandlingstyper: string[] = [];
    for (let i = 0; i < antallRadioButtons; i++) {
      const radio = alleRadioButtons.nth(i);
      const isVisible = await radio.isVisible();

      if (isVisible) {
        const label = await radio.getAttribute("aria-labelledby");

        let behandlingstype: string | null = null;

        if (label) {
          const labelElement = this.page.locator(`#${label}`);
          behandlingstype = await labelElement.textContent();
        }

        if (!behandlingstype) {
          // Prøv alternative metoder for å finne teksten
          const radioValue = await radio.getAttribute("value");
          const siblingLabel = await radio
            .locator("+ label")
            .textContent()
            .catch(() => null);
          const parentLabel = await radio
            .locator("..")
            .locator("label")
            .textContent()
            .catch(() => null);

          // Prøv ulike måter å finne behandlingstypen
          behandlingstype = siblingLabel || parentLabel || radioValue;
        }

        if (behandlingstype) {
          faktiskeTilgjengeligeBehandlingstyper.push(behandlingstype.trim());
        }
      }
    }

    // Sammenlign faktiske vs forventede behandlingstyper
    const manglendeBehandlingstyper = forventedeBehandlingstyper.filter(
      (type) => !faktiskeTilgjengeligeBehandlingstyper.includes(type),
    );

    const uventedeBehandlingstyper = faktiskeTilgjengeligeBehandlingstyper.filter(
      (type) => !forventedeBehandlingstyper.includes(type),
    );

    if (manglendeBehandlingstyper.length > 0) {
      throw new Error(
        `Sak ${getSakId(valgtSak!)}: Manglende behandlingstyper: ${manglendeBehandlingstyper.join(", ")}. Faktiske: ${faktiskeTilgjengeligeBehandlingstyper.join(", ")}`,
      );
    }

    if (uventedeBehandlingstyper.length > 0) {
      throw new Error(
        `Sak ${getSakId(valgtSak!)}: Uventede behandlingstyper: ${uventedeBehandlingstyper.join(", ")}. Forventede: ${forventedeBehandlingstyper.join(", ")}`,
      );
    }
  }

  /**
   * Generisk funksjon for å finne alle saker basert på sakstype og kriterier
   */
  async finnAlleSaker(kriterier: {
    sakstype: "Utenfor avtaleland" | "Avtaleland" | "EU/EØS-land";
    behandlingsstatus?:
      | "Behandlingen er opprettet"
      | "Behandlingen pågår"
      | "Behandlingen er avsluttet"
      | "Søknaden er henlagt/trukket";
    resultattype?: string;
  }): Promise<Locator[]> {
    // Bruk case-sensitiv eksakt matching for sakstype
    const alleSaker = this.page.locator(".customRadioPanel");
    const antallAlleSaker = await alleSaker.count();

    const sakListe: Locator[] = [];

    for (let i = 0; i < antallAlleSaker; i++) {
      const sak = alleSaker.nth(i);
      const tittel = await sak.locator(".customRadioPanelTittel").textContent();

      // Case-sensitiv eksakt match på starten av tittelen
      if (!tittel?.startsWith(kriterier.sakstype)) {
        continue;
      }

      let oppfyllerKriterier = true;

      if (kriterier.behandlingsstatus) {
        // Use textContent() to check if the status exists anywhere in the sak element
        const sakInnhold = await sak.textContent();
        const harStatus = sakInnhold?.includes(kriterier.behandlingsstatus) ?? false;

        if (!harStatus) {
          oppfyllerKriterier = false;
        }
      }

      if (kriterier.resultattype) {
        // Use textContent() to check if the resultattype exists anywhere in the sak element
        const sakInnhold = await sak.textContent();
        const harResultattype = sakInnhold?.includes(kriterier.resultattype) ?? false;
        if (!harResultattype) {
          oppfyllerKriterier = false;
        }
      }

      // Hent sak-ID for bedre feilmeldinger
      const sakId = await sak.locator(".customRadioPanelTittel").textContent();
      const sakIdMatch = sakId?.match(/MEL-\d+/);
      (sak as any)._sakId = sakIdMatch ? sakIdMatch[0] : "ukjent";

      if (oppfyllerKriterier) {
        sakListe.push(sak);
      }
    }

    return sakListe;
  }

  /**
   * Verifiser at alle nødvendige elementer er synlige på siden
   */
  async verifiserAlleElementer(): Promise<void> {
    await expect(this.page).toHaveURL("/melosys/opprettnysak");
    await expect(this.page.locator(".opprettnysak")).toBeVisible();
    await this.verifiserBrukertypeValg();
    await this.verifiserBrukerInfoValg();
    await this.verifiserLeggBehandlingenCheckbox();
    await this.verifiserAksjonsKnapper();
    //await this.verifiserSakstypeSelect();
  }

  /**
   * Hent alle opsjoner fra en select dropdown
   */
  async getSelectOptions(selectName: string): Promise<string[]> {
    const select = this.page.locator(`select[name='${selectName}']`);
    await expect(select).toBeVisible();

    // Vent på at select har options lastet (mer enn bare default option)
    await this.page.waitForFunction(
      (selectName) => {
        const selectEl = document.querySelector(`select[name='${selectName}']`) as HTMLSelectElement;
        return selectEl && selectEl.options.length > 1;
      },
      selectName,
      { timeout: 5000 },
    );

    const options = await select.locator("option").all();
    const values = [];
    for (const option of options) {
      const value = await option.getAttribute("value");
      if (value && value !== "" && value !== "DEFAULT") {
        values.push(value);
      }
    }
    return values;
  }

  /**
   * Sjekk om behandlingstype-gruppen er synlig
   */
  async erBehandlingstypeGruppeSynlig(): Promise<boolean> {
    const behandlingstypeGruppe = this.page.getByRole("group", { name: "Behandlingstype" });
    return await behandlingstypeGruppe.isVisible().catch(() => false);
  }
}
