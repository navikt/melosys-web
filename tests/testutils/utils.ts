import { expect } from "@playwright/test";
import { Response } from "playwright-core";

const USER = "21075114491";

export async function home(page: any) {
  await page.goto("http://localhost:3000/melosys");
}

export async function bekreft(page: any) {
  await page.getByRole("button", { name: "Bekreft og fortsett" }).click();
}

export async function opprettForstegangsbehandling(page: any) {
  await page.getByRole("button", { name: "Opprett ny sak/behandling" }).click();
  await page.getByRole("textbox", { name: "Brukers f.nr. eller d-nr.:" }).click();
  await page.getByRole("textbox", { name: "Brukers f.nr. eller d-nr.:" }).fill(USER);
  await page.waitForLoadState("networkidle");

  const isIngenSaker = await page.getByText("Ingen eksisterende saker").isVisible({ timeout: 10000 });
  if (!isIngenSaker) {
    await page.getByRole("radio", { name: "Opprett ny sak" }).check();
  }

  await page.getByLabel("Sakstype").selectOption("FTRL");
  await page.getByLabel("Sakstema").selectOption("MEDLEMSKAP_LOVVALG");
  await page.getByLabel("Behandlingstema").selectOption("YRKESAKTIV");
  await page.getByLabel("Behandlingstype").selectOption("FØRSTEGANG");
  await page.getByLabel("Årsak").selectOption("SØKNAD");
  await page.getByRole("checkbox", { name: "Legg behandlingen i mine" }).check();
  await page.getByRole("button", { name: "Opprett ny behandling" }).click();
}

export async function aapneBehandling(page: any, melNumber: number) {
  await page.waitForLoadState("networkidle");
  await page
    .getByRole("link", {
      name: /^GYNGEHEST .*/, // Matches any text starting with "GYNGEHEST"
      exact: true,
    })
    .first()
    .click();
  await page.waitForLoadState("networkidle");
}

export async function fyllBehandling(page: any, options: any) {
  await page.getByRole("textbox", { name: "Fra og med" }).click();
  await page.getByRole("textbox", { name: "Fra og med" }).fill(options.fromDate);
  await page.getByRole("textbox", { name: "Fra og med" }).click();
  await page.getByRole("textbox", { name: "Til og med" }).fill(options.toDate);

  await page.getByText("Velg land fra liste").click();
  await page
    .locator("div")
    .filter({ hasText: /^Velg\.\.\.$/ })
    .nth(3)
    .click();
  await page.getByRole("option", { name: "Afghanistan" }).click();
  await page.getByLabel("Trygdedekning").selectOption("FULL_DEKNING_FTRL");
  await page.getByRole("button", { name: "Bekreft og fortsett" }).click();
  await page.getByRole("checkbox", { name: "Ståles Stål AS" }).check();
  await page.getByRole("button", { name: "Bekreft og fortsett" }).click();
  await page.getByLabel("Hvilken bestemmelse skal sø").selectOption("FTRL_KAP2_2_1");
  await page.getByLabel("Angi brukers situasjon").selectOption("MIDLERTIDIG_ARBEID_2_1_FJERDE_LEDD");
  await page.getByRole("radio", { name: "Ja" }).check();
  await page.getByRole("group", { name: "Er søkers arbeidsoppdrag i" }).getByLabel("Ja").check();
  await page.getByRole("group", { name: "Plikter arbeidsgiver å betale" }).getByLabel("Ja").check();
  await page.getByRole("group", { name: "Har søker lovlig opphold i" }).getByLabel("Ja").check();
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Bekreft og fortsett" }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForSelector('role=heading[name="Medlemskapsperioder"]', { state: "visible" });
  expect(page.getByRole("heading", { name: "Medlemskapsperioder", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Bekreft og fortsett" }).click();

  expect(page.getByRole("heading", { name: "Trygdeavgift", exact: true })).toBeVisible();
  await page.waitForTimeout(1000);
}

export async function fyllTrygdeavgiftsperioder(page: any, options: any) {
  await page.waitForLoadState("networkidle");

  await page.locator(`input[value="${options.skatteplikttype}"]`).click();
  await page.waitForLoadState("networkidle");

  if (options.skatteplikttype == "SKATTEPLIKTIG") return;

  await expect(page.getByRole("heading", { name: "Oppgi informasjon om brukers inntekt" })).toBeVisible({
    timeout: 10000,
  });
  await page.getByLabel("Inntektskilde").selectOption("ARBEIDSINNTEKT");
  await page.getByRole("spinbutton", { name: "Brutto inntekt" }).click();
  await page.getByRole("spinbutton", { name: "Brutto inntekt" }).fill("100000");

  await page.waitForSelector('role=heading[name="Foreløpig beregnet trygdeavgift"]', {
    state: "visible",
    timeout: 5000,
  });
}

export async function opprettAarsavregning(page: any, saksnummer: string) {
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "Opprett ny sak/behandling" }).click();
  await page.getByRole("textbox", { name: "Brukers f.nr. eller d-nr.:" }).click();
  await page.getByRole("textbox", { name: "Brukers f.nr. eller d-nr.:" }).fill(USER);

  await page.waitForLoadState("networkidle");

  await page.locator('[id^="saksnummer-MEL-"]').first().check();

  await page.locator('input[value="ÅRSAVREGNING"]').check();
  await page.getByLabel("Årsak").selectOption("SØKNAD");
  await page.getByRole("checkbox", { name: "Legg behandlingen i mine" }).check();
  await page.getByRole("button", { name: "Opprett ny behandling" }).click();

  await page.waitForLoadState("networkidle");
}

export async function forkastAarsavregning(page: any) {
  await page.getByRole("button", { name: "Behandlingsmeny" }).click();
  await page.getByRole("button", { name: "Avslutt behandling" }).click();
  await page.getByRole("button", { name: "Behandlingen er bortfalt" }).click();
  await page.getByRole("button", { name: "Bekreft", exact: true }).click();
}

export async function apiKallOK(page: any, url: string) {
  const response = await page.waitForResponse(
    (response: Response) => response.url().includes(url) && response.status() >= 200 && response.status() < 300,
    { timeout: 10000 },
  );

  expect(response.ok()).toBeTruthy();
}
