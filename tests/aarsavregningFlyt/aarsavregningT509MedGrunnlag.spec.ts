import { Page, test, expect, chromium } from "@playwright/test";

test.describe.configure({ mode: "serial" });

import { OpprettForstegangsbehandling } from "./opprettForstegangsbehandling";
import {
  aapneBehandling,
  apiKallOK,
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

  //await OpprettForstegangsbehandling(page, options);
  await home(page);
  await opprettAarsavregning(page, "");
  await aapneBehandling(page, 0);

  await page.selectOption("#aarVelger", "2024");
  await page.waitForLoadState("networkidle");
  await page.getByRole("radio", { name: "Nei" }).check();
  await page.waitForLoadState("networkidle");
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
    fromDate: "03.03.2024",
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

function logNetwork(page: any) {
  page.on("request", (request: any) => {
    if (request.url().includes("beregning")) {
      const postData = request.postDataJSON(); // Get JSON payload (if applicable)
      console.log(`Beregning request URL: ${request.url()}`);
      console.log(`Payload: ${JSON.stringify(postData, null, 2)}`);
    }
  });
}

test("@3 MELOSYS-6528 aarsavregning ved ingen tidligere fakturerte grunnlag viser infobokser", async ({ page }) => {
  const options = {
    fromDate: "06.03.2024",
    toDate: "07.03.2024",
    trygdeavgiftOptions: {
      skatteplikttype: SKATTEPLIKTIG,
    },
  };

  logNetwork(page);

  await OpprettForstegangsbehandling(page, options);

  await opprettAarsavregning(page, "");
  //await aapneBehandling(page, 0);
  await page.locator(".behandlingOppgave__link").first().click();
  await page.selectOption("#aarVelger", "2024");

  await expect(page.getByText("Trygdeavgift er ikke forskuddsvis fakturert")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Trygdeavgift skal ikke betales til NAV")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Tidligere beregnet trygdeavgift").locator("xpath=following-sibling::td")).toHaveText(
    "0,00 kr",
  );

  await apiKallOK(page, "beregning");

  await forkastAarsavregning(page);
});

test.describe("@4 MELOSYS-6529 aarsavregning med grunnlag, når jeg velger avvik", () => {
  test("prep", async ({ page }) => {
    const options = {
      fromDate: "08.05.2024",
      toDate: "09.05.2024",
      trygdeavgiftOptions: {
        skatteplikttype: IKKE_SKATTEPLIKTIG,
      },
    };

    await OpprettForstegangsbehandling(page, options);
  });

  test("skal jeg kunne legge til skatteforholdsperioder uten feilmelding", async ({ page }) => {
    await home(page);
    await opprettAarsavregning(page, "");
    await page.locator(".behandlingOppgave__link").first().click();
    await page.selectOption("#aarVelger", "2024");
    await page.pause();

    await page.getByRole("radio", { name: "Ja" }).check();
    await page.getByRole("button", { name: "Legg til skatteforhold" }).click();

    await apiKallOK(page, "beregning");
    await forkastAarsavregning(page);
  });

  test("skal jeg kunne legge til inntektskilder uten feilmelding", async ({ page }) => {
    await home(page);
    await opprettAarsavregning(page, "");
    await page.locator(".behandlingOppgave__link").first().click();
    await page.selectOption("#aarVelger", "2024");
    await page.pause();

    await page.getByRole("radio", { name: "Ja" }).check();
    await page.getByRole("button", { name: "Legg til inntekt" }).click();

    await apiKallOK(page, "beregning");
    await forkastAarsavregning(page);
  });
});
