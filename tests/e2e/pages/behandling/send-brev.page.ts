import { Page, Locator, expect } from "@playwright/test";
import { BehandlingPage } from "./behandling.page";
import { PrepopulertSaksnummer } from "../../utils/testdataUtils";
import { finnCombobox } from "../../utils/testUtils";

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

  async klikkSendBrevFane(): Promise<void> {
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
  private async velgFørsteAlternativ(select: Locator): Promise<void> {
    await select.click();
    await this.page.keyboard.press("ArrowDown");
    await this.page.keyboard.press("Enter");
  }

  private async waitForBrevmalSelect(timeoutMs: number = 5000): Promise<Locator> {
    const scope = this.sendBrevPanel ?? this.page;
    return await finnCombobox(this.labels.brevmal, scope, timeoutMs);
  }

  async velgFørsteMottaker(): Promise<void> {
    // Bruk native select[name="mottaker"] direkte
    const sel = this.mottakerNativeSelect;
    await expect(sel, `${this.ctx}: Fant ikke mottaker-feltet`).toBeVisible();

    // Velg første reelle alternativ (index 1, siden index 0 er "Velg...")
    await sel.selectOption({ index: 1 });

    // Når mottaker er valgt trigges logikk som laster brevmalene og viser select
    await this.waitForBrevmalSelect();
  }

  async velgFørsteBrevmal(): Promise<void> {
    const ctl = await this.waitForBrevmalSelect();
    // Native select bruker selectOption, ARIA combobox bruker tastaturnavigasjon
    const tag = await ctl.evaluate((el) => el.tagName.toLowerCase());
    if (tag === "select") {
      await ctl.selectOption({ index: 1 });
    } else {
      await this.velgFørsteAlternativ(ctl);
    }
  }

  // Velg brevmal via synlig tekst (f.eks. "Innhenting av inntektsopplysninger for årsavregning")
  async velgBrevmalVedLabel(label: string | RegExp): Promise<void> {
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

  async verifiserSendKnappDeaktivert(): Promise<void> {
    await expect(this.sendButton, `${this.ctx}: Send-knappen er uventet aktiv`).toBeDisabled();
  }

  async verifiserSendKnappAktivert(): Promise<void> {
    await expect(this.sendButton, `${this.ctx}: Send-knappen er uventet deaktivert`).toBeEnabled();
  }

  async velgMottakerVedLabel(label: string | RegExp): Promise<void> {
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

  async klikkSendBrev(): Promise<void> {
    await this.sendButton.click();
  }
}
