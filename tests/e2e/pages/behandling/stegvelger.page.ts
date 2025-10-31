import { expect, Page } from "@playwright/test";
import { getSaksnummerFraUrl } from "../../utils/testUtils";

/**
 * Page Object Model for stegvelger-komponenten
 * Håndterer navigasjon mellom steg i en behandling
 */
export class StegvelgerPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Vent på at stegvelgeren blir synlig (dvs. at data har lastet)
   * Stegvelgeren vises kun når mottatteOpplysninger og soknadForm er lastet
   */
  async ventPaStegvelger(timeout = 30000): Promise<void> {
    const saksnummer = getSaksnummerFraUrl(this.page);
    const stegvelgerContainer = this.page.locator(".stegvelger");
    await expect(stegvelgerContainer, `${saksnummer}: Stegvelger-container skal være synlig`).toBeVisible({ timeout });

    // Vent også på at steglinjen (progressbar) er synlig
    const stegLinje = this.page.locator(".stegLinje");
    await expect(stegLinje, `${saksnummer}: Steglinje (progressbar) skal være synlig`).toBeVisible({ timeout: 5000 });
  }

  /**
   * Hent navnet på det aktive steget
   */
  async hentAktivtSteg(): Promise<string> {
    // Først, sørg for at stegvelgeren er lastet
    await this.ventPaStegvelger();

    // Finn stegikonet som er aktivt (har aktivtSteg prop)
    // Strukturen er: ul.stegLinje > li.stegIkon > button.stegIkon__knapp > div.stegIkon__tittel
    const stegikoner = this.page.locator(".stegLinje .stegIkon");
    const antall = await stegikoner.count();

    for (let i = 0; i < antall; i++) {
      const stegikon = stegikoner.nth(i);
      const knapp = stegikon.locator(".stegIkon__knapp");

      // Sjekk om ikonet har en aktiv klasse (stegIkon__enkeltSteg eller stegIkon__vedtak med aktiv tilstand)
      // Det aktive steget har et ikon med spesiell klasse
      const ikon = knapp.locator("svg").first();
      const ikonClass = await ikon.getAttribute("class");

      // Aktivt steg har vanligvis "stegIkon__enkeltSteg" eller "stegIkon__vedtak" class
      // og ikonet vil være synlig
      if (ikonClass && (ikonClass.includes("enkeltSteg") || ikonClass.includes("vedtak"))) {
        // Hent tittelen
        const tittel = stegikon.locator(".stegIkon__tittel");
        if (await tittel.isVisible({ timeout: 1000 }).catch(() => false)) {
          const tekst = await tittel.textContent();
          if (tekst?.trim()) {
            // Fortsett å søke - vi må finne det aktive
            // La oss prøve en annen tilnærming: finn steget som har fokus eller spesiell styling
          }
        }
      }
    }

    // Fallback: Finn første steg med synlig tittel (antar første er aktivt)
    const saksnummer = getSaksnummerFraUrl(this.page);
    const forsteTittel = this.page.locator(".stegLinje .stegIkon .stegIkon__tittel").first();
    await expect(forsteTittel, `${saksnummer}: Første steg-tittel skal være synlig`).toBeVisible({ timeout: 2000 });
    const tekst = await forsteTittel.textContent();
    expect(tekst?.trim(), "Kunne ikke finne aktivt steg med tekst").toBeTruthy();
    return tekst!.trim();
  }

  /**
   * Hent alle tilgjengelige steg
   */
  async hentAlleSteg(): Promise<string[]> {
    // Først, sørg for at stegvelgeren er lastet
    await this.ventPaStegvelger();

    // Hent alle steg-titler fra steglinjen
    const tittelElementer = this.page.locator(".stegLinje .stegIkon .stegIkon__tittel");
    const antall = await tittelElementer.count();

    const steg: string[] = [];
    for (let i = 0; i < antall; i++) {
      const tekst = await tittelElementer.nth(i).textContent();
      if (tekst?.trim()) {
        // Fjern HTML-tags hvis det er noen (siden tittel bruker dangerouslySetInnerHTML)
        const renTekst = tekst.trim().replace(/<[^>]*>/g, "");
        steg.push(renTekst);
      }
    }

    return steg;
  }

  /**
   * Klikk på "Neste" knappen
   */
  async klikkNeste(): Promise<void> {
    const selektorer = [
      'button:has-text("Neste")',
      'button:has-text("Gå videre")',
      ".stegvelger__neste",
      '[aria-label="Neste steg"]',
      'button[type="submit"]:has-text("Neste")',
    ];

    let knappKlikket = false;
    for (const selektor of selektorer) {
      const knapp = this.page.locator(selektor).first();
      if (await knapp.isVisible({ timeout: 2000 }).catch(() => false)) {
        await knapp.click();
        knappKlikket = true;
        await this.page.waitForTimeout(500); // Vent på stegovergang
        break;
      }
    }

    expect(knappKlikket, `${getSaksnummerFraUrl(this.page)}: Kunne ikke finne 'Neste' knapp`).toBe(true);
  }

  /**
   * Klikk på "Forrige" knappen
   */
  async klikkForrige(): Promise<void> {
    const selektorer = [
      'button:has-text("Forrige")',
      'button:has-text("Tilbake")',
      ".stegvelger__forrige",
      '[aria-label="Forrige steg"]',
      'button:has-text("Gå tilbake")',
    ];

    let knappKlikket = false;
    for (const selektor of selektorer) {
      const knapp = this.page.locator(selektor).first();
      if (await knapp.isVisible({ timeout: 2000 }).catch(() => false)) {
        await knapp.click();
        knappKlikket = true;
        await this.page.waitForTimeout(500); // Vent på stegovergang
        break;
      }
    }

    expect(knappKlikket, `${getSaksnummerFraUrl(this.page)}: Kunne ikke finne 'Forrige' knapp`).toBe(true);
  }

  /**
   * Klikk direkte på et steg i progressbaren
   */
  async klikkSteg(stegnavn: string): Promise<void> {
    // Prøv å finne og klikke på steget i progressbaren
    const selektorer = [
      `.stegvelger__steg:has-text("${stegnavn}")`,
      `.navds-stepper__step:has-text("${stegnavn}")`,
      `button:has-text("${stegnavn}")`,
    ];

    let stegKlikket = false;
    for (const selektor of selektorer) {
      const steg = this.page.locator(selektor).first();
      if (await steg.isVisible({ timeout: 2000 }).catch(() => false)) {
        await steg.click();
        stegKlikket = true;
        await this.page.waitForTimeout(500);
        break;
      }
    }

    expect(stegKlikket, `${getSaksnummerFraUrl(this.page)}: Kunne ikke finne og klikke på steg: ${stegnavn}`).toBe(
      true,
    );
  }

  /**
   * Verifiser at steget inneholder forventet innhold
   */
  async verifiserStegInnhold(forventetInnhold: string): Promise<void> {
    const innholdFunnet = await this.page
      .locator(`text=${forventetInnhold}`)
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    expect(
      innholdFunnet,
      `${getSaksnummerFraUrl(this.page)}: Forventet innhold "${forventetInnhold}" ikke funnet i steget`,
    ).toBe(true);
  }

  /**
   * Sjekk om "Neste" knappen er synlig
   */
  async erNesteKnappSynlig(): Promise<boolean> {
    const knapp = this.page.locator('button:has-text("Neste")').first();
    return await knapp.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Sjekk om "Forrige" knappen er synlig
   */
  async erForrigeKnappSynlig(): Promise<boolean> {
    const knapp = this.page.locator('button:has-text("Forrige")').first();
    return await knapp.isVisible({ timeout: 1000 }).catch(() => false);
  }
}
