import { expect, Locator, Page } from "@playwright/test";
import type { OpprettBucRequest } from "../../mocks/opprettNyBucMock";
import { MultiSelectComponent } from "../komponenter/multiselect.component";

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

  private combobox(felt: Flervalg): Locator {
    return this.panel.getByRole("combobox", { name: felt, exact: true });
  }

  /** Chips i et flervalg ligger i samme wrapper som comboboxen */
  private flervalg(felt: Flervalg): MultiSelectComponent {
    const wrapper = this.panel
      .locator(".aksel-combobox__wrapper")
      .filter({ has: this.page.getByRole("combobox", { name: felt, exact: true }) });
    return new MultiSelectComponent(this.page, this.combobox(felt), wrapper);
  }

  private get opprettKnapp(): Locator {
    return this.panel.getByRole("button", { name: OPPRETT_NY_BUC, exact: true });
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
    await this.page.getByRole("tab", { name: OPPRETT_NY_BUC }).click();
    await expect(this.combobox("Land")).toBeVisible();
  }

  async velgBuc(buc: string): Promise<void> {
    await this.panel.getByRole("combobox", { name: /^BUC/ }).selectOption(buc);
  }

  /**
   * Søk etter verdien i flervalget og velg den
   */
  async velg(felt: Flervalg, verdi: string, søketekst: string = verdi): Promise<void> {
    await this.flervalg(felt).velg(verdi, søketekst);
  }

  async fjern(felt: Flervalg, verdi: string): Promise<void> {
    await this.flervalg(felt).fjern(verdi);
  }

  /**
   * Verifiser at nøyaktig de oppgitte verdiene er valgt, i valgt rekkefølge
   */
  async verifiserValgte(felt: Flervalg, forventet: string[]): Promise<void> {
    await this.flervalg(felt).verifiserValgte(forventet);
  }

  /**
   * Verifiser at flervalget tilbyr nøyaktig de oppgitte valgene
   */
  async verifiserValgmuligheter(felt: Flervalg, forventet: string[]): Promise<void> {
    await this.flervalg(felt).verifiserValgmuligheter(forventet);
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
