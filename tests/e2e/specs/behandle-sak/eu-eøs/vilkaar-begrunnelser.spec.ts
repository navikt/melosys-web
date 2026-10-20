import { test, expect } from "../../../recording/fixtures";
import { EosVilkaarPage } from "../../../pages/behandling/eos-vilkaar.page";
import { EosBehandlingMock, mockEosUtsendtArbeidstaker, Vilkaar } from "../../../mocks/eosBehandlingMock";

/**
 * E2E-tester for begrunnelser på vilkår i EU/EØS (Utsendt arbeidstaker).
 *
 * Begrunnelsene var tidligere en egenutviklet multiselect-dropdown som ikke lot seg bruke,
 * og er byttet ut med checkboxer. Testene verifiserer at nøyaktig de avkryssede
 * begrunnelsene sendes i POST /api/vilkaar.
 *
 * All backend-kommunikasjon er mocket med page.route (se mocks/eosBehandlingMock.ts).
 */

const STEG = {
  FORUTGAAENDE_MEDLEMSKAP: { navn: "Forutg. medl.", tittel: "Forutgående medlemskap" },
  VESENTLIG_VIRKSOMHET: { navn: "Vesentlig virksomhet", tittel: "Vesentlig virksomhet" },
  VURDERING_ARBEIDSTAKER: { navn: "Vurdering arbeidstaker", tittel: "Vurdering arbeidstaker" },
};

const LEGEND = {
  BEGRUNNELSE: "Legg til begrunnelse",
  UTSENDING_IKKE_OPPFYLT: "Legg til begrunnelse for at utsendingsbestemmelse ikke er oppfylt",
  UNNTAK_IKKE_OPPFYLT: "Legg til begrunnelse for at unntaksbestemmelse ikke er oppfylt",
};

const SVAR = {
  NEI: "Nei",
  INNVILGE: "Ja, jeg vil innvilge søknaden",
  ANMODNING_UNNTAK: "Nei, jeg vil vurdere anmodning om unntak",
  AVSLAG: "Nei, jeg vil avslå søknaden etter artikkel 12.1 og 16.1 (kun EØS-forordningen)",
};

const FRITEKST_AVSLAG = "Begrunnelse for avslag (fritekst)";

function forventetVilkaar(
  vilkaar: string,
  oppfylt: boolean,
  begrunnelseKoder: string[] = [],
  fritekst: string | null = null,
) {
  return {
    vilkaar,
    oppfylt,
    begrunnelseKoder: [...begrunnelseKoder].sort(),
    begrunnelseFritekst: fritekst,
    begrunnelseFritekstEngelsk: null,
  };
}

function hentVilkaar(payload: Vilkaar[], vilkaar: string) {
  const funnet = payload.find((v) => v.vilkaar === vilkaar);
  expect(funnet, `Fant ikke ${vilkaar} i POST /api/vilkaar`).toBeDefined();
  return { ...funnet!, begrunnelseKoder: [...funnet!.begrunnelseKoder].sort() };
}

test.describe("EU/EØS Utsendt arbeidstaker - begrunnelser for vilkår", () => {
  let mock: EosBehandlingMock;
  let vilkaarPage: EosVilkaarPage;

  test.beforeEach(async ({ page }) => {
    mock = await mockEosUtsendtArbeidstaker(page);
    vilkaarPage = new EosVilkaarPage(page);
    await vilkaarPage.goto(mock.url);
  });

  test.afterEach(() => {
    expect(mock.ikkeMockedeKall, "Alle API-kall skal være mocket").toEqual([]);
  });

  test("Forutgående medlemskap - sender kun avkryssede begrunnelser", async () => {
    await vilkaarPage.gåTilSteg(STEG.FORUTGAAENDE_MEDLEMSKAP.navn, STEG.FORUTGAAENDE_MEDLEMSKAP.tittel);
    await vilkaarPage.velgSvar(SVAR.NEI);
    await vilkaarPage.kryssAvBegrunnelser(LEGEND.BEGRUNNELSE, [
      "Registrert med unntak i MEDL rett før utsendingen",
      "Bosatt i Norge, men arbeidet i utlandet før utsendingen",
      "Verken bosatt eller arbeidet i Norge før utsendingen",
    ]);
    await vilkaarPage.fjernBegrunnelser(LEGEND.BEGRUNNELSE, [
      "Bosatt i Norge, men arbeidet i utlandet før utsendingen",
    ]);
    await vilkaarPage.verifiserAvkryssedeBegrunnelser(LEGEND.BEGRUNNELSE, [
      "Registrert med unntak i MEDL rett før utsendingen",
      "Verken bosatt eller arbeidet i Norge før utsendingen",
    ]);

    const payload = await vilkaarPage.bekreftOgHentLagredeVilkaar();

    expect(hentVilkaar(payload, "FORUTGAAENDE_MEDLEMSKAP")).toEqual(
      forventetVilkaar("FORUTGAAENDE_MEDLEMSKAP", false, [
        "UNNTATT_MEDLEMSKAP",
        "IKKE_FOLKEREGISTRERT_ELLER_ARBEIDET_I_NORGE",
      ]),
    );
  });

  test("Vesentlig virksomhet - sender kun avkryssede begrunnelser", async () => {
    await vilkaarPage.gåTilSteg(STEG.VESENTLIG_VIRKSOMHET.navn, STEG.VESENTLIG_VIRKSOMHET.tittel);
    await vilkaarPage.velgSvar(SVAR.NEI);
    await vilkaarPage.kryssAvBegrunnelser(LEGEND.BEGRUNNELSE, [
      "Kun administrativt ansatte i Norge",
      "Ansatte rekrutteres hovedsakelig i utlandet",
    ]);
    await vilkaarPage.verifiserAvkryssedeBegrunnelser(LEGEND.BEGRUNNELSE, [
      "Kun administrativt ansatte i Norge",
      "Ansatte rekrutteres hovedsakelig i utlandet",
    ]);

    const payload = await vilkaarPage.bekreftOgHentLagredeVilkaar();

    expect(hentVilkaar(payload, "VESENTLIG_VIRKSOMHET")).toEqual(
      forventetVilkaar("VESENTLIG_VIRKSOMHET", false, ["KUN_ADMIN_ANSATTE", "REKRUTTERER_ANSATTE_UTL"]),
    );
  });

  test("Art. 12.1 anmodning om unntak - sender kun avkryssede begrunnelser for utsendingsbestemmelse", async () => {
    await vilkaarPage.gåTilSteg(STEG.VURDERING_ARBEIDSTAKER.navn, STEG.VURDERING_ARBEIDSTAKER.tittel);
    await vilkaarPage.velgSvar(SVAR.ANMODNING_UNNTAK);
    await vilkaarPage.verifiserBegrunnelsesgruppeSkjult(LEGEND.UNNTAK_IKKE_OPPFYLT);
    await vilkaarPage.kryssAvBegrunnelser(LEGEND.UTSENDING_IKKE_OPPFYLT, [
      "Utsendingen er ment å vare mer enn 24 md.",
      "Foretaket har ikke vesentlig virksomhet i Norge",
    ]);
    await vilkaarPage.verifiserAvkryssedeBegrunnelser(LEGEND.UTSENDING_IKKE_OPPFYLT, [
      "Utsendingen er ment å vare mer enn 24 md.",
      "Foretaket har ikke vesentlig virksomhet i Norge",
    ]);

    const payload = await vilkaarPage.bekreftOgHentLagredeVilkaar();

    expect(hentVilkaar(payload, "FO_883_2004_ART12_1")).toEqual(
      forventetVilkaar("FO_883_2004_ART12_1", false, ["UTSENDELSE_OVER_24_MN", "IKKE_VESENTLIG_VIRKSOMHET"]),
    );
  });

  test("Art. 12.1 avslag - sender kun avkryssede begrunnelser for utsendings- og unntaksbestemmelse", async () => {
    await vilkaarPage.gåTilSteg(STEG.VURDERING_ARBEIDSTAKER.navn, STEG.VURDERING_ARBEIDSTAKER.tittel);
    await vilkaarPage.velgSvar(SVAR.AVSLAG);
    await vilkaarPage.kryssAvBegrunnelser(LEGEND.UTSENDING_IKKE_OPPFYLT, ["Utsendingen er ment å vare mer enn 24 md."]);
    await vilkaarPage.kryssAvBegrunnelser(LEGEND.UNNTAK_IKKE_OPPFYLT, [
      "Ingen spesielle forhold som gjør det rimelig å søke",
      "Særlig avslagsgrunn",
    ]);
    await vilkaarPage.verifiserFeltSynlig(FRITEKST_AVSLAG);
    await vilkaarPage.fyllUtFritekst(FRITEKST_AVSLAG, "Særlige grunner");

    const payload = await vilkaarPage.bekreftOgHentLagredeVilkaar();

    expect(hentVilkaar(payload, "FO_883_2004_ART12_1")).toEqual(
      forventetVilkaar("FO_883_2004_ART12_1", false, ["UTSENDELSE_OVER_24_MN"]),
    );
    expect(hentVilkaar(payload, "FO_883_2004_ART16_1")).toEqual(
      forventetVilkaar(
        "FO_883_2004_ART16_1",
        false,
        ["INGEN_SPESIELLE_FORHOLD", "SAERLIG_AVSLAGSGRUNN"],
        "Særlige grunner",
      ),
    );
  });

  test("Art. 12.1 - bytte av valg nullstiller avkryssede begrunnelser", async () => {
    await vilkaarPage.gåTilSteg(STEG.VURDERING_ARBEIDSTAKER.navn, STEG.VURDERING_ARBEIDSTAKER.tittel);
    await vilkaarPage.velgSvar(SVAR.AVSLAG);
    await vilkaarPage.kryssAvBegrunnelser(LEGEND.UTSENDING_IKKE_OPPFYLT, ["Utsendingen er ment å vare mer enn 24 md."]);
    await vilkaarPage.kryssAvBegrunnelser(LEGEND.UNNTAK_IKKE_OPPFYLT, ["Særlig avslagsgrunn"]);

    await vilkaarPage.velgSvar(SVAR.ANMODNING_UNNTAK);
    await vilkaarPage.verifiserAvkryssedeBegrunnelser(LEGEND.UTSENDING_IKKE_OPPFYLT, []);
    await vilkaarPage.kryssAvBegrunnelser(LEGEND.UTSENDING_IKKE_OPPFYLT, [
      "Foretaket har ikke vesentlig virksomhet i Norge",
    ]);

    const payload = await vilkaarPage.bekreftOgHentLagredeVilkaar();

    expect(hentVilkaar(payload, "FO_883_2004_ART12_1")).toEqual(
      forventetVilkaar("FO_883_2004_ART12_1", false, ["IKKE_VESENTLIG_VIRKSOMHET"]),
    );
  });
});
