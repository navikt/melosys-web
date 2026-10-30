import { test, expect } from "../../../recording/fixtures";
import { TrygdeavtalePage } from "../../../pages/behandling/trygdeavtale.page";
import { mockTrygdeavtale, Resultat, TrygdeavtaleMock } from "../../../mocks/trygdeavtaleMock";

/**
 * E2E-tester for stegene Inngang, Virksomhet og Bestemmelse i trygdeavtale-behandling (Avtaleland).
 *
 * Testene verifiserer forhåndsutfylling og hva som sendes i POST /api/mottatteopplysninger/{id}
 * og PUT /trygdeavtale-flyt/{id} (resultat).
 *
 * All backend-kommunikasjon er mocket med page.route (se mocks/trygdeavtaleMock.ts).
 */

const VIRKSOMHET = { navn: "Ståles Stål AS", orgnr: "999999999" };

const VEDTAK = {
  INNVILGE: { tekst: "Jeg vil innvilge søknaden", kode: "JA_FATTE_VEDTAK" },
  UNNTAK: { tekst: "Jeg vil søke om unntak", kode: "NEI_ANMODE_OM_UNNTAK" },
  AVSLAG: { tekst: "Jeg vil avslå søknaden", kode: "NEI_AVSLAG" },
};

const BESTEMMELSE = {
  ART6_2: { tekst: "Selvstendig næringsdrivende - artikkel 6 nr. 2", kode: "CAN_ART6_2" },
  ART10: { tekst: "Offentlig tjenesteperson - artikkel 10", kode: "CAN_ART10" },
};

const TILLEGGSBESTEMMELSE_ART8 = "CAN_ART8";

const LAGRET_VURDERING = {
  virksomhet: VIRKSOMHET.orgnr,
  vedtak: VEDTAK.INNVILGE.kode,
  bestemmelse: BESTEMMELSE.ART6_2.kode,
  tilleggsbestemmelse: TILLEGGSBESTEMMELSE_ART8,
};

const INGEN_VURDERING = { vedtak: null, bestemmelse: null, tilleggsbestemmelse: null };

/** Vurderingen i siste lagring av flyten. Manglende felt og null betyr det samme for backend. */
const sisteVurdering = (mock: TrygdeavtaleMock) => {
  const resultat: Resultat | undefined = mock.flytLagringer.at(-1);
  return {
    vedtak: resultat?.vedtak ?? null,
    bestemmelse: resultat?.bestemmelse ?? null,
    tilleggsbestemmelse: resultat?.tilleggsbestemmelse ?? null,
  };
};

test.describe("Trygdeavtale - Inngang, Virksomhet og Bestemmelse", () => {
  let mock: TrygdeavtaleMock;
  let trygdeavtale: TrygdeavtalePage;

  test.afterEach(() => {
    expect(mock.ikkeMockedeKall, "Kall uten mock").toEqual([]);
  });

  test.beforeEach(({ page }) => {
    trygdeavtale = new TrygdeavtalePage(page);
  });

  test.describe("Inngang", () => {
    test("lagrer periode og arbeidsland og henter registeropplysninger ved bekreft", async ({ page }) => {
      mock = await mockTrygdeavtale(page);
      await trygdeavtale.goto(mock.url);
      await trygdeavtale.verifiserKanIkkeFortsette();

      await trygdeavtale.fyllPeriode("01.01.2026", "31.12.2026");
      await trygdeavtale.velgArbeidsland("Canada");

      await expect
        .poll(() => {
          const data = mock.mottatteOpplysningerLagringer.at(-1)?.data;
          return { periode: data?.periode, soeknadsland: data?.soeknadsland };
        })
        .toEqual({
          periode: { fom: "2026-01-01", tom: "2026-12-31" },
          soeknadsland: { landkoder: ["CA"], flereLandUkjentHvilke: false },
        });

      await trygdeavtale.bekreftInngang();
      await trygdeavtale.verifiserVirksomhetIkkeValgt(VIRKSOMHET.navn);
      expect(mock.antallOppfriskninger()).toBe(1);
    });

    test("land uten støtte viser melding og knapp for å innhente registeropplysninger", async ({ page }) => {
      mock = await mockTrygdeavtale(page);
      await trygdeavtale.goto(mock.url);

      await trygdeavtale.fyllPeriode("01.01.2026", "31.12.2026");
      await trygdeavtale.velgArbeidsland("Frankrike");

      await trygdeavtale.verifiserLandUtenStøtte();
      await expect.poll(() => mock.mottatteOpplysningerLagringer.at(-1)?.data.soeknadsland.landkoder).toEqual(["FR"]);
    });

    test("viser lagrede opplysninger og går videre uten å hente registeropplysninger på nytt", async ({ page }) => {
      mock = await mockTrygdeavtale(page, { utfylt: true });
      await trygdeavtale.goto(mock.url);

      await trygdeavtale.verifiserInngang({ fom: "01.01.2026", tom: "31.12.2026", land: "Canada" });
      await trygdeavtale.bekreftInngang();

      expect(mock.antallOppfriskninger()).toBe(0);
    });
  });

  test.describe("Virksomhet", () => {
    test("lagrer valgt virksomhet i flyten", async ({ page }) => {
      mock = await mockTrygdeavtale(page, { utfylt: true });
      await trygdeavtale.goto(mock.url);
      await trygdeavtale.bekreftInngang();
      await trygdeavtale.verifiserKanIkkeFortsette();

      await trygdeavtale.velgVirksomhet(VIRKSOMHET.navn);

      await expect.poll(() => mock.flytLagringer.at(-1)?.virksomhet).toBe(VIRKSOMHET.orgnr);
      await trygdeavtale.bekreftVirksomhet();
    });

    test("viser lagret virksomhet", async ({ page }) => {
      mock = await mockTrygdeavtale(page, { utfylt: true, resultat: { virksomhet: VIRKSOMHET.orgnr } });
      await trygdeavtale.goto(mock.url);
      await trygdeavtale.bekreftInngang();

      await trygdeavtale.verifiserValgtVirksomhet(VIRKSOMHET.navn);
      await trygdeavtale.verifiserKanFortsette();
    });
  });

  test.describe("Bestemmelse", () => {
    test("lagrer vedtak, bestemmelse og tilleggsbestemmelse", async ({ page }) => {
      mock = await mockTrygdeavtale(page, { utfylt: true, resultat: { virksomhet: VIRKSOMHET.orgnr } });
      await trygdeavtale.goto(mock.url);
      await trygdeavtale.bekreftInngang();
      await trygdeavtale.bekreftVirksomhet();
      await trygdeavtale.verifiserKanIkkeFortsette();

      await trygdeavtale.velgVedtak(VEDTAK.INNVILGE.tekst);
      await expect.poll(() => sisteVurdering(mock)).toEqual({ ...INGEN_VURDERING, vedtak: VEDTAK.INNVILGE.kode });

      await trygdeavtale.velgBestemmelse(BESTEMMELSE.ART6_2.tekst);
      await expect
        .poll(() => sisteVurdering(mock))
        .toEqual({ ...INGEN_VURDERING, vedtak: VEDTAK.INNVILGE.kode, bestemmelse: BESTEMMELSE.ART6_2.kode });

      await trygdeavtale.velgTilleggsbestemmelse();
      await expect
        .poll(() => sisteVurdering(mock))
        .toEqual({
          vedtak: VEDTAK.INNVILGE.kode,
          bestemmelse: BESTEMMELSE.ART6_2.kode,
          tilleggsbestemmelse: TILLEGGSBESTEMMELSE_ART8,
        });
      await trygdeavtale.verifiserKanFortsette();
    });

    test("viser lagret vurdering", async ({ page }) => {
      mock = await mockTrygdeavtale(page, { utfylt: true, resultat: LAGRET_VURDERING });
      await trygdeavtale.goto(mock.url);
      await trygdeavtale.bekreftInngang();
      await trygdeavtale.bekreftVirksomhet();

      await trygdeavtale.verifiserBestemmelse({
        vedtak: VEDTAK.INNVILGE.tekst,
        bestemmelse: BESTEMMELSE.ART6_2.tekst,
        tilleggsbestemmelse: true,
      });
      await trygdeavtale.verifiserKanFortsette();
      await expect
        .poll(() => sisteVurdering(mock))
        .toEqual({
          vedtak: VEDTAK.INNVILGE.kode,
          bestemmelse: BESTEMMELSE.ART6_2.kode,
          tilleggsbestemmelse: TILLEGGSBESTEMMELSE_ART8,
        });
    });

    test("bytte av bestemmelse tømmer tilleggsbestemmelse", async ({ page }) => {
      mock = await mockTrygdeavtale(page, { utfylt: true, resultat: LAGRET_VURDERING });
      await trygdeavtale.goto(mock.url);
      await trygdeavtale.bekreftInngang();
      await trygdeavtale.bekreftVirksomhet();

      await trygdeavtale.velgBestemmelse(BESTEMMELSE.ART10.tekst);
      await expect
        .poll(() => sisteVurdering(mock))
        .toEqual({ ...INGEN_VURDERING, vedtak: VEDTAK.INNVILGE.kode, bestemmelse: BESTEMMELSE.ART10.kode });
      await trygdeavtale.verifiserBestemmelse({ vedtak: VEDTAK.INNVILGE.tekst, bestemmelse: BESTEMMELSE.ART10.tekst });

      await trygdeavtale.velgBestemmelse(BESTEMMELSE.ART6_2.tekst);
      await trygdeavtale.verifiserBestemmelse({
        vedtak: VEDTAK.INNVILGE.tekst,
        bestemmelse: BESTEMMELSE.ART6_2.tekst,
        tilleggsbestemmelse: false,
      });
    });

    test("unntak og avslag sender ikke vedtak og tømmer bestemmelse", async ({ page }) => {
      mock = await mockTrygdeavtale(page, { utfylt: true, resultat: LAGRET_VURDERING });
      await trygdeavtale.goto(mock.url);
      await trygdeavtale.bekreftInngang();
      await trygdeavtale.bekreftVirksomhet();

      await trygdeavtale.velgVedtak(VEDTAK.UNNTAK.tekst);
      await expect.poll(() => sisteVurdering(mock)).toEqual(INGEN_VURDERING);
      await trygdeavtale.verifiserBestemmelse({ vedtak: VEDTAK.UNNTAK.tekst });
      await trygdeavtale.verifiserIngenFlytMelding(false);
      await trygdeavtale.verifiserKanIkkeFortsette();

      await trygdeavtale.velgVedtak(VEDTAK.AVSLAG.tekst);
      await trygdeavtale.verifiserIngenFlytMelding(true);
      await expect.poll(() => sisteVurdering(mock)).toEqual(INGEN_VURDERING);
      await trygdeavtale.verifiserKanIkkeFortsette();
    });
  });
});
