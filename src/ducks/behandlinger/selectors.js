/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from "reselect";
import moment from "moment/moment";

import MKV from "../../melosyskodeverk";
import { datoDiff, sorterEtterISOFomDato } from "../../utils/dato";
import * as KV from "../../kodeverk";
import * as mottatteOpplysningerSelectors from "../mottatteOpplysninger/selectors";
import * as Utils from "../../utils";
import * as lovvalgsperioderSelectors from "../lovvalgsperioder/selectors";
import { SakstypeKodeSelector } from "../fagsaker/selectors";
import {
  AarsavregningAarSelector,
  AarsavregningTidligereGrunnlagMedlemskapsperioderSelector,
} from "../aarsavregning/selectors";

import { HelseutgiftDekkesPeriodeSelector } from "../helseutgiftdekkesperiode/selectors";

export const BehandlingerSelector = createSelector(
  (state) => (state.behandlinger.data ? state.behandlinger.data : {}),
  (behandling) => behandling,
);

/**
 * @type {import('reselect').Selector<import('../../AppTypes').RootState, number>}
 */
export const BehandlingIDSelector = createSelector(
  (state) => BehandlingerSelector(state),
  (behandling) => (behandling && behandling.behandlingID ? behandling.behandlingID : -1),
);

/** @type {import('reselect').Selector<import('../../AppTypes').RootState, import('../../services/api').Oppsummering>} */
export const OppsummeringSelector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) => BehandlingerSelector(state).oppsummering || {},
  (oppsummering) => oppsummering,
);
export const BehandlingstypeKodeSelector = createSelector(
  (state) => OppsummeringSelector(state),
  (oppsummering) => (oppsummering.behandlingstype ? oppsummering.behandlingstype.kode : ""),
);
export const BehandlingstemaKodeSelector = createSelector(
  (state) => OppsummeringSelector(state),
  (oppsummering) => (oppsummering.behandlingstema ? oppsummering.behandlingstema.kode : ""),
);

export const BehandlingsstatusKodeSelector = createSelector(
  (state) => OppsummeringSelector(state),
  (oppsummering) => (oppsummering.behandlingsstatus ? oppsummering.behandlingsstatus.kode : ""),
);
export const SisteOpplysningerHentetDatoSelector = createSelector(
  (state) => OppsummeringSelector(state),
  (oppsummering) => oppsummering.sisteOpplysningerHentetDato || null,
);

export const RegisteropplysningerHentetSelector = createSelector(
  (state) => SisteOpplysningerHentetDatoSelector(state),
  (sisteOpplysningerHentetDato) => Boolean(sisteOpplysningerHentetDato),
);

export const SaksopplysningerSelector = createSelector(
  (state) => BehandlingerSelector(state).saksopplysninger || {},
  (saksopplysninger) => saksopplysninger,
);
export const SakOgBehandlingSelector = createSelector(
  (state) => SaksopplysningerSelector(state).sakOgBehandling || {},
  (sakOgBehandling) => sakOgBehandling,
);

export const SEDSelector = createSelector(
  (state) => SaksopplysningerSelector(state).sed || {},
  (sed) => sed,
);

export const LovvalgsperiodeSelector = createSelector(
  (state) => lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  (state) => SEDSelector(state).lovvalgsperiode || {},
  (lovvalgsperiode, sedLovvalgsperiode) => {
    const { fomDato, tomDato } = lovvalgsperiode;
    return fomDato ? { fom: fomDato, tom: tomDato } : sedLovvalgsperiode;
  },
);

export const LovvalgsperiodeFomSelector = createSelector(
  LovvalgsperiodeSelector,
  (lovvalgsperiode) => lovvalgsperiode.fom,
);

export const LovvalgsperiodeTomSelector = createSelector(
  LovvalgsperiodeSelector,
  (lovvalgsperiode) => lovvalgsperiode.tom,
);

export const LovvalgslandSelector = createSelector(
  (state) => SEDSelector(state).lovvalgslandKode || "",
  (lovvalgsland) => KV.kodeTilObjekt(lovvalgsland, MKV.KTObjects.landkoder) || {},
);

export const OrganisasjonerSelector = createSelector(
  (state) => SaksopplysningerSelector(state).organisasjoner || [],
  (organisasjoner) => organisasjoner,
);

export const ArbeidsforholdSelector = createSelector(
  (state) => SaksopplysningerSelector(state).arbeidsforhold || [],
  (arbeidsforhold) => arbeidsforhold,
);

/**
 * INNTEKT
 * ---------------------------------------------------------------------------------------
 * Denne seksjonen inneholder selectorer og delfunksjoner for å håndtere, omstrukturere og
 * vise inntekt. Inntekt i en fagsak kommer inn som ett objekt med nøstede arrays hvor flere
 * typer inntekt kommer inn fra en eller flere opplysningspliktige.
 *
 */

/**
 * Inntekt er nøstet inn i måned og deretter en blanding av flere inntektstyper fra enten samme
 * opplysningspliktigID eller forskjellige opplysningspliktigID. I tillegg er det mye data
 * som vi ikke har behov for. For å kunne gjøre fremtidige filtreringer ønsker vi å omforme
 * den opprinnelige modellen til en flatere modell:
 *
 * [{ opplysningspliktigID: '123456789', beloep: 100000, aarMaaned: '2017-18' }]
 *
 * @param arbeidsInntektMaanedListe Det opprinnelige objektet for inntekten.
 */
const lagFlatInntektListe = (arbeidsInntektMaanedListe) =>
  arbeidsInntektMaanedListe.reduce((samling, enkeltMaaned) => {
    const { arbeidsInntektInformasjon, aarMaaned } = enkeltMaaned;
    if (!arbeidsInntektInformasjon) return [];
    const { inntektListe } = arbeidsInntektInformasjon;
    if (!inntektListe) return [];

    const inntekterForEnkeltMaaned = inntektListe.reduce((samlingAvInntekterDenneMaaneden, enkelInntekt) => {
      const { opplysningspliktigID, beloep } = enkelInntekt;
      return [...samlingAvInntekterDenneMaaneden, { opplysningspliktigID, beloep, aarMaaned }];
    }, []);

    return [...samling, ...inntekterForEnkeltMaaned];
  }, []);

/**
 * Inntekter fra samme opplysningspliktigID kan ha flere typer og dermed komme inn som
 * separate objekter. Type inntekt kan være 'lønnsinntekt', 'bonusinntekt', 'feriepenger' etc.
 * Navn på typene er ikke viktige, men vi ønsker bare å vise én inntektssum fra samme opplysningspliktigID
 * i en enkelt måned.
 *
 * Funksjonen nedenfor traverserer alle intekter og summerer de som kommer fra samme opplysningspliktigID.
 * @param flatInntektListe Den flate inntektslisten som inneholder alle del-inntekter.
 */
const summerInntektsTyperFraSammeOpplysningspliktig = (flatInntektListe) =>
  flatInntektListe.reduce((samling, enkeltInntekt) => {
    const eksisterendeInntektFunnetVedIndeks = samling.findIndex(
      (element) =>
        element.opplysningspliktigID === enkeltInntekt.opplysningspliktigID &&
        element.aarMaaned === enkeltInntekt.aarMaaned,
    );

    const nyEnkeltInntekt =
      eksisterendeInntektFunnetVedIndeks > -1 ? samling[eksisterendeInntektFunnetVedIndeks] : enkeltInntekt;
    nyEnkeltInntekt.beloep =
      eksisterendeInntektFunnetVedIndeks > -1 ? nyEnkeltInntekt.beloep + enkeltInntekt.beloep : nyEnkeltInntekt.beloep;
    nyEnkeltInntekt.beloep = Math.max(nyEnkeltInntekt.beloep, 0);

    // Dersom ingen eksisterende inntekt på opplysningspliktigID ble funnet vil eksisterendeInntektFunnetVedIndeks være 0
    // og samlingen vil dermed ikke påvirkes av filteret nedenfor
    const nySamling = samling.filter((enkelt, indeks) => indeks !== eksisterendeInntektFunnetVedIndeks);

    return [...nySamling, nyEnkeltInntekt];
  }, []);

/** Denne funksjonen filtrerer inntekten som finnes innenfor den relevante perioden (søknadsdato minus 6 måneder)
 * Dersom det ikke finnes inntekt, vil den sette inntekten til 0 slik at denne måneden fortsatt kommer med
 * i den grafiske fremstillingen.
 *
 * @param relevantPeriode Den relevante perioden som det skal vises inntekt på.
 * @param orgnr Organisasjonsnummmeret som det filtreres på.
 * @param inntekter Listen over ufiltrerte inntekter.
 * @returns {any[]}
 */
const filtrerOgSpreInntekt = (relevantPeriode, orgnr, inntekter) => {
  const filtrerteInntekterFraOpplysningspliktig = inntekter.filter((inntekt) => inntekt.opplysningspliktigID === orgnr);
  if (filtrerteInntekterFraOpplysningspliktig.length === 0) {
    return [];
  }

  const startDato = relevantPeriode.fom;
  const antallMaaneder = parseInt(datoDiff(relevantPeriode.fom, relevantPeriode.tom, "months"), 10) + 1;

  if (relevantPeriode.fom === "Invalid date" || relevantPeriode.tom === "Invalid date") {
    return [];
  }

  return Array(antallMaaneder)
    .fill({})
    .map((verdi, index) => {
      const aarMaaned = moment(startDato).add(index, "months").format("YYYY-MM");

      const eksisterendeInntektFunnetVedIndeks = filtrerteInntekterFraOpplysningspliktig.findIndex(
        (enkeltInntekt) => enkeltInntekt.aarMaaned === aarMaaned,
      );

      return eksisterendeInntektFunnetVedIndeks > -1
        ? filtrerteInntekterFraOpplysningspliktig[eksisterendeInntektFunnetVedIndeks]
        : { aarMaaned, beloep: 0, opplysningspliktigID: orgnr };
    });
};

export const InntektSelector = createSelector(
  (state) => SaksopplysningerSelector(state).inntekt || {},
  (inntekt) => inntekt,
);

export const InntekterPrAarMaanedSelector = createSelector(InntektSelector, (inntekt) => {
  if (!inntekt) return [];
  const { arbeidsInntektMaanedListe } = inntekt;
  if (!arbeidsInntektMaanedListe) return [];

  const flatInntektsListe = lagFlatInntektListe(arbeidsInntektMaanedListe);
  return summerInntektsTyperFraSammeOpplysningspliktig(flatInntektsListe);
});

export const MedlemskapSelector = createSelector(
  (state) =>
    state.behandlinger.data && state.behandlinger.data.saksopplysninger
      ? state.behandlinger.data.saksopplysninger.medlemskap
      : {},
  (medlemskap) => {
    // Medlemskapskoder fra kodeverk
    const PERIODE_MED_MEDLEMSKAP = "PMMEDSKP";
    const PERIODE_UTEN_MEDLEMSKAP = "PUMEDSKP";
    const GYLDIG_MEDLEMSKAP = "GYLD";
    const UAVKLART_MEDLEMSKAP = "UAVK";
    const AVVIST_MEDLEMSKAP = "AVST";

    const { medlemsperiode } = medlemskap;
    if (!medlemsperiode) {
      return {
        perioderMed: [],
        perioderUten: [],
      };
    }

    return {
      perioderMed: medlemsperiode.filter(
        (periode) =>
          KV.objektTilKode(periode.periodetype) === PERIODE_MED_MEDLEMSKAP &&
          KV.objektTilKode(periode.status) === GYLDIG_MEDLEMSKAP,
      ),
      perioderUten: medlemsperiode.filter(
        (periode) =>
          KV.objektTilKode(periode.periodetype) === PERIODE_UTEN_MEDLEMSKAP &&
          KV.objektTilKode(periode.status) !== AVVIST_MEDLEMSKAP,
      ),
      perioderUavklart: medlemsperiode.filter((periode) => KV.objektTilKode(periode.status) === UAVKLART_MEDLEMSKAP),
    };
  },
);

/**
 * Arbeidsforhold refererer til organisasjon med arbeidsforholdID. For at komponenten skal kunne vise
 * navn på arbeidsgiver og evt adresse etc må dette flettes inn i arbeidsforhold. Selectoren gjør en map p
 * alle arbeidsforhold og finner relevant organisasjon etter orgnr og setter hele dette objektet inn
 * i arbeidsforholdet dersom det finnes.
 */
export const ArbeidsforholdeneSelector = createSelector(
  (state) => ArbeidsforholdSelector(state),
  (state) => OrganisasjonerSelector(state),
  (state) => InntekterPrAarMaanedSelector(state),
  (arbeidsforhold, organisasjoner, inntekt) =>
    arbeidsforhold.map((item) => {
      if (!arbeidsforhold || !organisasjoner || !inntekt) return [];
      const arbeid = { ...item };
      arbeid.arbeidsgiver = organisasjoner.find((org) => org.orgnr === arbeid.arbeidsgiverID) || {};
      arbeid.inntekt = inntekt.filter((linje) => linje.opplysningspliktigID === arbeid.arbeidsgiverID) || [];
      return arbeid;
    }),
);

export const AlleVirksomheterSelector = createSelector(
  (state) => ArbeidsforholdeneSelector(state),
  (state) => mottatteOpplysningerSelectors.SelvstendigNaringsvirksomhetSelector(state),
  (state) => mottatteOpplysningerSelectors.ForetakUtlandSelector(state),
  (state) => mottatteOpplysningerSelectors.ValiderteEkstraArbeidsgivereSelector(state),
  (arbeidsforholdene, selvstendigNaringsvirksomhet, foretakUtland, ekstraArbeidsgivere) => {
    const virksomhetsListe = [];
    arbeidsforholdene.forEach((arbeidsforhold) => {
      virksomhetsListe.push({ kode: arbeidsforhold.arbeidsgiver.orgnr, term: arbeidsforhold.arbeidsgiver.navn });
    });
    selvstendigNaringsvirksomhet.forEach((selvstendigForetak) => {
      virksomhetsListe.push({ kode: selvstendigForetak.orgnr, term: selvstendigForetak.navn });
    });
    foretakUtland.forEach((foretak) => {
      virksomhetsListe.push({ kode: foretak.uuid, term: foretak.navn });
    });
    ekstraArbeidsgivere.forEach((ekstraArbeidsgiver) => {
      virksomhetsListe.push({ kode: ekstraArbeidsgiver.orgnr, term: ekstraArbeidsgiver.navn });
    });
    return Utils._uniqBy(virksomhetsListe, ({ kode }) => kode);
  },
);

/** Hjelpefunksjon for ArbeidsgivereNorgeSelector. Funksjonen bygger en ny gruppe av et arbeidsforhold
 * med arbeidsforholdene (array), inntekter (array) og organisasjonen (objekt)
 * @param arbeidsforholdet
 * @param organisasjoner
 * @param inntekter
 * @param relevantPeriode
 * @returns {{arbeidsforholdene: *[], organisasjon: *, inntekter: any[]}}
 */
const byggNyArbeidsforholdGruppe = (arbeidsforholdet, organisasjoner, inntekter, relevantPeriode) => ({
  kilde: KV.Koder.Opplysningskilder.AAREG_EREG,
  arbeidsforholdene: [arbeidsforholdet],
  organisasjon: organisasjoner.find((org) => org.orgnr === arbeidsforholdet.opplysningspliktigID) || {},
  inntektListe: filtrerOgSpreInntekt(relevantPeriode, arbeidsforholdet.opplysningspliktigID, inntekter),
});

const utledPeriodeForAarsavregning = (aar, medlemskapsperioder) => {
  if (!Utils._isEmpty(medlemskapsperioder)) {
    const sortertePerioder = medlemskapsperioder.sort(sorterEtterISOFomDato);
    return {
      fom: sortertePerioder[0].fomDato,
      tom: sortertePerioder[sortertePerioder.length - 1].tomDato,
    };
  }
  if (aar) {
    return {
      fom: `${aar}-01-01`,
      tom: `${aar}-12-31`,
    };
  }
  return undefined;
};

/** Denne funksjonen gjør følgende:
 * 1. Itererer alle arbeidsforhold og grupperer de inn etter opplysningspliktigID (dvs juridisk arbeidsgiver)
 * 2. Dersom en gruppe av opplysningspliktigID ikke eksisterer fra før, lages den via byggNyArbeidsforholdGruppe
 *
 * Etterpå returneres hele arrayen med sub-arrays som hver inneholder grupperinger av
 *  - organisasjon (juridisk arbeidsgiver)
 *  - arbeidsforholdene (virksomhetene)
 *  - inntekt
 */
export const ArbeidsgivereNorgeSelector = createSelector(
  OrganisasjonerSelector,
  ArbeidsforholdeneSelector,
  InntekterPrAarMaanedSelector,
  mottatteOpplysningerSelectors.PeriodeSelector,
  LovvalgsperiodeSelector,
  AarsavregningAarSelector,
  AarsavregningTidligereGrunnlagMedlemskapsperioderSelector,
  HelseutgiftDekkesPeriodeSelector,
  (
    organisasjoner,
    arbeidsforholdene,
    inntekter,
    oppholdsPeriode,
    sedLovvalgsperiode,
    aarsavregningAar,
    aarsavregningMedlemskapsperioder,
    helseutgiftDekkesPeriode,
  ) => {
    // Inntekten skal vises 6 måneder forut for startdato. Dersom søknaden gjelder en periode
    // tilbake i tid, skal også inntekt i selve perioden vises.
    let { fom: soknadPeriodeStart, tom: soknadPeriodeSlutt } = oppholdsPeriode;
    const { fom: sedLovvalgsperiodeFom, tom: sedLovvalgsperiodeTom } = sedLovvalgsperiode;
    const foersteHelseutgiftDekkesPeriode = Array.isArray(helseutgiftDekkesPeriode?.data)
      ? helseutgiftDekkesPeriode.data[0]
      : undefined;
    const { fomDato: helseutgiftDekkesPeriodeFom, tomDato: helseutgiftDekkesPeriodeTom } =
      foersteHelseutgiftDekkesPeriode ?? {};

    if (helseutgiftDekkesPeriodeFom) {
      soknadPeriodeStart = helseutgiftDekkesPeriodeFom;
      soknadPeriodeSlutt = helseutgiftDekkesPeriodeTom;
    }

    if (aarsavregningAar || !Utils._isEmpty(aarsavregningMedlemskapsperioder)) {
      const periode = utledPeriodeForAarsavregning(aarsavregningAar, aarsavregningMedlemskapsperioder);
      soknadPeriodeStart = periode.fom;
      soknadPeriodeSlutt = periode.tom;
    }

    if (!soknadPeriodeStart && !soknadPeriodeSlutt) {
      if (!sedLovvalgsperiodeFom && !sedLovvalgsperiodeTom) {
        return [];
      }

      soknadPeriodeStart = sedLovvalgsperiodeFom;
      soknadPeriodeSlutt = sedLovvalgsperiodeTom;
    }

    const relevantPeriodeStart = moment(soknadPeriodeStart, "YYYY-MM-DD").subtract(6, "months").format("YYYY-MM-DD");

    let relevantPeriodeSlutt =
      moment(soknadPeriodeSlutt, "YYYY-MM-DD") < moment() ? soknadPeriodeSlutt : moment().format("YYYY-MM-DD");
    if (moment(relevantPeriodeSlutt, "YYYY-MM-DD").isBefore(moment(soknadPeriodeStart, "YYYY-MM-DD")))
      relevantPeriodeSlutt = soknadPeriodeStart;

    const relevantPeriode = {
      fom: relevantPeriodeStart,
      tom: relevantPeriodeSlutt,
    };

    return [
      ...arbeidsforholdene.reduce((samling, arbeidsforholdet) => {
        const tmpSamling = [...samling];

        // Sjekk om det allerede er laget en gruppe for den aktuelle opplysningspliktigID.
        const arbeidsforholdEksistererVedIndeks = samling.findIndex((enkelt) =>
          enkelt.arbeidsforholdene.some(
            (enkeltforhold) => enkeltforhold.opplysningspliktigID === arbeidsforholdet.opplysningspliktigID,
          ),
        );

        if (arbeidsforholdEksistererVedIndeks > -1) {
          tmpSamling[arbeidsforholdEksistererVedIndeks].arbeidsforholdene.push(arbeidsforholdet);
        } else {
          tmpSamling.push(byggNyArbeidsforholdGruppe(arbeidsforholdet, organisasjoner, inntekter, relevantPeriode));
        }
        return tmpSamling;
      }, []),
    ];
  },
);

export const ErEndretPeriodeSelector = createSelector(
  BehandlingstypeKodeSelector,
  (behandlingstype) => behandlingstype === MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE,
);

export const ErAnmodningOmUnntakHovedRegelOgHarFlytSelector = createSelector(
  BehandlingstemaKodeSelector,
  SakstypeKodeSelector,
  (behandlingstema, sakstype) =>
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL &&
    sakstype !== MKV.Koder.sakstyper.TRYGDEAVTALE,
);

export const ErRegistreringUnntakNorskTrygdUtstasjoneringSelector = createSelector(
  BehandlingstemaKodeSelector,
  (behandlingstema) =>
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
);

export const ErRegistreringUnntakNorskTrygdOvrigeSelector = createSelector(
  BehandlingstemaKodeSelector,
  (behandlingstema) =>
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
);

export const ErUtlMyndUtpektSegSelvSelector = createSelector(
  BehandlingstemaKodeSelector,
  (behandlingstema) => behandlingstema === MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND,
);

export const ErArbeidEttLand = createSelector(BehandlingstemaKodeSelector, (behandlingstema) =>
  [
    MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
    MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG,
    MKV.Koder.behandlinger.behandlingstema.ARBEID_KUN_NORGE,
    MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY,
    MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND,
  ].includes(behandlingstema),
);
