import { expect, Locator, Page } from "@playwright/test";
import type { OpprettBucRequest } from "../../mocks/opprettNyBucMock";

const OPPRETT_NY_BUC = "Opprett ny BUC";

export type Flervalg = "Land" | "Mottakerinstitusjoner";

/**
 * Page Object for fanen «Opprett ny BUC» i sidepanelet på en behandling
 */
export class OpprettNyBucPage {
  constructor(readonly page: Page) {}

  private get panel(): Locator {
    return this.page.getByRole("tabpanel", { name: OPPRETT_NY_BUC });
  }

  private flervalg(felt: Flervalg): Locator {
    return this.panel.getByRole("combobox", { name: felt, exact: true });
  }

  /** Chips i et flervalg ligger i samme wrapper som comboboxen */
  private valgte(felt: Flervalg): Locator {
    return this.panel
      .locator(".aksel-combobox__wrapper")
      .filter({ has: this.page.getByRole("combobox", { name: felt, exact: true }) })
      .getByRole("button", { name: / slett$/ });
  }

  private get opprettKnapp(): Locator {
    return this.panel.getByRole("button", { name: OPPRETT_NY_BUC, exact: true });
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
    await this.page.getByRole("tab", { name: OPPRETT_NY_BUC }).click();
    await expect(this.flervalg("Land")).toBeVisible();
  }

  async velgBuc(buc: string): Promise<void> {
    await this.panel.getByRole("combobox", { name: /^BUC/ }).selectOption(buc);
  }

  /**
   * Søk etter verdien i flervalget og velg den
   */
  async velg(felt: Flervalg, verdi: string, søketekst: string = verdi): Promise<void> {
    await this.flervalg(felt).fill(søketekst);
    await this.page.getByRole("option", { name: verdi, exact: true }).click();
    await expect(this.valgte(felt).filter({ hasText: verdi })).toHaveCount(1);
  }

  async fjern(felt: Flervalg, verdi: string): Promise<void> {
    await this.valgte(felt).filter({ hasText: verdi }).click();
    await expect(this.valgte(felt).filter({ hasText: verdi })).toHaveCount(0);
  }

  /**
   * Verifiser at nøyaktig de oppgitte verdiene er valgt
   */
  async verifiserValgte(felt: Flervalg, forventet: string[]): Promise<void> {
    await expect(this.valgte(felt)).toHaveCount(forventet.length);
    for (const [i, verdi] of forventet.entries()) {
      await expect(this.valgte(felt).nth(i)).toHaveAccessibleName(`${verdi} slett`);
    }
  }

  /**
   * Verifiser at flervalget tilbyr nøyaktig de oppgitte valgene
   */
  async verifiserValgmuligheter(felt: Flervalg, forventet: string[]): Promise<void> {
    await this.flervalg(felt).click();
    const listeId = await this.flervalg(felt).getAttribute("aria-controls");
    await expect(this.page.locator(`[id="${listeId}"]`).getByRole("option")).toHaveText(forventet);
  }

  async klikkOpprett(): Promise<void> {
    await this.opprettKnapp.click();
  }

  async verifiserFeilmeldinger(tekster: string[]): Promise<void> {
    for (const tekst of tekster) {
      await expect(this.panel.getByText(tekst, { exact: true })).toBeVisible();
    }
  }

  async verifiserIngenFeilmelding(tekst: string): Promise<void> {
    await expect(this.panel.getByText(tekst, { exact: true })).toHaveCount(0);
  }

  /**
   * Klikk «Opprett ny BUC», vent på kvittering og returner det som sendes i POST /api/eessi/bucer/{id}/opprett
   */
  async opprettOgHentRequest(): Promise<OpprettBucRequest> {
    const request = this.page.waitForRequest(
      (req) => req.method() === "POST" && /\/api\/eessi\/bucer\/\d+\/opprett$/.test(new URL(req.url()).pathname),
    );
    await this.opprettKnapp.click();
    const payload = (await request).postDataJSON() as OpprettBucRequest;
    await expect(this.panel.getByText("Saken er nå opprettet i RINA")).toBeVisible();
    return payload;
  }
}
