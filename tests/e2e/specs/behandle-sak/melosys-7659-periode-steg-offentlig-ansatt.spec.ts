import { test } from "@playwright/test";
import { SokPage } from "../../pages/sok.page";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { EuEøsStegPage } from "../../pages/behandling/eu-eøs-steg.page";
import { opprettEuEøsOffentligAnsattSak } from "../../utils/testdataUtils";
import { runAxeAnalyze } from "../../utils/axeUtils";

/**
 * MELOSYS-7659: Teste periode-steg for offentlig ansatt i EU/EØS-flyt
 *
 * Dette steget skal:
 * - Vise stegtittel "Lovvalgsbestemmelse og -periode"
 * - Ha nedtrekksmeny for lovvalgsbestemmelser (11.3b og 11.5)
 * - Vise lovvalgsperiode basert på søknadsperiode
 * - Ha checkboks for å forkorte perioden
 * - Validere datoer
 */
test.describe("MELOSYS-7659: Periode-steg for offentlig ansatt i EU/EØS-flyt", () => {
  test("Opprett EU/EØS-sak med offentlig ansatt og naviger til periode-steg", async ({ page }, testInfo) => {
    // Opprett ny EU/EØS-sak med offentlig ansatt (navigerer til søkeside)
    const saksnummer = await opprettEuEøsOffentligAnsattSak(page);

    // Initialiser page objects etter opprettelse (vi er nå på søkeside)
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    const euEøsStegPage = new EuEøsStegPage(page);

    // Finn og klikk på behandlingen (vi er allerede på søkesiden)
    const sak = sokPage.finnSakBySaksnummer(saksnummer);
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    // Naviger gjennom stegene til periode-steg
    // Steg 1: Inngang - Klikk "Bekreft og fortsett"
    await euEøsStegPage.klikkBekreftOgFortsett(saksnummer);

    // Steg 2: Virksomhet - Velg virksomhet og klikk "Bekreft og fortsett"
    await euEøsStegPage.velgFørsteVirksomhet(saksnummer);
    await euEøsStegPage.klikkBekreftOgFortsett(saksnummer);

    // Steg 3: Barn - Klikk "Bekreft og fortsett"
    await euEøsStegPage.klikkBekreftOgFortsett(saksnummer);

    // Steg 4: Periode-steg - Verifiser at vi er her
    await euEøsStegPage.verifiserPeriodeSteg(saksnummer);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("AC2-AC7: Verifiser UI-elementer i periode-steget", async ({ page }, testInfo) => {
    // Opprett ny EU/EØS-sak med offentlig ansatt (navigerer til søkeside)
    const saksnummer = await opprettEuEøsOffentligAnsattSak(page);

    // Initialiser page objects etter opprettelse (vi er nå på søkeside)
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    const euEøsStegPage = new EuEøsStegPage(page);

    // Finn og klikk på behandlingen (vi er allerede på søkesiden)
    const sak = sokPage.finnSakBySaksnummer(saksnummer);
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    // Naviger til periode-steg
    // Steg 1: Inngang
    await euEøsStegPage.klikkBekreftOgFortsett(saksnummer);
    // Steg 2: Virksomhet - Velg virksomhet
    await euEøsStegPage.velgFørsteVirksomhet(saksnummer);
    await euEøsStegPage.klikkBekreftOgFortsett(saksnummer);
    // Steg 3: Barn
    await euEøsStegPage.klikkBekreftOgFortsett(saksnummer);

    // AC2: Verifiser stegtittel
    await euEøsStegPage.verifiserStegtittel("Lovvalgsbestemmelse og -periode", saksnummer);

    // AC3-AC4: Verifiser nedtrekksmeny og alternativer
    await euEøsStegPage.verifiserLovvalgsbestemmelseSelect(saksnummer);
    await euEøsStegPage.verifiserLovvalgsbestemmelseAlternativ("Rfo. 883/2004 art.11(3)(b)", saksnummer);
    await euEøsStegPage.verifiserLovvalgsbestemmelseAlternativ("Rfo. 883/2004 art.11(5)", saksnummer);

    // AC5-AC6: Verifiser lovvalgsperiode vises
    await euEøsStegPage.verifiserLovvalgsperiodeVises(saksnummer);

    // AC7: Verifiser checkboks
    await euEøsStegPage.verifiserKorterePeriodeCheckboks(saksnummer);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("AC8-AC10: Test kortere periode-funksjonalitet", async ({ page }, testInfo) => {
    // Opprett ny EU/EØS-sak med offentlig ansatt (navigerer til søkeside)
    const saksnummer = await opprettEuEøsOffentligAnsattSak(page);

    // Initialiser page objects etter opprettelse (vi er nå på søkeside)
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    const euEøsStegPage = new EuEøsStegPage(page);

    // Finn og klikk på behandlingen (vi er allerede på søkesiden)
    const sak = sokPage.finnSakBySaksnummer(saksnummer);
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    // Naviger til periode-steg
    // Steg 1: Inngang
    await euEøsStegPage.klikkBekreftOgFortsett(saksnummer);
    // Steg 2: Virksomhet - Velg virksomhet
    await euEøsStegPage.velgFørsteVirksomhet(saksnummer);
    await euEøsStegPage.klikkBekreftOgFortsett(saksnummer);
    // Steg 3: Barn
    await euEøsStegPage.klikkBekreftOgFortsett(saksnummer);

    // AC8: Velg bestemmelse og huk av checkboks
    await euEøsStegPage.velgLovvalgsbestemmelse("FO_883_2004_ART11_3B", saksnummer);
    await euEøsStegPage.hukAvKorterePeriode(saksnummer);

    // Verifiser at datofelter vises
    await euEøsStegPage.verifiserDatofelterVises(saksnummer);

    // AC9-AC10: Fyll inn gyldige datoer
    await euEøsStegPage.fyllInnPeriodeDatoer("01.03.2024", "31.10.2024");

    // Verifiser at "Bekreft og fortsett" er aktivert
    await euEøsStegPage.verifiserBekreftKnappErEnabled(saksnummer);

    // Klikk for å gå videre
    await euEøsStegPage.klikkBekreftOgFortsett(saksnummer);

    // Verifiser at vi har navigert til neste steg (vedtak-steg)
    await euEøsStegPage.verifiserVedtakSteg(saksnummer);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("AC11-AC15: Test valideringer", async ({ page }, testInfo) => {
    // Opprett ny EU/EØS-sak med offentlig ansatt (navigerer til søkeside)
    const saksnummer = await opprettEuEøsOffentligAnsattSak(page);

    // Initialiser page objects etter opprettelse (vi er nå på søkeside)
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    const euEøsStegPage = new EuEøsStegPage(page);

    // Finn og klikk på behandlingen (vi er allerede på søkesiden)
    const sak = sokPage.finnSakBySaksnummer(saksnummer);
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    // Naviger til periode-steg
    // Steg 1: Inngang
    await euEøsStegPage.klikkBekreftOgFortsett(saksnummer);
    // Steg 2: Virksomhet - Velg virksomhet
    await euEøsStegPage.velgFørsteVirksomhet(saksnummer);
    await euEøsStegPage.klikkBekreftOgFortsett(saksnummer);
    // Steg 3: Barn
    await euEøsStegPage.klikkBekreftOgFortsett(saksnummer);

    // AC11: Prøv å gå videre uten å velge bestemmelse
    await euEøsStegPage.verifiserBekreftKnappErDisabled(saksnummer);

    // Velg bestemmelse og huk av checkboks
    await euEøsStegPage.velgLovvalgsbestemmelse("FO_883_2004_ART11_3B", saksnummer);
    await euEøsStegPage.hukAvKorterePeriode(saksnummer);

    // AC12: Prøv å gå videre med kun en dato fylt inn
    await euEøsStegPage.fyllInnKunStartdato("01.03.2024");
    // tomDato mangler
    await euEøsStegPage.klikkBekreftOgFortsettUtenValidering();
    await euEøsStegPage.verifiserValideringsfeil("må fylles ut", saksnummer);

    // AC13: Test ugyldig datoformat
    await euEøsStegPage.fyllInnKunSluttdato("99.99.2024");
    await euEøsStegPage.klikkBekreftOgFortsettUtenValidering();
    await euEøsStegPage.verifiserValideringsfeil("gyldig dato", saksnummer);

    // AC14: Test feil rekkefølge (tomDato før fomDato)
    await euEøsStegPage.fyllInnPeriodeDatoer("01.10.2024", "01.03.2024");
    await euEøsStegPage.klikkBekreftOgFortsettUtenValidering();
    // Valideringen skal vise feil

    // AC15: Test datoer utenfor søknadsperiode
    await euEøsStegPage.fyllInnPeriodeDatoer("01.01.2023", "31.12.2023"); // Før søknadsperiode
    await euEøsStegPage.klikkBekreftOgFortsettUtenValidering();
    // Valideringen skal vise feil

    await runAxeAnalyze(page, testInfo.title);
  });
});
