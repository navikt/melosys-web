import { expect, Locator, Page } from "@playwright/test";
import { hentSakMetadata, PrepopulertSaksnummer } from "../../utils/testdataUtils";

/**
 * Page Object Model for visning og håndtering av behandlinger
 * Inkluderer funksjonalitet for avslutning, endring, og generell behandlingshåndtering
 */
export class BehandlingPage {
  readonly page: Page;
  readonly saksnummer: PrepopulertSaksnummer;

  /**
   * @param page - Playwright Page
   * @param saksnummer - Saksnummer (f.eks. "MEL-1001")
   */
  constructor(page: Page, saksnummer: PrepopulertSaksnummer) {
    this.page = page;
    this.saksnummer = saksnummer;
  }

  /**
   * Formatert kontekst for feilmeldinger (saksnummer + metadata)
   */
  get ctx(): string {
    const meta = hentSakMetadata(this.saksnummer);
    if (!meta) {
      return `[${this.saksnummer}]`;
    }
    return `[${this.saksnummer}]
  behandlingID: ${meta.behandlingID}
  sakstype: ${meta.sakstype}
  sakstema: ${meta.sakstema}
  behandlingstema: ${meta.behandlingstema}
  behandlingstype: ${meta.behandlingstype}
  behandlingsstatus: ${meta.behandlingsstatus}`;
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

    // Vent på informasjonslinjen (finnes alltid på behandlingssider, inneholder personnavn og fnr)
    await expect(
      this.page.locator(".informasjonlinje"),
      `${this.ctx}: Fant ikke behandlingssiden (informasjonslinje mangler)`,
    ).toBeVisible({ timeout: 10000 });

    // Hvis forventet tittel er oppgitt, verifiser at den finnes
    if (forventetTittel) {
      await expect(
        this.page.locator("h1.stegvelgertittel"),
        `${this.ctx}: Fant ikke tittelen "${forventetTittel}"`,
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

      await expect(hamburgerMeny, `${this.ctx}: Fant ikke menyknappen`).toBeVisible({ timeout: 5000 });
      await hamburgerMeny.click();
    }

    // Finn accordion-headeren for "Avslutt behandling"
    const accordionHeader = this.page.locator(
      '.behandlingsmeny__meny .navds-accordion__header:has(.navds-accordion__header-content:has-text("Avslutt behandling"))',
    );

    await expect(accordionHeader, `${this.ctx}: Fant ikke "Avslutt behandling" i menyen`).toBeVisible({
      timeout: 2000,
    });
    await accordionHeader.click();

    // Vær mer spesifikk - finn accordion content som tilhører "Avslutt behandling"
    const accordionContent = this.page.locator(
      '.behandlingsmeny__meny .navds-accordion__item:has(.navds-accordion__header:has(.navds-accordion__header-content:has-text("Avslutt behandling"))) .navds-accordion__content',
    );
    await expect(accordionContent, `${this.ctx}: Menyen "Avslutt behandling" åpnet ikke`).toBeVisible({
      timeout: 3000,
    });
  }

  /**
   * Velg "Søknaden er innvilget" som avslutningsgrunn
   */
  async velgSoknadenErInnvilget(): Promise<void> {
    // Først, sjekk at accordion-innholdet fortsatt er synlig
    const accordionContent = this.page.locator(
      '.behandlingsmeny__meny .navds-accordion__item:has(.navds-accordion__header:has(.navds-accordion__header-content:has-text("Avslutt behandling"))) .navds-accordion__content',
    );

    await expect(accordionContent, `${this.ctx}: Menyen "Avslutt behandling" er ikke åpen`).toBeVisible({
      timeout: 2000,
    });

    // List alle tilgjengelige alternativer innen accordion content
    const alleHandlinger = accordionContent.locator(".behandlingsmeny__handling");
    const antallHandlinger = await alleHandlinger.count();

    expect(antallHandlinger > 0, `${this.ctx}: Fant ingen avslutningsalternativer i menyen`).toBe(true);

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

    expect(tilgjengeligeAlternativer.length > 0, `${this.ctx}: Fant ingen lesbare alternativer i menyen`).toBe(true);

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
      `${this.ctx}: Ingen ekte avslutningsalternativer funnet. Tilgjengelige: ${tilgjengeligeTekster}`,
    ).toBe(true);

    // Bruk første ekte avslutningsalternativ
    const valgtAlternativ = avslutningsalternativer[0];

    // Vent på at elementet blir synlig og klikk
    await expect(valgtAlternativ.element, `${this.ctx}: Fant ikke alternativet "${valgtAlternativ.tekst}"`).toBeVisible(
      { timeout: 3000 },
    );
    await valgtAlternativ.element.click();
  }

  /**
   * Velg en generisk avslutningstype basert på tekst
   */
  async velgAvslutningstype(tekst: string): Promise<void> {
    const handling = this.page.getByRole("button", { name: tekst });
    await expect(handling, `${this.ctx}: Fant ikke avslutningstype "${tekst}"`).toBeVisible();
    await handling.click();
  }

  /**
   * Bekreft avslutningen (hvis det er en bekreftelsesdialog)
   * @param buttonText - tekst på bekreft-knappen
   * @param selectText - Valgfri spesifikk tekst på bekreft-knappen (hvis den avviker fra menyteksten)
   */
  async bekreftAvslutning(buttonText: string, selectText?: string): Promise<void> {
    const modal = this.page.getByRole("dialog");
    await expect(modal, `${this.ctx}: Fant ingen åpen modal for bekreftelse`).toBeVisible({ timeout: 2000 });

    // Sjekk om det er en "Henlegg saken" modal som krever begrunnelse
    const modalTekst = await modal.textContent();
    const erHenleggModal = modalTekst?.includes("Henlegg saken") || false;

    if (erHenleggModal && selectText) {
      const begrunnelseDropdown = modal.getByRole("combobox");
      if (await begrunnelseDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
        await begrunnelseDropdown.selectOption({ label: selectText });
        await this.page.waitForTimeout(500);
      }
    }

    const bekreftKnapp = modal.getByRole("button", { name: buttonText });
    await expect(bekreftKnapp, `${this.ctx}: Fant ikke bekreft-knappen "${buttonText}"`).toBeVisible({ timeout: 2000 });
    await bekreftKnapp.click();
  }

  /**
   * Fullfør hele prosessen med å avslutte en behandling med spesifisert type
   * @param vedtaksType - type avslutning
   * @param bekreftKnappTekst - tekst på bekreft-knappen
   * @param selectText - valgfri tekst for dropdown i modal
   */
  async avsluttBehandling(
    vedtaksType:
      | "Søknaden er innvilget"
      | "Søknaden er avslått"
      | "Avslå søknad pga. manglende opplysninger"
      | "Ferdigbehandlet"
      | "Søknaden/klagen er trukket"
      | "Behandlingen er bortfalt",
    bekreftKnappTekst: string,
    selectText?: string,
  ): Promise<void> {
    await this.klikkAvsluttBehandling();

    if (vedtaksType === "Søknaden er innvilget") {
      await this.velgSoknadenErInnvilget();
    } else {
      await this.velgAvslutningstype(vedtaksType);
    }

    await this.bekreftAvslutning(bekreftKnappTekst, selectText);
    await this.verifiserVellykketAvslutning();
  }

  /**
   * Verifiser at vi blir redirectet til hovedsiden uten feilmeldinger
   */
  async verifiserVellykketAvslutning(): Promise<void> {
    await this.page.waitForURL(/\/melosys\/$/);

    // Sjekk at det ikke er noen feilmeldinger (role="alert" er semantisk standard)
    const feilmelding = this.page.getByRole("alert");
    await expect(feilmelding, `${this.ctx}: Feilmelding vises etter avslutning`).not.toBeVisible();
  }
}
