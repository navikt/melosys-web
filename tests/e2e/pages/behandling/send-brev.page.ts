import { Page, Locator, expect } from "@playwright/test";
import { BehandlingPage } from "./behandling.page";
import { PrepopulertSaksnummer } from "../../utils/testdataUtils";
import { assertFieldError, finnCombobox } from "../../utils/testUtils";

export class SendBrevPage extends BehandlingPage {
  constructor(page: Page, saksnummer: PrepopulertSaksnummer) {
    super(page, saksnummer);
  }

  // Dersom SendBrev ligger på en dedikert sti etter at man er inne i en sak, sett path her.
  // Hvis den nås via navigasjon i UI, kan goto() evt. tilpasses for å klikke riktig meny først.
  readonly path = "/send-brev";

  readonly labels = {
    mottaker: "Mottaker",
    brevmal: "Velg brevmal",
    sendBrev: "Send brev",
  };

  private sendBrevPanel?: Locator;

  get sendButton(): Locator {
    return this.page.getByRole("button", { name: this.labels.sendBrev });
  }

  private get sendBrevTab(): Locator {
    return this.page.locator('button[role="tab"][id$="--tab-brevbestilling"]');
  }

  // Native select for mottaker
  private get mottakerNativeSelect(): Locator {
    const scope = this.sendBrevPanel ?? this.page;
    return scope.locator('select[name="mottaker"]');
  }

  async clickSendBrevTab(): Promise<void> {
    const tab = this.sendBrevTab;

    await expect(tab, `${this.ctx}: Fant ikke "Send brev"-fanen`).toBeVisible();

    const panelId = await tab.getAttribute("aria-controls");
    await tab.click();

    if (panelId) {
      this.sendBrevPanel = this.page.locator(`#${panelId}`);
      await this.sendBrevPanel.waitFor({ state: "visible" });
    } else {
      this.sendBrevPanel = this.page.locator('[id$="--tabpanel-brevbestilling"]');
      await this.sendBrevPanel.first().waitFor({ state: "visible" });
    }

    await this.sendButton.waitFor({ state: "visible" });
  }

  // Velg første tilgjengelige option i en select/combobox (ikke placeholder)
  private async selectFirstOption(select: Locator) {
    await select.click();
    await this.page.keyboard.press("ArrowDown");
    await this.page.keyboard.press("Enter");
  }

  private async waitForBrevmalSelect(timeoutMs: number = 5000): Promise<Locator> {
    const scope = this.sendBrevPanel ?? this.page;
    return await finnCombobox(this.labels.brevmal, scope, timeoutMs);
  }

  async selectFirstMottaker() {
    // Bruk native select[name="mottaker"] direkte
    const sel = this.mottakerNativeSelect;
    await expect(sel, `${this.ctx}: Fant ikke mottaker-feltet`).toBeVisible();

    // Velg første reelle alternativ (index 1, siden index 0 er "Velg...")
    await sel.selectOption({ index: 1 });

    // Når mottaker er valgt trigges logikk som laster brevmalene og viser select
    await this.waitForBrevmalSelect();
  }

  async selectFirstBrevmal() {
    const ctl = await this.waitForBrevmalSelect();
    // Native select bruker selectOption, ARIA combobox bruker tastaturnavigasjon
    const tag = await ctl.evaluate((el) => el.tagName.toLowerCase());
    if (tag === "select") {
      await ctl.selectOption({ index: 1 });
    } else {
      await this.selectFirstOption(ctl);
    }
  }

  // Velg brevmal via synlig tekst (f.eks. "Innhenting av inntektsopplysninger for årsavregning")
  async selectBrevmalByLabel(label: string | RegExp) {
    const ctl = await this.waitForBrevmalSelect();
    const tag = await ctl.evaluate((el) => el.tagName.toLowerCase());
    if (tag === "select") {
      // Native select: finn option-verdi og bruk selectOption
      const value = await ctl.evaluate(
        (el, l) => {
          const sel = el as HTMLSelectElement;
          const re = l instanceof RegExp ? l : new RegExp(String(l), "i");
          const opt = Array.from(sel.options).find((o) => re.test(o.text));
          return opt?.value ?? "";
        },
        label as string | RegExp,
      );
      expect(value, `${this.ctx}: Fant ikke brevmalen "${label}"`).toBeTruthy();
      await ctl.selectOption(value);
    } else {
      // ARIA combobox: klikk og velg fra listbox
      await ctl.click({ force: true });
      const scope = this.sendBrevPanel ?? this.page;
      await scope.getByRole("option", { name: label }).first().click();
    }
  }

  async verifiserSendKnappDeaktivert() {
    await expect(this.sendButton, `${this.ctx}: Send-knappen er uventet aktiv`).toBeDisabled();
  }

  async verifiserSendKnappAktivert() {
    await expect(this.sendButton, `${this.ctx}: Send-knappen er uventet deaktivert`).toBeEnabled();
  }

  // Velg mottaker via synlig tekst, uten å vente på at brevmal dukker opp
  private async velgMottakerOption(label: string | RegExp): Promise<void> {
    const sel = this.mottakerNativeSelect;
    await expect(sel, `${this.ctx}: Fant ikke mottaker-feltet`).toBeVisible();

    const value = await sel.evaluate(
      (el, l) => {
        const select = el as HTMLSelectElement;
        const re = typeof l === "string" ? new RegExp(l, "i") : l;
        const opt = Array.from(select.options).find((o) => re.test(o.text));
        return opt?.value ?? "";
      },
      label as string | RegExp,
    );

    expect(value, `${this.ctx}: Fant ikke mottakeren "${label}"`).toBeTruthy();
    await sel.selectOption(value);
  }

  async selectMottakerByLabel(label: string | RegExp) {
    await this.velgMottakerOption(label);
    await this.waitForBrevmalSelect();
  }

  /**
   * Velg mottaker uten å vente på at «Velg brevmal» dukker opp.
   * Brukes for «Annen organisasjon», der brevmal først vises når org.nr er korrekt utfylt.
   */
  async velgMottaker(label: string | RegExp): Promise<void> {
    await this.velgMottakerOption(label);
  }

  // Tekstfelt for «Annen organisasjon»
  private get organisasjonsnummerInput(): Locator {
    const scope = this.sendBrevPanel ?? this.page;
    return scope.getByRole("textbox", { name: "Org.nr." });
  }

  private get kontaktpersonInput(): Locator {
    const scope = this.sendBrevPanel ?? this.page;
    return scope.getByRole("textbox", { name: "Kontaktperson (valgfritt)" });
  }

  private get brevmalCombobox(): Locator {
    const scope = this.sendBrevPanel ?? this.page;
    return scope.getByRole("combobox", { name: this.labels.brevmal });
  }

  /** Fyll ut org.nr og blur slik at validering trigges (validering skjer når man går ut av feltet). */
  async inputOrganisasjonsnummer(orgnr: string, saksnummer?: string): Promise<void> {
    const sakId = saksnummer ?? this.ctx;
    const input = this.organisasjonsnummerInput;
    await expect(input, `${sakId}: Fant ikke Org.nr-feltet`).toBeVisible();
    await input.fill(orgnr);
    await input.blur();
  }

  async verifiserBrevmalSkjult(saksnummer?: string): Promise<void> {
    const sakId = saksnummer ?? this.ctx;
    await expect(
      this.brevmalCombobox,
      `${sakId}: «Velg brevmal» skal være skjult før org.nr er korrekt utfylt`,
    ).toBeHidden();
  }

  async verifiserBrevmalSynlig(saksnummer?: string): Promise<void> {
    const sakId = saksnummer ?? this.ctx;
    await expect(
      this.brevmalCombobox,
      `${sakId}: «Velg brevmal» skal være synlig når organisasjonen er funnet`,
    ).toBeVisible();
  }

  async verifiserOrgnrFeilmelding(tekst: string | RegExp): Promise<void> {
    const scope = this.sendBrevPanel ?? this.page;
    await assertFieldError(scope, tekst);
  }

  /** Verifiser at Kontaktperson-feltet vises med «(valgfritt)» i label. */
  async verifiserKontaktpersonValgfri(saksnummer?: string): Promise<void> {
    const sakId = saksnummer ?? this.ctx;
    await expect(
      this.kontaktpersonInput,
      `${sakId}: Kontaktperson-feltet skal vises med «(valgfritt)» i label`,
    ).toBeVisible();
  }

  async clickSendBrev() {
    await this.sendButton.click();
  }
}
