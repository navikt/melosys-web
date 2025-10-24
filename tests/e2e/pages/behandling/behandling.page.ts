import { expect, Locator, Page } from "@playwright/test";

/**
 * Page Object Model for visning og håndtering av behandlinger
 * Inkluderer funksjonalitet for avslutning, endring, og generell behandlingshåndtering
 */
export class BehandlingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Verifiser at vi er på behandlingssiden
   */
  async verifiserBehandlingsside(): Promise<void> {
    await expect(this.page).toHaveURL(/\/melosys\/(FTRL|AVTALELAND|EOS|EU_EOS|TRYGDEAVTALE)\/.*\/MEL-\d+/);

    // Vent på at siden lastes med behandlingsinnhold
    await this.page.waitForLoadState("domcontentloaded");

    // Sjekk at behandlingsinfo er synlig
    const behandlingsInfo = [
      "h1", // Behandlingstittel
      ".behandlingsstatus",
      ".saksnummer",
      ':has-text("Behandling")',
      ':has-text("MEL-")', // Saksnummer
    ];

    let infoFunnet = false;
    for (const selector of behandlingsInfo) {
      if (
        await this.page
          .locator(selector)
          .isVisible()
          .catch(() => false)
      ) {
        infoFunnet = true;
        break;
      }
    }

    expect(infoFunnet, "Kunne ikke verifisere at vi er på en behandlingsside").toBe(true);
  }

  /**
   * Hent behandlingsnummer/saksnummer fra siden
   */
  async hentBehandlingsInfo(): Promise<{ saksnummer?: string; behandlingId?: string }> {
    const url = this.page.url();
    const behandlingIdMatch = url.match(/\/behandling\/(\d+)/);
    const behandlingId = behandlingIdMatch ? behandlingIdMatch[1] : undefined;

    let saksnummer: string | undefined;
    try {
      const saksnummerElement = this.page.locator('.saksnummer, :has-text("MEL-")').first();
      const tekst = await saksnummerElement.textContent({ timeout: 2000 });
      saksnummer = tekst?.match(/MEL-\d+/)?.[0];
    } catch {
      // Ikke kritisk hvis vi ikke finner saksnummer
    }

    return { saksnummer, behandlingId };
  }

  /**
   * Sjekk om behandlingen kan avsluttes (har "Avslutt behandling" knapp i hamburgermenyen)
   */
  async kanAvslutteBehandling(): Promise<boolean> {
    // Først åpne hamburgermenyen
    const hamburgerSelektorer = [
      '.behandlingsmeny__knapp[role="button"][aria-label="Behandlingsmeny"]',
      '.behandlingsmeny__knapp[aria-label="Behandlingsmeny"]',
      ".behandlingsmeny__knapp",
      '[aria-label="Behandlingsmeny"]',
      '[role="button"][title="Behandlingsmeny"]',
      '[class*="behandlingsmeny"]',
    ];

    let menuOpened = false;
    for (const selektor of hamburgerSelektorer) {
      const hamburgerMeny = this.page.locator(selektor);
      if (await hamburgerMeny.isVisible({ timeout: 1000 }).catch(() => false)) {
        await hamburgerMeny.click();
        await this.page.waitForTimeout(500);
        menuOpened = true;
        break;
      }
    }

    if (!menuOpened) {
      return false;
    }

    // Sjekk om "Avslutt behandling" finnes i menyen
    const avsluttKnapper = [
      'button:has-text("Avslutt behandling")',
      '[role="button"]:has-text("Avslutt behandling")',
      'a:has-text("Avslutt behandling")',
      '.menyknapp:has-text("Avslutt behandling")',
    ];

    for (const selector of avsluttKnapper) {
      if (
        await this.page
          .locator(selector)
          .isVisible({ timeout: 1000 })
          .catch(() => false)
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Finn og klikk på "Avslutt behandling" accordion-header i behandlingsmenyen
   */
  async klikkAvsluttBehandling(): Promise<void> {
    await this.verifiserBehandlingsside();

    const behandlingsmeny = this.page.locator(".behandlingsmeny__meny");
    const menyErSynlig = await behandlingsmeny.isVisible().catch(() => false);

    if (!menyErSynlig) {
      const hamburgerMeny = this.page.locator(".behandlingsmeny__knapp");

      await expect(hamburgerMeny).toBeVisible({ timeout: 5000 });
      await hamburgerMeny.click();
      await this.page.waitForTimeout(500);
    }

    // Finn accordion-headeren for "Avslutt behandling"
    const accordionHeader = this.page.locator(
      '.behandlingsmeny__meny .navds-accordion__header:has(.navds-accordion__header-content:has-text("Avslutt behandling"))',
    );

    await expect(accordionHeader).toBeVisible({ timeout: 2000 });
    await accordionHeader.click();
    await this.page.waitForTimeout(500);

    // Vær mer spesifikk - finn accordion content som tilhører "Avslutt behandling"
    const accordionContent = this.page.locator(
      '.behandlingsmeny__meny .navds-accordion__item:has(.navds-accordion__header:has(.navds-accordion__header-content:has-text("Avslutt behandling"))) .navds-accordion__content',
    );
    await expect(accordionContent).toBeVisible({ timeout: 3000 });
  }

  /**
   * Velg "Søknaden er innvilget" som avslutningsgrunn
   * @param saksnummer - Valgfritt saksnummer for bedre feilmeldinger
   */
  async velgSoknadenErInnvilget(saksnummer: string): Promise<void> {
    // Først, sjekk at accordion-innholdet fortsatt er synlig
    const accordionContent = this.page.locator(
      '.behandlingsmeny__meny .navds-accordion__item:has(.navds-accordion__header:has(.navds-accordion__header-content:has-text("Avslutt behandling"))) .navds-accordion__content',
    );

    await expect(accordionContent).toBeVisible({ timeout: 2000 });

    // List alle tilgjengelige alternativer innen accordion content
    const alleHandlinger = accordionContent.locator(".behandlingsmeny__handling");
    const antallHandlinger = await alleHandlinger.count();

    if (antallHandlinger === 0) {
      throw new Error(`Ingen behandlingshandlinger funnet i accordion content på sak ${saksnummer}`);
    }

    const tilgjengeligeAlternativer: Array<{ element: Locator; tekst: string }> = [];
    for (let i = 0; i < antallHandlinger; i++) {
      try {
        const element = alleHandlinger.nth(i);
        const tekst = await element.textContent();
        const trimmetTekst = tekst?.trim() || "";
        if (trimmetTekst) {
          tilgjengeligeAlternativer.push({ element, tekst: trimmetTekst });
        }
      } catch {
        // Skip elements that can't be read
      }
    }

    if (tilgjengeligeAlternativer.length === 0) {
      throw new Error(`Ingen lesbare behandlingshandlinger funnet på sak ${saksnummer}`);
    }

    // Finn ekte avslutningsalternativer (ikke oppgavelisteflytting)
    const avslutningsalternativer = tilgjengeligeAlternativer.filter(
      (alt) =>
        alt.tekst.includes("Søknaden er innvilget") ||
        alt.tekst.includes("Søknaden er avslått") ||
        alt.tekst.includes("innvilget") ||
        alt.tekst.includes("avslått") ||
        alt.tekst.includes("henlagt") ||
        alt.tekst.includes("Ferdigbehandlet") ||
        alt.tekst.includes("Behandlingen er bortfalt"),
    );

    if (avslutningsalternativer.length === 0) {
      const tilgjengeligeTekster = tilgjengeligeAlternativer.map((alt) => `"${alt.tekst}"`).join(", ");
      throw new Error(
        `Ingen ekte avslutningsalternativer funnet på sak ${saksnummer}. Tilgjengelige: ${tilgjengeligeTekster}`,
      );
    }

    // Bruk første ekte avslutningsalternativ
    const valgtAlternativ = avslutningsalternativer[0];

    // Vent på at elementet blir synlig og klikk
    await expect(valgtAlternativ.element).toBeVisible({ timeout: 3000 });
    await valgtAlternativ.element.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Velg en generisk avslutningstype basert på tekst
   */
  async velgAvslutningstype(tekst: string, saksnummer: string): Promise<void> {
    // Første prioritet: Søk etter behandlingsmeny__handling elementer
    const behandlingsHandling = this.page.locator(
      `.behandlingsmeny__handling:has(.behandlingsmeny__handling__tekst:has-text("${tekst}"))`,
    );

    const handlingSynlig = await behandlingsHandling.isVisible({ timeout: 2000 }).catch(() => false);

    if (handlingSynlig) {
      await behandlingsHandling.click();
      await this.page.waitForTimeout(500);
      return;
    }

    // Fallback: Søk etter andre typer elementer
    const selectors = [
      `button:has-text("${tekst}")`,
      `li:has-text("${tekst}")`,
      `[role="option"]:has-text("${tekst}")`,
      `a:has-text("${tekst}")`,
    ];

    let alternativFunnet = false;
    for (const selector of selectors) {
      const alternativ = this.page.locator(selector).first();
      if (await alternativ.isVisible({ timeout: 2000 }).catch(() => false)) {
        await alternativ.click();
        alternativFunnet = true;
        break;
      }
    }

    expect(alternativFunnet, `Avslutningsalternativ "${tekst}" ikke funnet på sak ${saksnummer}`).toBe(true);
    await this.page.waitForTimeout(500);
  }

  /**
   * Bekreft avslutningen (hvis det er en bekreftelsesdialog)
   */
  async bekreftAvslutning(): Promise<void> {
    // Først, vent på at modalen åpnes
    const modalSelectors = [".navds-modal[open]", ".modal[open]", '[role="dialog"]', ".dialog", ".confirmation-modal"];

    let modal = null;
    for (const selector of modalSelectors) {
      const modalElement = this.page.locator(selector);
      if (await modalElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        modal = modalElement;
        break;
      }
    }

    if (!modal) {
      throw new Error("Fant ingen åpen modal for bekreftelse");
    }

    // Sjekk om det er en "Henlegg saken" modal som krever begrunnelse
    const modalTekst = await modal.textContent();
    const erHenleggModal = modalTekst?.includes("Henlegg saken") || false;

    if (erHenleggModal) {
      // Finn og fyll ut begrunnelse dropdown
      const begrunnelseDropdown = modal.locator("select, .navds-select__input");
      const dropdownSynlig = await begrunnelseDropdown.isVisible({ timeout: 2000 }).catch(() => false);

      if (dropdownSynlig) {
        // Prøv å velge "Søknaden er trukket" først, ellers "Utenlandsoppholdet er avlyst"
        try {
          await begrunnelseDropdown.selectOption({ label: "Søknaden er trukket" });
        } catch {
          try {
            await begrunnelseDropdown.selectOption({ label: "Utenlandsoppholdet er avlyst" });
          } catch {
            // Fallback til første alternativ (index 1, siden 0 er "Velg...")
            await begrunnelseDropdown.selectOption({ index: 1 });
          }
        }
        await this.page.waitForTimeout(500); // Vent på at knappen blir enabled
      }
    }

    // Finn "Bekreft" knappen inne i modalen
    const bekreftSelectors = [
      'button:has-text("Henlegg saken")',
      'button:has-text("Bekreft")',
      'button:has-text("OK")',
      'button:has-text("Ja")',
      'button:has-text("Lagre")',
      'button[type="submit"]',
      ".primary-button",
      ".navds-button--primary",
    ];

    let bekreftKnapp = null;
    for (const selector of bekreftSelectors) {
      const knapp = modal.locator(selector);
      if (await knapp.isVisible({ timeout: 1000 }).catch(() => false)) {
        bekreftKnapp = knapp;
        break;
      }
    }

    if (!bekreftKnapp) {
      throw new Error("Fant ingen bekreft-knapp i modalen");
    }

    const erEnabled = await bekreftKnapp.isEnabled();

    if (erEnabled) {
      await bekreftKnapp.click();
    } else {
      await bekreftKnapp.click({ force: true });
    }
  }

  /**
   * Fullfør hele prosessen med å avslutte en behandling med spesifisert type
   * @param type - type avslutning
   * @param saksnummer - saksnummer for feilmeldinger
   */
  async avsluttBehandling(
    type:
      | "Søknaden er innvilget"
      | "Søknaden er avslått"
      | "Avslå søknad pga. manglende opplysninger"
      | "Ferdigbehandlet"
      | "Søknaden/klagen er trukket"
      | "Behandlingen er bortfalt",
    saksnummer: string,
  ): Promise<void> {
    await this.klikkAvsluttBehandling();

    if (type === "Søknaden er innvilget") {
      await this.velgSoknadenErInnvilget(saksnummer);
    } else {
      await this.velgAvslutningstype(type, saksnummer);
    }

    await this.bekreftAvslutning();
    await this.verifiserVellykketAvslutning(saksnummer);
  }

  /**
   * Verifiser at vi blir redirectet til hovedsiden uten feilmeldinger
   */
  async verifiserVellykketAvslutning(saksnummer: string): Promise<void> {
    await this.page.waitForURL(/\/melosys\/$/);

    // Sjekk at det ikke er noen feilmeldinger
    const feilmeldinger = [".alert-error", ".error", ".feilmelding", '[role="alert"]', ".navds-alert--error"];

    for (const selector of feilmeldinger) {
      const feilmelding = this.page.locator(selector);
      if (await feilmelding.isVisible().catch(() => false)) {
        const feilTekst = await feilmelding.textContent();
        throw new Error(`Feilmelding vist etter avslutning på sak ${saksnummer}: ${feilTekst}`);
      }
    }
  }
}
