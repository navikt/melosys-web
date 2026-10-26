import { expect, Locator, Page } from "@playwright/test";

/**
 * Component object for felles `MultiSelect` (Aksel Combobox med flervalg).
 *
 * `omraade` må inneholde comboboxen og chipsene for valgte verdier, men ikke chips fra andre flervalg.
 */
export class MultiSelectComponent {
  constructor(
    private readonly page: Page,
    private readonly combobox: Locator,
    private readonly omraade: Locator,
  ) {}

  private get valgte(): Locator {
    return this.omraade.getByRole("button", { name: / slett$/ });
  }

  private valgt(verdi: string): Locator {
    return this.omraade.getByRole("button", { name: `${verdi} slett`, exact: true });
  }

  private async liste(): Promise<Locator> {
    const listeId = await this.combobox.getAttribute("aria-controls");
    return this.page.locator(`[id="${listeId}"]`);
  }

  /**
   * Aksel Combobox registrerer «klikk utenfor»-lytteren i en setTimeout(0) når listen åpnes. Lukkes listen før
   * timeouten har kjørt (lett under last), lekker lytteren og senere klikk i listen lukker den uten å velge.
   * Vent derfor en macrotask etter at en liste er åpnet, og ikke lukk den med Escape.
   */
  private async ventTilListenErKlar(): Promise<void> {
    await this.page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 0)));
  }

  /**
   * Søk etter verdien og velg den
   */
  async velg(verdi: string, søketekst: string = verdi): Promise<void> {
    await this.combobox.fill(søketekst);
    await this.ventTilListenErKlar();
    await (await this.liste()).getByRole("option", { name: verdi, exact: true }).click();
    await expect(this.valgt(verdi)).toHaveCount(1);
  }

  async fjern(verdi: string): Promise<void> {
    await this.valgt(verdi).click();
    await expect(this.valgt(verdi)).toHaveCount(0);
  }

  async fjernSisteMedBackspace(): Promise<void> {
    await this.combobox.press("Backspace");
  }

  /**
   * Verifiser at nøyaktig de oppgitte verdiene er valgt, i valgt rekkefølge
   */
  async verifiserValgte(forventet: string[]): Promise<void> {
    await expect(this.valgte).toHaveCount(forventet.length);
    for (const [i, verdi] of forventet.entries()) {
      await expect(this.valgte.nth(i)).toHaveAccessibleName(`${verdi} slett`);
    }
  }

  /**
   * Verifiser at flervalget tilbyr nøyaktig de oppgitte valgene
   */
  async verifiserValgmuligheter(forventet: string[]): Promise<void> {
    await this.combobox.click();
    await this.ventTilListenErKlar();
    await expect((await this.liste()).getByRole("option")).toHaveText(forventet);
  }
}
