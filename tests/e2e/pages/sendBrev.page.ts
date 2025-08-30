import { Page, Locator, expect } from "@playwright/test";

export class SendBrevPage {
  constructor(private page: Page) {}

  // Dersom SendBrev ligger på en dedikert sti etter at man er inne i en sak, sett path her.
  // Hvis den nås via navigasjon i UI, kan goto() evt. tilpasses for å klikke riktig meny først.
  readonly path = "/send-brev";

  readonly labels = {
    mottaker: /mottaker/i,
    brevmal: /brevmal|brevtype|type/i,
    sendBrev: /send brev/i,
  };

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

  // Behold ARIA-combobox for brevmal, men ha fallback til native select[name="type"]
  private get brevmalCombobox(): Locator {
    const scope = this.sendBrevPanel ?? this.page;
    return scope.getByRole("combobox", { name: this.labels.brevmal });
  }

  private get brevmalNativeSelect(): Locator {
    const scope = this.sendBrevPanel ?? this.page;
    return scope.locator('select[name="type"]');
  }

  private sendBrevPanel?: Locator;

  async goto() {
    await this.page.goto(this.path, { waitUntil: "domcontentloaded", timeout: 30000 });
  }

  async clickSendBrevTab(): Promise<void> {
    const tab = this.sendBrevTab;

    await expect(tab, 'Fant ikke "Send brev"-fanen').toBeVisible();

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

  private async waitForBrevmalSelect(timeoutMs: number = 10000): Promise<Locator> {
    // Vent på enten aria-combobox eller native select[name="type"]
    const combo = this.brevmalCombobox;
    if (await combo.count()) {
      await combo.waitFor({ state: "visible", timeout: timeoutMs });
      return combo;
    }
    const nativeSel = this.brevmalNativeSelect;
    await nativeSel.waitFor({ state: "visible", timeout: timeoutMs });
    return nativeSel;
  }

  async selectFirstMottaker() {
    // Bruk native select[name="mottaker"] direkte
    const sel = this.mottakerNativeSelect;
    await expect(sel, 'Fant ikke native select for "Mottaker"').toBeVisible();

    // Velg første reelle alternativ (index 1, siden index 0 er "Velg...")
    await sel.selectOption({ index: 1 });

    // Når mottaker er valgt trigges logikk som laster brevmalene og viser select
    await this.waitForBrevmalSelect();
  }

  async selectFirstBrevmal() {
    const ctl = await this.waitForBrevmalSelect();
    // Hvis dette er en native <select>, velg første reelle alternativ.
    // Hvis det er en combobox, bruk tastatur (ArrowDown+Enter).
    const tag = await ctl.evaluate((el) => el.tagName.toLowerCase());
    if (tag === "select") {
      await ctl.selectOption({ index: 1 });
    } else {
      await this.selectFirstOption(ctl);
    }
  }

  // Valgfritt: velg brevmal direkte via value (f.eks. "INNHENTING_AV_INNTEKTSOPPLYSNINGER")
  async selectBrevmalByValue(value: string) {
    const ctl = await this.waitForBrevmalSelect();
    const tag = await ctl.evaluate((el) => el.tagName.toLowerCase());
    if (tag === "select") {
      await ctl.selectOption(value);
    } else {
      // Combobox fallback: åpne og klikk på option med matchende tekst/value
      await ctl.click({ force: true });
      const scope = this.sendBrevPanel ?? this.page;
      // Prøv først synlig tekst
      const candidateByText = scope.getByRole("option", { name: new RegExp(value, "i") });
      if (await candidateByText.count()) {
        await candidateByText.first().click();
        return;
      }
      // Ellers tastatur fallback
      await this.page.keyboard.press("ArrowDown");
      await this.page.keyboard.press("Enter");
    }
  }

  // Valgfritt: velg brevmal via synlig tekst (f.eks. "Innhenting av inntektsopplysninger for årsavregning")
  async selectBrevmalByLabel(label: string | RegExp) {
    const ctl = await this.waitForBrevmalSelect();
    const tag = await ctl.evaluate((el) => el.tagName.toLowerCase());
    if (tag === "select") {
      // Map label -> value via evaluate og bruk selectOption
      const value = await ctl.evaluate((el, l) => {
        const sel = el as HTMLSelectElement;
        const re = l instanceof RegExp ? l : new RegExp(String(l), "i");
        const opt = Array.from(sel.options).find((o) => re.test(o.text));
        return opt?.value ?? "";
      }, label as any);
      if (!value) throw new Error("Fant ikke brevmal med gitt label");
      await ctl.selectOption(value);
    } else {
      await ctl.click({ force: true });
      const scope = this.sendBrevPanel ?? this.page;
      await scope.getByRole("option", { name: label }).first().click();
    }
  }

  async assertSendButtonDisabled() {
    await expect(this.sendButton).toBeDisabled();
  }

  async assertSendButtonEnabled() {
    await expect(this.sendButton).toBeEnabled();
  }
}
