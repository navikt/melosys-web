import { test, expect } from "@playwright/test";
import {
  aapneBehandling,
  bekreft,
  fyllBehandling,
  fyllTrygdeavgiftsperioder,
  opprettAarsavregning,
  opprettForstegangsbehandling,
} from "./testutils/utils";

const behandlingOptions = {
  fromDate: "01.01.2024",
  toDate: "15.01.2024",
};

const trygdeavgiftOptions = {
  skatteplikttype: "IKKE_SKATTEPLIKTIG",
};

test("opprettvedtak", async ({ page }) => {
  await page.goto("http://localhost:3000/melosys");

  await opprettForstegangsbehandling(page);
  await aapneBehandling(page, 1);
  await fyllBehandling(page, behandlingOptions);

  await page.pause();

  await fyllTrygdeavgiftsperioder(page, trygdeavgiftOptions);

  await bekreft(page);

  await page.getByRole("button", { name: "Fatt vedtak" }).click();

  await page.pause(); // Keeps browser open for debugging
});
// 21075114491
const saksnummer = "1";
const aar = "2024";

test("MELOSYS-6528 aarsavregning viser feilmelding ved annen åpen årsavregning", async ({ page }) => {
  await page.goto("http://localhost:3000/melosys");
  await opprettAarsavregning(page, saksnummer);

  await aapneBehandling(page, 3);

  await page.getByLabel("", { exact: true }).selectOption(aar);
  await expect(page.getByText("Det finnes en annen åpen å")).toBeVisible();
});

test("MELOSYS-6528 aarsavregning ved ingen tidligere fakturerte grunnlag viser infobokser", async ({ page }) => {
  await page.goto("http://localhost:3000/melosys");

  await opprettForstegangsbehandling(page);
  await aapneBehandling(page, 1);

  const behandlingOptions2 = {
    fromDate: "01.08.2024",
    toDate: "05.08.2024",
  };

  const trygdeavgiftOptions2 = {
    skatteplikttype: "SKATTEPLIKTIG",
  };

  await fyllBehandling(page, behandlingOptions2);
  await fyllTrygdeavgiftsperioder(page, trygdeavgiftOptions2);
  await bekreft(page);

  await page.getByRole("button", { name: "Fatt vedtak" }).click();

  await opprettAarsavregning(page, "");
  await aapneBehandling(page, 3);
  await page.getByLabel("", { exact: true }).selectOption(aar);
  await expect(page.getByText("Trygdeavgift er ikke forskuddsvis fakturert")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Trygdeavgift skal ikke betales til NAV")).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(3000); // sikker på at vi ikke har gjort et beregningskall i tillegg som har vært et gjentakende problem
  await expect(page.getByText("Kan ikke beregne trygdeavgift")).not.toBeVisible({ timeout: 10000 });
  await page.pause();
});

test("MELOSYS-6529 aarsavregning ved tidligere fakturert grunnlag viser ikke feilmelding", async ({ page }) => {
  await page.goto("http://localhost:3000/melosys");

  await opprettForstegangsbehandling(page);
  await aapneBehandling(page, 1);

  const behandlingOptions2 = {
    fromDate: "01.02.2024",
    toDate: "02.02.2024",
  };

  const trygdeavgiftOptions2 = {
    skatteplikttype: "IKKE_SKATTEPLIKTIG",
  };

  await fyllBehandling(page, behandlingOptions2);
  await fyllTrygdeavgiftsperioder(page, trygdeavgiftOptions2);
  await bekreft(page);
  await page.getByRole("button", { name: "Fatt vedtak" }).click();

  await opprettAarsavregning(page, "");
  await aapneBehandling(page, 3);
  await page.getByLabel("", { exact: true }).selectOption(aar);
  await page.waitForLoadState("networkidle");
  await page.locator('input.navds-radio__input[value="true"]').check();
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "Legg til inntekt" }).click();

  await page.waitForTimeout(3000); // sikker på at vi ikke har gjort et beregningskall i tillegg som har vært et gjentakende problem
  await expect(page.getByText("JSON parse error:")).not.toBeVisible({ timeout: 10000 });
});
