import { test, expect } from "@playwright/test";
/*
test("opprettforstegangsbehandling", async ({ page }) => {
  await page.goto("http://localhost:3000/melosys");
  await page.getByRole("button", { name: "Opprett ny sak/behandling" }).click();
  await page.getByRole("textbox", { name: "Brukers f.nr. eller d-nr.:" }).click();
  await page.getByRole("textbox", { name: "Brukers f.nr. eller d-nr.:" }).fill("21075114491");
  await page.getByRole("radio", { name: "Opprett ny sak" }).check();
  await page.getByLabel("Sakstype").selectOption("FTRL");
  await page.getByLabel("Sakstema").selectOption("MEDLEMSKAP_LOVVALG");
  await page.getByLabel("Behandlingstema").selectOption("YRKESAKTIV");
  await page.getByLabel("Behandlingstype").selectOption("FØRSTEGANG");
  await page.getByLabel("Årsak").selectOption("SØKNAD");
  await page.getByRole("checkbox", { name: "Legg behandlingen i mine" }).check();
  await page.getByRole("button", { name: "Opprett ny behandling" }).click();
});

 */

test("opprettvedtak", async ({ page }) => {
  await page.goto("http://localhost:3000/melosys");
  await page.getByRole("button", { name: "Opprett ny sak/behandling" }).click();
  await page.getByRole("textbox", { name: "Brukers f.nr. eller d-nr.:" }).click();
  await page.getByRole("textbox", { name: "Brukers f.nr. eller d-nr.:" }).fill("21075114491");
  await page.getByRole("radio", { name: "Opprett ny sak" }).check();
  await page.getByLabel("Sakstype").selectOption("FTRL");
  await page.getByLabel("Sakstema").selectOption("MEDLEMSKAP_LOVVALG");
  await page.getByLabel("Behandlingstema").selectOption("YRKESAKTIV");
  await page.getByLabel("Behandlingstype").selectOption("FØRSTEGANG");
  await page.getByLabel("Årsak").selectOption("SØKNAD");
  await page.getByRole("checkbox", { name: "Legg behandlingen i mine" }).check();
  await page.getByRole("button", { name: "Opprett ny behandling" }).click();
  await page
    .getByRole("link", {
      name: /^GYNGEHEST .*/, // Matches any text starting with "GYNGEHEST"
      exact: true,
    })
    .first()
    .click();

  await page.getByRole("textbox", { name: "Fra og med" }).click();
  await page.getByRole("textbox", { name: "Fra og med" }).fill("22.02.2025");
  await page.getByRole("textbox", { name: "Fra og med" }).click();
  await page.getByRole("textbox", { name: "Til og med" }).fill("25.02.2025");

  await page.getByText("Velg land fra liste").click();
  await page.locator(".css-19bb58m").click();
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
  //await page.pause();
  await expect(page.getByRole("heading", { name: "Medlemskapsperioder", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Bekreft og fortsett" }).click();
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { name: "Trygdeavgift", exact: true })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Nei" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Nei" })).toBeEnabled();
  await page.getByRole("radio", { name: "Nei" }).check();
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { name: "Oppgi informasjon om brukers inntekt" })).toBeVisible({
    timeout: 10000,
  });
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Inntektskilde").selectOption("ARBEIDSINNTEKT");
  await page.waitForLoadState("networkidle");
  //await page.getByRole("spinbutton", { name: "Brutto inntekt" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByRole("spinbutton", { name: "Brutto inntekt" }).fill("100000");
  await page.waitForLoadState("networkidle");
  await page.pause();
  await page.getByRole("button", { name: "Bekreft og fortsett" }).click();

  await page.pause();
  //await page.getByRole("radio", { name: "Nei" }).check();
  //await page.getByLabel("Inntektskilde").selectOption("ARBEIDSINNTEKT");
  //await page.getByRole("spinbutton", { name: "Brutto inntekt" }).click();
  //await page.getByRole("spinbutton", { name: "Brutto inntekt" }).fill("100000");

  //await page.getByRole("radio", { name: "Ja" }).first().check();
  //await page.getByLabel("Inntektskilde").selectOption("ARBEIDSINNTEKT");
  //await page.getByRole("spinbutton", { name: "Brutto inntekt" }).click();
  //await page.getByRole("spinbutton", { name: "Brutto inntekt" }).fill("100000");
  //await page.getByRole("button", { name: "Bekreft og fortsett" }).click();
  //await page.getByRole("button", { name: "Fatt vedtak" }).click();
  await page.pause(); // Keeps browser open for debugging
});
