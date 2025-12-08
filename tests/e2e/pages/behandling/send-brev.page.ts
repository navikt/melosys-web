import { Page, Locator, expect } from "@playwright/test";
import { BehandlingPage } from "./behandling.page";
import { PrepopulertSaksnummer } from "../../utils/testdataUtils";

export class SendBrevPage extends BehandlingPage {
  constructor(page: Page, saksnummer: PrepopulertSaksnummer) {
    super(page, saksnummer);
  }

  // Dersom SendBrev ligger på en dedikert sti etter at man er inne i en sak, sett path her.
  // Hvis den nås via navigasjon i UI, kan goto() evt. tilpasses for å klikke riktig meny først.
  readonly path = "/send-brev";

  readonly labels = {
    mottaker: /mottaker/i,
    brevmal: /brevmal|brevtype|type/i,
    sendBrev: /send brev/i,
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

  // Behold ARIA-combobox for brevmal, men ha fallback til native select[name="type"]
  private get brevmalCombobox(): Locator {
    const scope = this.sendBrevPanel ?? this.page;
    return scope.getByRole("combobox", { name: this.labels.brevmal });
  }

  private get brevmalNativeSelect(): Locator {
    const scope = this.sendBrevPanel ?? this.page;
    return scope.locator('select[name="type"]');
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
    await expect(sel, `${this.ctx}: Fant ikke mottaker-feltet`).toBeVisible();

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

  // Valgfritt: velg brevmal via synlig tekst (f.eks. "Innhenting av inntektsopplysninger for årsavregning")
  async selectBrevmalByLabel(label: string | RegExp) {
    const ctl = await this.waitForBrevmalSelect();
    const tag = await ctl.evaluate((el) => el.tagName.toLowerCase());
    if (tag === "select") {
      // Map label -> value via evaluate og bruk selectOption
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

  async selectMottakerByLabel(label: string | RegExp) {
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

    await this.waitForBrevmalSelect();
  }

  async clickSendBrev() {
    await this.sendButton.click();
  }
}
