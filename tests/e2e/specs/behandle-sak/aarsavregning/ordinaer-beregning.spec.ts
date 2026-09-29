import { test, expect } from "../../../recording/fixtures";
import { Page, Route } from "@playwright/test";
import { AarsavregningPage } from "../../../pages/behandling/aarsavregning.page";
import { BehandlingPage } from "../../../pages/behandling/behandling.page";
import { shouldUseMockServer } from "../../../config/mode";
import { hentPrepopulertSakUrl } from "../../../utils/testdataUtils";
import type { AarsavregningResponse } from "../../../../../src/services/modules/aarsavregning/aarsavregning";

async function mockOrdinaerAarsavregning(page: Page, år: number, workerId: string): Promise<void> {
  // Playback-matcherens generelle opptak blander saks- og behandlings-ID-er. Isoler denne
  // sakens beregningsdata; øvrige API-kall går fortsatt til playback-serveren.
  const tomtGrunnlag = {
    trygdeavgiftsgrunnlag: { avgiftspliktigperioder: [], skatteforholdsperioder: [], inntektskperioder: [] },
    avgift: { trygdeavgiftsperioder: [], totalInntekt: 0, totalAvgift: 0 },
  };
  let årsavregning: AarsavregningResponse = {
    aarsavregningID: 27,
    aar: år,
    tidligereTrygdeavgiftsGrunnlagsopplysninger: tomtGrunnlag,
    sisteGjeldendeAvgiftspliktigperioder: [],
    avregning: { innbetaltTrygdeavgift: undefined },
    harInnbetaltTrygdeavgift: false,
    endeligAvgiftValg: "OPPLYSNINGER_ENDRET",
  };
  let opprettet = false;

  const svar = (body: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  const hentFraMockserver = (route: Route) =>
    route.fetch({ headers: { ...route.request().headers(), "x-playwright-worker-id": workerId } });

  await page.route(/\/api\/fagsaker\/MEL-1027$/, async (route) => {
    const response = await hentFraMockserver(route);
    expect(response.ok(), "FTRL-saken skal finnes på mockserveren").toBe(true);
    await route.fulfill(svar({ ...(await response.json()), saksnummer: "MEL-1027" }));
  });

  await page.route(/\/api\/behandlinger\/27$/, async (route) => {
    const response = await hentFraMockserver(route);
    expect(response.ok(), "Årsavregningsbehandlingen skal finnes på mockserveren").toBe(true);
    await route.fulfill(svar({ ...(await response.json()), behandlingID: 27 }));
  });

  await page.route(/\/api\/fagsaker\/MEL-1027\/aarsavregninger(?:\?.*)?$/, async (route) => {
    await route.fulfill(svar([]));
  });

  await page.route(/\/api\/behandlinger\/27\/medlemskapsperioder$/, async (route) => {
    if (route.request().method() === "POST") {
      const periode = route.request().postDataJSON();
      expect(periode).toMatchObject({
        fomDato: `${år}-01-01`,
        tomDato: `${år}-12-31`,
        bestemmelse: "FTRL_KAP2_2_1",
      });
      await route.fulfill(svar({ ...periode, id: 27, medlemskapstype: "PLIKTIG" }));
    } else {
      await route.continue();
    }
  });

  await page.route(/\/api\/behandlinger\/27\/resultat$/, async (route) => {
    const response = await hentFraMockserver(route);
    expect(response.ok(), "Behandlingsresultat skal finnes på mockserveren").toBe(true);
    await route.fulfill(svar({ ...(await response.json()), aarsavregningID: opprettet ? 27 : null }));
  });

  await page.route(/\/api\/behandlinger\/27\/aarsavregninger(?:\/(?:27|grunnlagstype))?$/, async (route) => {
    const request = route.request();
    if (request.method() === "POST" && request.url().endsWith("/aarsavregninger")) {
      expect(request.postDataJSON()).toEqual({ aar: år });
      opprettet = true;
    } else if (request.method() === "POST" && request.url().endsWith("/grunnlagstype")) {
      const { harInnbetaltTrygdeavgift } = request.postDataJSON();
      årsavregning = { ...årsavregning, harInnbetaltTrygdeavgift };
    } else if (request.method() === "PUT") {
      årsavregning = {
        ...årsavregning,
        avregning: { ...årsavregning.avregning, ...request.postDataJSON().avregning },
      };
    } else if (request.method() !== "GET") {
      throw new Error(`Uventet årsavregningskall: ${request.method()} ${request.url()}`);
    }
    await route.fulfill(svar(årsavregning));
  });

  await page.route(/\/api\/behandlinger\/27\/trygdeavgift\/beregning$/, async (route) => {
    if (route.request().method() !== "PUT") {
      await route.continue();
      return;
    }
    const grunnlag = route.request().postDataJSON();
    expect(Number(grunnlag.inntektskilder[0].avgiftspliktigInntekt)).toBe(80000);
    expect(grunnlag.inntektskilder[0].erMaanedsbelop).toBe(true);
    årsavregning = {
      ...årsavregning,
      nyttTrygdeavgiftsGrunnlag: {
        trygdeavgiftsgrunnlag: {
          avgiftspliktigperioder: [
            {
              id: 27,
              type: "MEDLEMSKAPSPERIODE",
              fomDato: `${år}-01-01`,
              tomDato: `${år}-12-31`,
              medlemskapstype: "PLIKTIG",
              bestemmelse: "FTRL_KAP2_2_1",
              innvilgelsesResultat: "INNVILGET",
              trygdedekning: "FULL",
            },
          ],
          skatteforholdsperioder: grunnlag.skatteforholdsperioder,
          inntektskperioder: grunnlag.inntektskilder,
        },
        avgift: {
          trygdeavgiftsperioder: [
            {
              fom: `${år}-01-01`,
              tom: `${år}-12-31`,
              inntektskildetype: "ARBEIDSINNTEKT",
              arbeidsgiversavgiftBetales: false,
              inntektPerMd: 80000,
              avgiftssats: 8.2,
              avgiftPerMd: 6560,
              trygdedekning: "FULL",
              beregningsregel: "ORDINÆR",
            },
          ],
          totalInntekt: 960000,
          totalAvgift: 78720,
        },
      },
      avregning: { ...årsavregning.avregning, beregnetAvgiftBelop: 78720 },
    };
    await route.fulfill(svar({ beregningsforklaringer: [] }));
  });
}

test("Årsavregning FTRL: ordinær beregning uten begrensning", async ({ page, apiRecorder }, testInfo) => {
  test.skip(!shouldUseMockServer(), "Denne testen bruker årsavregningsdata fra playback-mockserveren");
  test.setTimeout(120000);

  const saksnummer = "MEL-1027";
  const aarsavregning = new AarsavregningPage(page, saksnummer);
  await mockOrdinaerAarsavregning(page, new Date().getFullYear() - 1, `worker-${testInfo.parallelIndex}`);

  await aarsavregning.overstyrFeatureToggles({
    "melosys.trygdeavgift.25-prosentregel": true,
  });

  await new BehandlingPage(page, saksnummer).goto(hentPrepopulertSakUrl(saksnummer));
  await aarsavregning.klikkÅrsavregningFane();
  await aarsavregning.verifiserAarsavregningside();

  const år = await aarsavregning.hentFørsteTilgjengeligeÅr();
  await page.getByRole("combobox", { name: "År" }).selectOption({ label: år });
  const nei = page
    .getByRole("group", { name: /Avviker innbetalt|Skal du legge til trygdeavgift/ })
    .getByRole("radio", { name: "Nei" });
  const innbetalt = page.getByRole("textbox", { name: /Innbetalt trygdeavgift/ });
  await expect(nei.or(innbetalt).first()).toBeVisible();
  if (await nei.isVisible()) {
    await nei.check();
  } else {
    await innbetalt.fill("0");
    await innbetalt.press("Tab");
  }

  await page.getByRole("combobox", { name: "Bestemmelse" }).selectOption("FTRL_KAP2_2_1");
  await aarsavregning.fyllUtMedlemskapsperiodeFomDato(0, `01.01.${år}`);
  await aarsavregning.fyllUtMedlemskapsperiodeTomDato(0, `31.12.${år}`);
  const periodeLagret = page.waitForResponse(
    (response) => response.url().endsWith("/medlemskapsperioder") && response.request().method() === "POST",
  );
  await aarsavregning.velgTrygdedekning(0, "Helse- og pensjonsdel (§ 2-9)");
  expect((await periodeLagret).ok(), "Medlemskapsperioden skal lagres før beregning").toBe(true);
  await aarsavregning.velgSkatteplikttype(0, "Nei");
  await aarsavregning.velgKildetype(0, "Arbeidsinntekt");
  await page.locator('select[name="inntektskilder[0].erMaanedsbelop"]').selectOption({ label: "Md." });

  const beregning = page.waitForResponse(
    (response) => response.url().includes("/trygdeavgift/beregning") && response.request().method() === "PUT",
  );
  await aarsavregning.fyllUtBruttoInntekt(0, "80000");
  await page.locator('input[name="inntektskilder[0].bruttoInntekt"]').press("Tab");
  expect((await beregning).ok(), "Beregningen skal lykkes").toBe(true);

  const detaljer = page.locator('[aria-label="trygdeavgiftdetaljer"]');
  await expect(detaljer).toBeVisible();
  const åpneDetaljer = detaljer.locator("button").first();
  if ((await åpneDetaljer.getAttribute("aria-expanded")) !== "true") {
    await åpneDetaljer.click();
  }

  await expect(page.getByRole("columnheader", { name: "Trygdeperiode" })).toBeVisible();
  const tabell = detaljer.locator("table.periode_tabell");
  const satsKolonne = await tabell
    .getByRole("columnheader", { name: "Sats" })
    .evaluate((header) => (header as HTMLTableCellElement).cellIndex);
  await expect(tabell.getByRole("row").nth(1).getByRole("cell").nth(satsKolonne)).toHaveText(/^\d+(?:[,.]\d+)?$/);
  await expect(detaljer.locator(".forklaringstekster")).toHaveCount(0);
});
