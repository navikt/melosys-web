import { expect, Locator, Page } from "@playwright/test";
import { getSaksnummerFraUrl } from "../../utils/testUtils";

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
   * Naviger til en behandlingsside
   * @param url - Relativ URL til behandlingssiden (f.eks. "/melosys/FTRL/saksbehandling/MEL-1002?behandlingID=2")
   * @param tittel tittel på behandlingssiden (f.eks. "Oppgi opplysninger fra attest / S1")
   */
  async goto(url: string, tittel?: string): Promise<void> {
    await this.page.goto(url);
    await this.verifiserBehandlingsside(tittel);
  }

  /**
   * Klikk på Bekreft-knappen i Inngang-steget (kun i aktivt steg)
   */
  async klikkBekreftOgFortsett(): Promise<void> {
    const bekreftKnapp = this.page.locator(".stegFane--aktiv button.stegKnapper__bekreft");
    await bekreftKnapp.waitFor({ state: "visible", timeout: 5000 });
    expect(await bekreftKnapp.isVisible(), "Knappen 'Bekreft og fortsett'").toBe(true);
    await bekreftKnapp.click();
  }

  /**
   * Verifiser at vi er på behandlingssiden
   * @param forventetTittel - Valgfri tittel som skal vises på siden (f.eks. "Oppgi opplysninger fra attest / S1")
   */
  async verifiserBehandlingsside(forventetTittel?: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/melosys\/(FTRL|AVTALELAND|EOS|EU_EOS|TRYGDEAVTALE)\/.*\/MEL-\d+/);

    // Vent på at siden lastes med behandlingsinnhold
    await this.page.waitForLoadState("domcontentloaded");

    const saksnummer = getSaksnummerFraUrl(this.page);

    // Vent på informasjonslinjen (finnes alltid på behandlingssider, inneholder personnavn og fnr)
    await expect(
      this.page.locator(".informasjonlinje"),
      `${saksnummer}: Informasjonslinjen skal være synlig`,
    ).toBeVisible({ timeout: 10000 });

    // Hvis forventet tittel er oppgitt, verifiser at den finnes
    if (forventetTittel) {
      await expect(
        this.page.locator("h1.stegvelgertittel"),
        `${saksnummer}: Tittelen "${forventetTittel}" skal være synlig`,
      ).toHaveText(forventetTittel, { timeout: 10000 });
    }
  }

  /**
   * Finn og klikk på "Avslutt behandling" accordion-header i behandlingsmenyen
   */
  async klikkAvsluttBehandling(): Promise<void> {
    const behandlingsmeny = this.page.locator(".behandlingsmeny__meny");
    const menyErSynlig = await behandlingsmeny.isVisible().catch(() => false);

    if (!menyErSynlig) {
      const hamburgerMeny = this.page.locator(".behandlingsmeny__knapp");
      const saksnummer = getSaksnummerFraUrl(this.page);

      await expect(hamburgerMeny, `${saksnummer}: Hamburger-meny skal være synlig`).toBeVisible({ timeout: 5000 });
      await hamburgerMeny.click();
    }

    // Finn accordion-headeren for "Avslutt behandling"
    const accordionHeader = this.page.locator(
      '.behandlingsmeny__meny .navds-accordion__header:has(.navds-accordion__header-content:has-text("Avslutt behandling"))',
    );
    const saksnummer = getSaksnummerFraUrl(this.page);

    await expect(accordionHeader, `${saksnummer}: Accordion-header "Avslutt behandling" skal være synlig`).toBeVisible({
      timeout: 2000,
    });
    await accordionHeader.click();

    // Vær mer spesifikk - finn accordion content som tilhører "Avslutt behandling"
    const accordionContent = this.page.locator(
      '.behandlingsmeny__meny .navds-accordion__item:has(.navds-accordion__header:has(.navds-accordion__header-content:has-text("Avslutt behandling"))) .navds-accordion__content',
    );
    await expect(
      accordionContent,
      `${saksnummer}: Accordion-innhold "Avslutt behandling" skal være synlig`,
    ).toBeVisible({ timeout: 3000 });
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

    await expect(
      accordionContent,
      `${saksnummer}: Accordion content for "Avslutt behandling" skal være synlig`,
    ).toBeVisible({ timeout: 2000 });

    // List alle tilgjengelige alternativer innen accordion content
    const alleHandlinger = accordionContent.locator(".behandlingsmeny__handling");
    const antallHandlinger = await alleHandlinger.count();

    expect(antallHandlinger > 0, `Ingen behandlingshandlinger funnet i accordion content på sak ${saksnummer}`).toBe(
      true,
    );

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

    expect(
      tilgjengeligeAlternativer.length > 0,
      `Ingen lesbare behandlingshandlinger funnet på sak ${saksnummer}`,
    ).toBe(true);

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

    const tilgjengeligeTekster = tilgjengeligeAlternativer.map((alt) => `"${alt.tekst}"`).join(", ");
    expect(
      avslutningsalternativer.length > 0,
      `Ingen ekte avslutningsalternativer funnet på sak ${saksnummer}. Tilgjengelige: ${tilgjengeligeTekster}`,
    ).toBe(true);

    // Bruk første ekte avslutningsalternativ
    const valgtAlternativ = avslutningsalternativer[0];

    // Vent på at elementet blir synlig og klikk
    await expect(
      valgtAlternativ.element,
      `${saksnummer}: Avslutningsalternativ "${valgtAlternativ.tekst}" skal være synlig`,
    ).toBeVisible({ timeout: 3000 });
    await valgtAlternativ.element.click();
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
  }

  /**
   * Bekreft avslutningen (hvis det er en bekreftelsesdialog)
   */
  async bekreftAvslutning(): Promise<void> {
    const saksnummer = getSaksnummerFraUrl(this.page);
    const modalSelectors = [".navds-modal[open]", ".modal[open]", '[role="dialog"]', ".dialog", ".confirmation-modal"];

    let modal = null;
    for (const selector of modalSelectors) {
      const modalElement = this.page.locator(selector);
      if (await modalElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        modal = modalElement;
        break;
      }
    }

    expect(modal, `${saksnummer}: Fant ingen åpen modal for bekreftelse`).not.toBeNull();
    if (!modal) return; // Type guard for TypeScript

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
        // Vent på at bekreft-knappen blir enabled
        await modal.locator('button[type="submit"]:not([disabled])').waitFor({ state: "visible", timeout: 2000 });
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

    expect(bekreftKnapp, `${saksnummer}: Fant ingen bekreft-knapp i modalen`).not.toBeNull();
    if (!bekreftKnapp) return; // Type guard for TypeScript

    const erEnabled = await bekreftKnapp.isEnabled();

    if (erEnabled) {
      await bekreftKnapp.click();
    } else {
      await bekreftKnapp.click({ force: true });
    }
  }

  /**
   * Fullfør hele prosessen med å avslutte en behandling med spesifisert type
   * @param vedtaksType - type avslutning
   * @param saksnummer - saksnummer for feilmeldinger
   */
  async avsluttBehandling(
    vedtaksType:
      | "Søknaden er innvilget"
      | "Søknaden er avslått"
      | "Avslå søknad pga. manglende opplysninger"
      | "Ferdigbehandlet"
      | "Søknaden/klagen er trukket"
      | "Behandlingen er bortfalt",
    saksnummer: string,
  ): Promise<void> {
    await this.klikkAvsluttBehandling();

    if (vedtaksType === "Søknaden er innvilget") {
      await this.velgSoknadenErInnvilget(saksnummer);
    } else {
      await this.velgAvslutningstype(vedtaksType, saksnummer);
    }

    await this.bekreftAvslutning();
    await this.verifiserVellykketAvslutning();
  }

  /**
   * Verifiser at vi blir redirectet til hovedsiden uten feilmeldinger
   */
  async verifiserVellykketAvslutning(): Promise<void> {
    await this.page.waitForURL(/\/melosys\/$/);

    // Sjekk at det ikke er noen feilmeldinger
    const feilmeldinger = [".alert-error", ".error", ".feilmelding", '[role="alert"]', ".navds-alert--error"];

    for (const selector of feilmeldinger) {
      const feilmelding = this.page.locator(selector);
      await expect(feilmelding).not.toBeVisible();
    }
  }
}
