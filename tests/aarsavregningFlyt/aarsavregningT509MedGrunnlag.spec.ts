import { test, expect } from "@playwright/test";

import { OpprettForstegangsbehandling } from "./opprettForstegangsbehandling";
import { aapneBehandling, forkastAarsavregning, opprettAarsavregning } from "../testutils/utils";

const SKATTEPLIKTIG = "SKATTEPLIKTIG";
const IKKE_SKATTEPLIKTIG = "IKKE_SKATTEPLIKTIG";

test("@1 MELOSYS-6528 aarsavregning viser tidligere grunnlag ved valg av år", async ({ page }) => {
  const options = {
    fromDate: "18.01.2024",
    toDate: "19.01.2024",
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
