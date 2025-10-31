import { expect, Locator, Page } from "@playwright/test";
import { getSaksnummerFraLocator } from "../../utils/testUtils";

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
      "Undertittel 'Hvem skal saken opprettes på?' skal være synlig",
    ).toBeVisible();
    await expect(
      this.page.locator(".opprettnysak .navds-radio__content:has-text('Bruker')"),
      "Radio-valg 'Bruker' skal være synlig",
    ).toBeVisible();
    await expect(
      this.page.locator(".opprettnysak .navds-radio__content:has-text('Virksomhet')"),
      "Radio-valg 'Virksomhet' skal være synlig",
    ).toBeVisible();
    await expect(this.page.locator(".opprettnysak .navds-radio input[value='BRUKER']")).toBeChecked();
  }

  /**
   * Verifiser at "Informasjon om bruker" seksjonen er vist korrekt
   */
  async verifiserBrukerInfoValg(): Promise<void> {
    await expect(
      this.page.locator(".opprettnysak .undertittel:has-text('Informasjon om bruker')"),
      "Undertittel 'Informasjon om bruker' skal være synlig",
    ).toBeVisible();
    await expect(
      this.page.locator(".opprettnysak label:has-text('Brukers f.nr. eller d-nr.:')"),
      "Label 'Brukers f.nr. eller d-nr.' skal være synlig",
    ).toBeVisible();
    await expect(
      this.page.locator(".opprettnysak input[name='brukerID']"),
      "Input-felt for brukerID skal være synlig",
    ).toBeVisible();
  }

  /**
   * Verifiser at "Legg behandlingen til en eksisterende sak?" checkbox er synlig
   */
  async verifiserLeggBehandlingenCheckbox(): Promise<void> {
    await expect(
      this.page.locator(".navds-checkbox:has-text('Legg behandlingen i mine oppgaver')"),
      "Checkbox 'Legg behandlingen i mine oppgaver' skal være synlig",
    ).toBeVisible();
    await expect(this.page.locator("input[name='skalTilordnes']")).not.toBeChecked();
  }

  /**
   * Verifiser at aksjonsknappene er synlige
   */
  async verifiserAksjonsKnapper(): Promise<void> {
    await expect(
      this.page.locator("button:has-text('Opprett ny behandling')"),
      "Knapp 'Opprett ny behandling' skal være synlig",
    ).toBeVisible();
    await expect(this.page.locator("button:has-text('Avbryt')"), "Knapp 'Avbryt' skal være synlig").toBeVisible();
  }

  /**
   * Verifiser at sakstype-select er synlig og har riktig innhold
   */
  async verifiserSakstypeSelect(): Promise<void> {
    await expect(
      this.page.locator("select[name='sakstype']"),
      "Select-felt for sakstype skal være synlig",
    ).toBeVisible();
  }

  /**
   * Verifiser hvilke behandlingstyper som er tilgjengelige for en valgt sak
   * @param valgtSak Den valgte saken
   * @param forventedeBehandlingstyper Array med forventede behandlingstyper
   */
  async verifiserTilgjengeligeBehandlingstyper(valgtSak: Locator, forventedeBehandlingstyper: string[]): Promise<void> {
    await expect(
      this.page.getByRole("group", { name: "Behandlingstype" }),
      `Behandlingstype-gruppe for sak ${getSaksnummerFraLocator(valgtSak!)} skal være synlig`,
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

    expect(
      manglendeBehandlingstyper.length,
      `Sak ${getSaksnummerFraLocator(valgtSak!)}: Manglende behandlingstyper: ${manglendeBehandlingstyper.join(", ")}. Faktiske: ${faktiskeTilgjengeligeBehandlingstyper.join(", ")}`,
    ).toBe(0);

    expect(
      uventedeBehandlingstyper.length,
      `Sak ${getSaksnummerFraLocator(valgtSak!)}: Uventede behandlingstyper: ${uventedeBehandlingstyper.join(", ")}. Forventede: ${forventedeBehandlingstyper.join(", ")}`,
    ).toBe(0);
  }

  /**
   * Verifiser at behandlingstype-gruppen er synlig og har behandlingstyper
   */
  async verifiserBehandlingstypeGruppe(): Promise<void> {
    const behandlingstypeGruppe = this.page.getByRole("group", { name: "Behandlingstype" });
    await expect(behandlingstypeGruppe, "Behandlingstype-gruppe skal være synlig").toBeVisible();

    const behandlingstypeRadios = behandlingstypeGruppe.locator(".navds-radio");
    const antallBehandlingstyper = await behandlingstypeRadios.count();
    expect(antallBehandlingstyper, "Minst én behandlingstype skal være tilgjengelig").toBeGreaterThan(0);
  }

  /**
   * Verifiser at "Tidligere behandling er avsluttet" melding vises
   */
  async verifiserTidligereBehandlingAvsluttet(): Promise<void> {
    await expect(
      this.page.locator(".tidligereBehandlingAvsluttet", {
        hasText: "Tidligere behandling er avsluttet",
      }),
      "Melding 'Tidligere behandling er avsluttet' skal være synlig",
    ).toBeVisible();
  }

  /**
   * Verifiser feilmelding for EØS-sak med aktiv behandling
   */
  async verifiserEosFeilmelding(): Promise<void> {
    await expect(
      this.page.locator(".feilmelding_innrykk").filter({
        hasText: "Du kan ikke opprette en ny behandling på eksisterende sak med en aktiv/pågående behandling",
      }),
      "Varselmelding om aktiv behandling skal være synlig",
    ).toBeVisible();
  }

  /**
   * Verifiser at behandlingstema-select er synlig
   */
  async verifiserBehandlingstemaSelectSynlig(): Promise<void> {
    const behandlingstemaSelect = this.page.locator("select[name='behandlingstema']");
    await expect(behandlingstemaSelect, "Select-felt for behandlingstema skal være synlig").toBeVisible();
  }

  /**
   * Verifiser at behandlingstype-gruppen IKKE er synlig
   */
  async verifiserBehandlingstypeGruppeIkkeSynlig(): Promise<void> {
    const behandlingstypeGruppe = this.page.getByRole("group", { name: "Behandlingstype" });
    await expect(behandlingstypeGruppe, "Behandlingstype-gruppe skal ikke være synlig").not.toBeVisible();
  }

  /**
   * Verifiser at alle nødvendige elementer er synlige på siden
   */
  async verifiserAlleElementer(): Promise<void> {
    await expect(this.page).toHaveURL("/melosys/opprettnysak");
    await expect(this.page.locator(".opprettnysak"), "Opprett ny sak-container skal være synlig").toBeVisible();
    await this.verifiserBrukertypeValg();
    await this.verifiserBrukerInfoValg();
    await this.verifiserLeggBehandlingenCheckbox();
    await this.verifiserAksjonsKnapper();
    //await this.verifiserSakstypeSelect();
  }
}
