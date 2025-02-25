import { test, expect } from "@playwright/test";
import {
  aapneBehandling,
  bekreft,
  fyllBehandling,
  fyllTrygdeavgiftsperioder,
  opprettAarsavregning,
  opprettForstegangsbehandling,
} from "./testutils/utils";

const fromDate = "01.03.2024";
const toDate = "15.03.2024";

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
test("MELOSYS-6528 aarsavregning viser tidligere grunnlag ved valg av år", async ({ page }) => {
  await page.goto("http://localhost:3000/melosys");
  await page.getByRole("button", { name: "Opprett ny sak/behandling" }).click();
  await page.getByRole("textbox", { name: "Brukers f.nr. eller d-nr.:" }).click();
  await page.getByRole("textbox", { name: "Brukers f.nr. eller d-nr.:" }).fill("21075114491");
  await page.locator(`#saksnummer-MEL-${saksnummer}`).check();
  await page.locator('input[value="ÅRSAVREGNING"]').check();
  await page.getByLabel("Årsak").selectOption("SØKNAD");
  await page.getByRole("checkbox", { name: "Legg behandlingen i mine" }).check();
  await page.getByRole("button", { name: "Opprett ny behandling" }).click();

  await page.getByRole("link", { name: "GYNGEHEST BRÅKETE -" }).first().click();
  await page.getByLabel("", { exact: true }).selectOption(aar);
  await expect(page.getByRole("heading", { name: "Inntekts- og skatteopplysninger" })).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "Vis mer" }).click();
  await expect(page.getByLabel("trygdeavgiftdetaljer")).toBeVisible({ timeout: 10000 });
  const matchingRows = await page
    .locator("tr", {
      has: page.locator("td", { hasText: "7 800 kr" }),
    })
    .filter({
      has: page.locator("td", { hasText: "100 000 kr" }),
    });

  await expect(matchingRows).toHaveCount(1);
});

test("MELOSYS-6528 aarsavregning viser feilmelding ved annen åpen årsavregning", async ({ page }) => {
  await page.goto("http://localhost:3000/melosys");
  await opprettAarsavregning(page, saksnummer);

  await aapneBehandling(page, 3);

  await page.getByLabel("", { exact: true }).selectOption(aar);
  await expect(page.getByText("Det finnes en annen åpen å")).toBeVisible();
});

test.only("MELOSYS-6528 aarsavregning ved ingen tidligere fakturert behandling viser infobokser", async ({ page }) => {
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
