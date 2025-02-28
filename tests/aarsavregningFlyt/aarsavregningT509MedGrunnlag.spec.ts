import { test, expect } from "@playwright/test";

import { OpprettForstegangsbehandling } from "./opprettForstegangsbehandling";
import {
  aapneBehandling,
  bekreft,
  forkastAarsavregning,
  fyllBehandling,
  fyllTrygdeavgiftsperioder,
  home,
  opprettAarsavregning,
  opprettForstegangsbehandling,
} from "../testutils/utils";

const SKATTEPLIKTIG = "SKATTEPLIKTIG";
const IKKE_SKATTEPLIKTIG = "IKKE_SKATTEPLIKTIG";

test("@1 MELOSYS-6528 aarsavregning viser tidligere grunnlag ved valg av år", async ({ page }) => {
  const options = {
    fromDate: "01.03.2024",
    toDate: "02.03.2024",
    trygdeavgiftOptions: {
      skatteplikttype: IKKE_SKATTEPLIKTIG,
    },
  };

  await OpprettForstegangsbehandling(page, options);
  await opprettAarsavregning(page, "");
  await aapneBehandling(page, 0);

  await page.selectOption("#aarVelger", "2024");

  // Verify
  await expect(page.getByRole("heading", { name: "Inntekts- og skatteopplysninger" })).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "Vis mer" }).click();

  await page.pause();
  await expect(page.getByLabel("trygdeavgiftdetaljer")).toBeVisible({ timeout: 10000 });
  const matchingRows = await page
    .locator("tr", {
      has: page.locator("td", { hasText: "7 800 kr" }),
    })
    .filter({
      has: page.locator("td", { hasText: "100 000 kr" }),
    });

  await expect(matchingRows).toHaveCount(1);

  await forkastAarsavregning(page);
});

test("@2 MELOSYS-6528 aarsavregning viser feilmelding ved annen åpen årsavregning", async ({ page }) => {
  const options = {
    fromDate: "02.03.2024",
    toDate: "05.03.2024",
    trygdeavgiftOptions: {
      skatteplikttype: IKKE_SKATTEPLIKTIG,
    },
  };

  await OpprettForstegangsbehandling(page, options);
  await opprettAarsavregning(page, "");
  await aapneBehandling(page, 0);
  await page.selectOption("#aarVelger", "2024");

  await home(page);

  await opprettAarsavregning(page, "");

  await home(page);
  await page.waitForLoadState("networkidle");
  await page.locator(".behandlingOppgave__link").first().click();
  await page.selectOption("#aarVelger", "2024");

  await expect(page.getByText("Det finnes en annen åpen årsavregningsbehandling")).toBeVisible();
  await forkastAarsavregning(page);
});

test("@3 MELOSYS-6528 aarsavregning ved ingen tidligere fakturerte grunnlag viser infobokser", async ({ page }) => {
  const options = {
    fromDate: "16.03.2024",
    toDate: "17.03.2024",
    trygdeavgiftOptions: {
      skatteplikttype: SKATTEPLIKTIG,
    },
  };

  await OpprettForstegangsbehandling(page, options);
  await opprettAarsavregning(page, "");
  await aapneBehandling(page, 0);
  await page.selectOption("#aarVelger", "2024");

  await expect(page.getByText("Trygdeavgift er ikke forskuddsvis fakturert")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Trygdeavgift skal ikke betales til NAV")).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(3000); // sikker på at vi ikke har gjort et beregningskall i tillegg som har vært et gjentakende problem
  // await expect(page.getByText("Kan ikke beregne trygdeavgift")).not.toBeVisible({ timeout: 10000 }); TODO dette skal fungere

  await forkastAarsavregning(page);
});
