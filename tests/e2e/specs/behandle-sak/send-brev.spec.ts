import { test, expect } from "../../recording/fixtures";
import { SendBrevPanelPage } from "../../pages/behandling/send-brev-panel.page";
import { mockSendBrev, SendBrevMock } from "../../mocks/sendBrevMock";

/**
 * E2E-tester for «Send brev» i sidedialogen. Verifiserer payload som sendes ved
 * brevbestilling og lagring/oppdatering/sletting av utkast.
 *
 * All backend-kommunikasjon er mocket med page.route (se mocks/sendBrevMock.ts).
 */

const MOTTAKER = {
  BRUKER: "Bruker eller brukers fullmektig",
  ARBEIDSGIVER: "Arbeidsgiver eller arbeidsgivers fullmektig",
  UTENLANDSK: "Utenlandsk trygdemyndighet",
  ANNEN_ORGANISASJON: "Annen organisasjon",
  NORSKE_MYNDIGHETER: "Norske myndigheter",
};

const BREVMAL = {
  FORVENTET_SAKSBEHANDLINGSTID: "Melding om forventet saksbehandlingstid",
  MANGELBREV_BRUKER: "Melding om manglende opplysninger til bruker",
  FRITEKSTBREV_BRUKER: "Fritekstbrev til bruker",
  MANGELBREV_VIRKSOMHET: "Melding om manglende opplysninger til virksomhet",
};

const FELT = {
  OVERSKRIFT: "Overskrift i brev",
  HOVEDTEKST: "Hovedtekst til brev",
  INNLEDNING: "Innledningstekst",
  MANGLER: "Hva skal mottakeren sende inn?",
  DOKUMENTTITTEL: "Dokumenttittel",
  TRYGDEMYNDIGHET: "Trygdemyndighet",
  KONTAKTPERSON: "Kontaktperson (valgfritt)",
};

const OVERSKRIFT_HENVENDELSE = "Svar på henvendelse om trygdetilhørlighet";
const html = (tekst: string) => `<div class="ql-fritekst"><p>${tekst}</p></div>`;

function brevRequest(produserbardokument: string, mottaker: string, overstyr: Record<string, unknown> = {}) {
  return {
    produserbardokument,
    mottaker,
    orgNr: null,
    kontaktpersonNavn: null,
    innledningFritekst: null,
    manglerFritekst: null,
    fritekst: null,
    fritekstTittel: null,
    kopiMottakere: [],
    skalViseStandardTekstOmkontaktopplysninger: null,
    saksvedlegg: [],
    fritekstvedlegg: [],
    distribusjonstype: null,
    dokumentTittel: null,
    saksbehandlerNrToIdent: null,
    institusjonID: null,
    ...overstyr,
  };
}

test.describe("Send brev", () => {
  let mock: SendBrevMock;
  let sendBrev: SendBrevPanelPage;

  test.beforeEach(async ({ page }) => {
    mock = await mockSendBrev(page);
    sendBrev = new SendBrevPanelPage(page);
  });

  test.afterEach(() => {
    expect(mock.ikkeMockedeKall, "Alle API-kall skal være mocket").toEqual([]);
  });

  const åpneSendBrev = async () => {
    await sendBrev.goto(mock.url);
    await sendBrev.åpneSendBrev();
  };

  const opprettPath = () => `/api/dokumenter/v2/opprett/${mock.behandlingID}`;
  const utkastPath = (utkastBrevID?: number) =>
    `/api/brev/utkast/${mock.behandlingID}${utkastBrevID ? `/${utkastBrevID}` : ""}`;

  test("brev uten dynamiske felter sendes med valgt mal og mottaker", async () => {
    await åpneSendBrev();
    await sendBrev.velgMottaker(MOTTAKER.BRUKER);
    await sendBrev.velgBrevmal(BREVMAL.FORVENTET_SAKSBEHANDLINGSTID);
    await sendBrev.sendBrev();

    expect(mock.bestillinger).toEqual([
      {
        method: "POST",
        path: opprettPath(),
        body: brevRequest("MELDING_FORVENTET_SAKSBEHANDLINGSTID_SOKNAD", "BRUKER"),
      },
    ]);
  });

  test("fritekstbrev til bruker sender overskrift, tekst, distribusjonstype og dokumenttittel", async () => {
    await åpneSendBrev();
    await sendBrev.velgMottaker(MOTTAKER.BRUKER);
    await sendBrev.velgBrevmal(BREVMAL.FRITEKSTBREV_BRUKER);
    await sendBrev.velgIListe(FELT.OVERSKRIFT, OVERSKRIFT_HENVENDELSE);
    await sendBrev.skrivFritekst(FELT.HOVEDTEKST, "Hei, dette er et brev");
    await sendBrev.huk("Legg til standardtekst med kontaktinformasjon nederst i brevet");
    await sendBrev.velgRadio("Viktig");
    await sendBrev.skrivTekst(FELT.DOKUMENTTITTEL, "Min tittel");
    await sendBrev.sendBrev();

    expect(mock.bestillinger).toEqual([
      {
        method: "POST",
        path: opprettPath(),
        body: brevRequest("GENERELT_FRITEKSTBREV_BRUKER", "BRUKER", {
          fritekstTittel: OVERSKRIFT_HENVENDELSE,
          fritekst: html("Hei, dette er et brev"),
          skalViseStandardTekstOmkontaktopplysninger: true,
          distribusjonstype: "VIKTIG",
          dokumentTittel: "Min tittel",
        }),
      },
    ]);
  });

  test("fritekst-overskrift sendes som fritekstTittel", async () => {
    await åpneSendBrev();
    await sendBrev.velgMottaker(MOTTAKER.BRUKER);
    await sendBrev.velgBrevmal(BREVMAL.FRITEKSTBREV_BRUKER);
    await sendBrev.velgIListe(FELT.OVERSKRIFT, "Fritekst (maks 60 tegn)");
    await sendBrev.skrivFeltverdi("BREV_TITTEL", "Egen overskrift");
    await sendBrev.skrivFritekst(FELT.HOVEDTEKST, "Tekst");
    await sendBrev.velgRadio("Annet");
    await sendBrev.sendBrev();

    expect(mock.bestillinger.map((b) => b.body)).toEqual([
      brevRequest("GENERELT_FRITEKSTBREV_BRUKER", "BRUKER", {
        fritekstTittel: "Egen overskrift",
        fritekst: html("Tekst"),
        distribusjonstype: "ANNET",
      }),
    ]);
  });

  test("mangelbrev sender ikke innledning med fritekst når standardtekst velges igjen", async () => {
    await åpneSendBrev();
    await sendBrev.velgMottaker(MOTTAKER.BRUKER);
    await sendBrev.velgBrevmal(BREVMAL.MANGELBREV_BRUKER);
    await sendBrev.velgRadio("Fritekst (erstatter standardtekst)");
    await sendBrev.skrivFritekst(FELT.INNLEDNING, "Skal ikke sendes");
    await sendBrev.velgRadio("Standardtekst søknad/klage");
    await sendBrev.skrivFritekst(FELT.MANGLER, "Lønnsslipp");
    await sendBrev.sendBrev();

    expect(mock.bestillinger.map((b) => b.body)).toEqual([
      brevRequest("MANGELBREV_BRUKER", "BRUKER", { manglerFritekst: html("Lønnsslipp") }),
    ]);
  });

  test("annen organisasjon sender orgnr, kontaktperson og kopi til bruker", async () => {
    await åpneSendBrev();
    await sendBrev.velgMottaker(MOTTAKER.ANNEN_ORGANISASJON);
    await sendBrev.skrivOrganisasjonsnummer("999999999", "Ståles Stål AS");
    await sendBrev.skrivTekst(FELT.KONTAKTPERSON, "Kari Kontakt");
    await sendBrev.velgBrevmal(BREVMAL.MANGELBREV_VIRKSOMHET);
    await sendBrev.velgRadio("Standardtekst søknad/klage");
    await sendBrev.skrivFritekst(FELT.MANGLER, "A-melding");
    await sendBrev.huk("Send kopi til bruker/brukers fullmektig");
    await sendBrev.sendBrev();

    expect(mock.bestillinger.map((b) => b.body)).toEqual([
      brevRequest("MANGELBREV_ARBEIDSGIVER", "ANNEN_ORGANISASJON", {
        orgNr: "999999999",
        kontaktpersonNavn: "Kari Kontakt",
        manglerFritekst: html("A-melding"),
        kopiMottakere: [{ rolle: "BRUKER", orgnr: null, aktørId: "1111111111111", institusjonID: null }],
      }),
    ]);
  });

  test("arbeidsgiver sender orgnr for valgt arbeidsgiver", async () => {
    await åpneSendBrev();
    await sendBrev.velgMottaker(MOTTAKER.ARBEIDSGIVER);
    await sendBrev.velgRadio("Jerns Jern AS (org.nr. 888888888)");
    await sendBrev.velgBrevmal(BREVMAL.MANGELBREV_VIRKSOMHET);
    await sendBrev.velgRadio("Standardtekst søknad/klage");
    await sendBrev.skrivFritekst(FELT.MANGLER, "Arbeidsavtale");
    await sendBrev.sendBrev();

    expect(mock.bestillinger.map((b) => b.body)).toEqual([
      brevRequest("MANGELBREV_ARBEIDSGIVER", "ARBEIDSGIVER", {
        orgNr: "888888888",
        manglerFritekst: html("Arbeidsavtale"),
      }),
    ]);
  });

  test("utenlandsk trygdemyndighet sender valgt institusjon", async () => {
    await åpneSendBrev();
    await sendBrev.velgMottaker(MOTTAKER.UTENLANDSK);
    await sendBrev.verifiserValgtBrevmal("Fritekstbrev");
    await sendBrev.velgIListe(FELT.TRYGDEMYNDIGHET, "Trygdemyndighetene i Færøyene");
    await sendBrev.velgIListe(FELT.OVERSKRIFT, OVERSKRIFT_HENVENDELSE);
    await sendBrev.skrivFritekst(FELT.HOVEDTEKST, "Hello");
    await sendBrev.velgRadio("Annet");
    await sendBrev.sendBrev();

    expect(mock.bestillinger.map((b) => b.body)).toEqual([
      brevRequest("UTENLANDSK_TRYGDEMYNDIGHET_FRITEKSTBREV", "UTENLANDSK_TRYGDEMYNDIGHET", {
        institusjonID: "FO",
        fritekstTittel: OVERSKRIFT_HENVENDELSE,
        fritekst: html("Hello"),
        distribusjonstype: "ANNET",
      }),
    ]);
  });

  test("norske myndigheter sender valgte etater", async () => {
    await åpneSendBrev();
    await sendBrev.velgMottaker(MOTTAKER.NORSKE_MYNDIGHETER);
    await sendBrev.huk("Skatteetaten");
    await sendBrev.huk("Helfo");
    await sendBrev.verifiserValgtBrevmal("Fritekstbrev");
    await sendBrev.velgIListe(FELT.OVERSKRIFT, "Orientering om vår beslutning");
    await sendBrev.skrivFritekst(FELT.HOVEDTEKST, "Til etatene");
    await sendBrev.velgRadio("Vedtak");
    await sendBrev.sendBrev();

    expect(mock.bestillinger.map((b) => b.body)).toEqual([
      brevRequest("FRITEKSTBREV", "NORSK_MYNDIGHET", {
        orgnrNorskMyndighet: ["974761076", "986965610"],
        fritekstTittel: "Orientering om vår beslutning",
        fritekst: html("Til etatene"),
        distribusjonstype: "VEDTAK",
      }),
    ]);
  });

  test("bytte av brevmal tømmer utfylte felter", async () => {
    await åpneSendBrev();
    await sendBrev.velgMottaker(MOTTAKER.BRUKER);
    await sendBrev.velgBrevmal(BREVMAL.FRITEKSTBREV_BRUKER);
    await sendBrev.velgIListe(FELT.OVERSKRIFT, OVERSKRIFT_HENVENDELSE);
    await sendBrev.skrivFritekst(FELT.HOVEDTEKST, "Gammel tekst");
    await sendBrev.skrivTekst(FELT.DOKUMENTTITTEL, "Gammel tittel");

    await sendBrev.velgBrevmal(BREVMAL.MANGELBREV_BRUKER);
    await sendBrev.velgBrevmal(BREVMAL.FRITEKSTBREV_BRUKER);
    await sendBrev.verifiserFritekst(FELT.HOVEDTEKST, "");
    await sendBrev.verifiserTekst(FELT.DOKUMENTTITTEL, "");

    await sendBrev.velgIListe(FELT.OVERSKRIFT, OVERSKRIFT_HENVENDELSE);
    await sendBrev.skrivFritekst(FELT.HOVEDTEKST, "Ny tekst");
    await sendBrev.velgRadio("Vedtak");
    await sendBrev.sendBrev();

    expect(mock.bestillinger.map((b) => b.body)).toEqual([
      brevRequest("GENERELT_FRITEKSTBREV_BRUKER", "BRUKER", {
        fritekstTittel: OVERSKRIFT_HENVENDELSE,
        fritekst: html("Ny tekst"),
        distribusjonstype: "VEDTAK",
      }),
    ]);
  });

  test("bytte av mottaker nullstiller brevmal og felter", async () => {
    await åpneSendBrev();
    await sendBrev.velgMottaker(MOTTAKER.ANNEN_ORGANISASJON);
    await sendBrev.skrivOrganisasjonsnummer("999999999", "Ståles Stål AS");
    await sendBrev.velgBrevmal(BREVMAL.MANGELBREV_VIRKSOMHET);
    await sendBrev.skrivFritekst(FELT.MANGLER, "Gammel tekst");

    await sendBrev.velgMottaker(MOTTAKER.BRUKER);
    await sendBrev.verifiserBrevmalIkkeValgt();
    await sendBrev.velgBrevmal(BREVMAL.MANGELBREV_BRUKER);
    await sendBrev.verifiserFritekst(FELT.MANGLER, "");
    await sendBrev.velgRadio("Standardtekst søknad/klage");
    await sendBrev.skrivFritekst(FELT.MANGLER, "Ny tekst");
    await sendBrev.sendBrev();

    expect(mock.bestillinger.map((b) => b.body)).toEqual([
      brevRequest("MANGELBREV_BRUKER", "BRUKER", { manglerFritekst: html("Ny tekst") }),
    ]);
  });

  test("lagret utkast kan åpnes og sendes, og slettes da", async () => {
    await åpneSendBrev();
    await sendBrev.velgMottaker(MOTTAKER.BRUKER);
    await sendBrev.velgBrevmal(BREVMAL.MANGELBREV_BRUKER);
    await sendBrev.velgRadio("Fritekst (erstatter standardtekst)");
    await sendBrev.skrivFritekst(FELT.INNLEDNING, "Innledning her");
    await sendBrev.skrivFritekst(FELT.MANGLER, "Send lønnsslipp");
    await sendBrev.lagreUtkast();
    await sendBrev.verifiserLagredeUtkast([BREVMAL.MANGELBREV_BRUKER]);
    await sendBrev.verifiserValgtMottaker("Velg...");

    await sendBrev.åpneUtkast(BREVMAL.MANGELBREV_BRUKER);
    await sendBrev.verifiserValgtMottaker(MOTTAKER.BRUKER);
    await sendBrev.verifiserValgtBrevmal(BREVMAL.MANGELBREV_BRUKER);
    await sendBrev.verifiserFritekst(FELT.INNLEDNING, "Innledning her");
    await sendBrev.verifiserFritekst(FELT.MANGLER, "Send lønnsslipp");
    await sendBrev.sendBrev();

    const forventet = brevRequest("MANGELBREV_BRUKER", "BRUKER", {
      innledningFritekst: html("Innledning her"),
      manglerFritekst: html("Send lønnsslipp"),
    });
    await expect.poll(() => mock.bestillinger.length).toBe(3);
    expect(mock.bestillinger).toEqual([
      { method: "POST", path: utkastPath(), body: forventet },
      { method: "POST", path: opprettPath(), body: forventet },
      { method: "DELETE", path: utkastPath(1), body: null },
    ]);
  });

  // Bruker mangelbrev fordi fritekstbrev får dobbel signatur når innlogget saksbehandler er ukjent (som lokalt).
  test("utkast åpnet fra Dokumenter-fanen oppdateres ved lagring", async () => {
    const lagret = brevRequest("MANGELBREV_BRUKER", "BRUKER", { manglerFritekst: html("Første versjon") });
    const { utkastBrevID } = mock.leggTilUtkast(lagret);

    await sendBrev.goto(mock.url);
    await sendBrev.åpneUtkastFraDokumenter(BREVMAL.MANGELBREV_BRUKER);
    await sendBrev.verifiserValgtMottaker(MOTTAKER.BRUKER);
    await sendBrev.verifiserValgtBrevmal(BREVMAL.MANGELBREV_BRUKER);
    await sendBrev.verifiserFritekst(FELT.MANGLER, "Første versjon");

    await sendBrev.skrivFritekst(FELT.MANGLER, "Andre versjon");
    await sendBrev.lagreUtkast();

    await expect.poll(() => mock.bestillinger.length).toBe(1);
    expect(mock.bestillinger).toEqual([
      { method: "PUT", path: utkastPath(utkastBrevID), body: { ...lagret, manglerFritekst: html("Andre versjon") } },
    ]);
  });

  test("fritekstbrev fra utkast lagret av annen saksbehandler sendes med dobbel signatur", async () => {
    const lagret = brevRequest("GENERELT_FRITEKSTBREV_BRUKER", "BRUKER", {
      fritekstTittel: OVERSKRIFT_HENVENDELSE,
      fritekst: html("Til godkjenning"),
      distribusjonstype: "VEDTAK",
    });
    mock.leggTilUtkast(lagret, "Z123456");

    await åpneSendBrev();
    await sendBrev.åpneUtkast(BREVMAL.FRITEKSTBREV_BRUKER);
    await sendBrev.verifiserFritekst(FELT.HOVEDTEKST, "Til godkjenning");
    await sendBrev.sendBrev();

    await expect.poll(() => mock.bestillinger.length).toBe(2);
    expect(mock.bestillinger).toEqual([
      { method: "POST", path: opprettPath(), body: { ...lagret, saksbehandlerNrToIdent: "Z123456" } },
      { method: "DELETE", path: utkastPath(1), body: null },
    ]);
  });

  test("forkast brev på åpent utkast sletter utkastet", async () => {
    const { utkastBrevID } = mock.leggTilUtkast(
      brevRequest("MANGELBREV_BRUKER", "BRUKER", { manglerFritekst: html("Noe") }),
    );

    await åpneSendBrev();
    await sendBrev.åpneUtkast(BREVMAL.MANGELBREV_BRUKER);
    await sendBrev.verifiserFritekst(FELT.MANGLER, "Noe");
    await sendBrev.forkastBrev();
    await sendBrev.verifiserLagredeUtkast([]);

    expect(mock.bestillinger).toEqual([{ method: "DELETE", path: utkastPath(utkastBrevID), body: null }]);
  });
});
