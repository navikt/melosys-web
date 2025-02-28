import { test, expect } from "@playwright/test";
import {
  aapneBehandling,
  bekreft,
  fyllBehandling,
  fyllTrygdeavgiftsperioder,
  opprettAarsavregning,
  opprettForstegangsbehandling,
} from "./testutils/utils";

const aar = "2024";

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
