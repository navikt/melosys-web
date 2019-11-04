/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';
import moment from 'moment/moment';
import * as MKV from 'melosys-kodeverk';

import { datoDiff } from '../../utils/dato';
import * as KV from '../../kodeverk';
import * as soknadSelectors from '../soknad/selectors';
import { anmodningsperioderSelectors } from '../anmodningsperioder';

/* eslint import/prefer-default-export:"off" */
export const BehandlingerSelector = createSelector(
  state => (state.behandlinger.data ? state.behandlinger.data : {}),
  behandling => behandling
);
export const BehandlingIDSelector = createSelector(
  state => BehandlingerSelector(state).behandlingID || -1,
  behandlingID => behandlingID
);
export const OppsummeringSelector = createSelector(
  state => BehandlingerSelector(state).oppsummering || {},
  oppsummering => oppsummering
);
export const BehandlingstypeKodeSelector = createSelector(
  OppsummeringSelector,
  oppsummering => (oppsummering.behandlingstype ? oppsummering.behandlingstype.kode : '')
);

export const ErArtikkel16AnmodningSendtSelector = createSelector(
  anmodningsperioderSelectors.AlleAnmodningsperioderSendtUtlandSelector,
  anmodningsperioderSendtUtland => anmodningsperioderSendtUtland
);

export const SaksopplysningerSelector = createSelector(
  state => BehandlingerSelector(state).saksopplysninger || {},
  saksopplysninger => saksopplysninger
);
export const SakOgBehandlingSelector = createSelector(
  state => SaksopplysningerSelector(state).sakOgBehandling || {},
  sakOgBehandling => sakOgBehandling
);
export const PersonSelector = createSelector(
  state => SaksopplysningerSelector(state).person || {},
  person => person
);
export const PersonhistorikkSelector = createSelector(
  state => SaksopplysningerSelector(state).personhistorikk || {},
  personhistorikk => personhistorikk
);

export const SEDSelector = createSelector(
  state => SaksopplysningerSelector(state).sed || {},
  sed => sed
);
export const LovvalgsperiodeSelector = createSelector(state => SEDSelector(state).lovvalgsperiode || {}, lovvalgsperiode => lovvalgsperiode);

const landkodeTilKodeverksobjekt = landkode => KV.kodeTilObjekt(landkode, MKV.KTObjects.landkoder);
export const LovvalgslandSelector = createSelector(
  state => SEDSelector(state).lovvalgslandKode || '',
  lovvalgsland => landkodeTilKodeverksobjekt(lovvalgsland) || {}
);

export const OrganisasjonerSelector = createSelector(
  state => SaksopplysningerSelector(state).organisasjoner || [],
  organisasjoner => organisasjoner
);

export const ArbeidsforholdSelector = createSelector(
  state => SaksopplysningerSelector(state).arbeidsforhold || [],
  arbeidsforhold => arbeidsforhold
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
const lagFlatInntektListe = arbeidsInntektMaanedListe => (
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
  }, [])
);

/**
 * Inntekter fra samme opplysningspliktigID kan ha flere typer og dermed komme inn som
 * separate objekter. Type inntekt kan være 'lønnsinntekt', 'bonusinntekt', 'feriepenger' etc.
 * Navn på typene er ikke viktige, men vi ønsker bare å vise én inntektssum fra samme opplysningspliktigID
 * i en enkelt måned.
 *
 * Funksjonen nedenfor traverserer alle intekter og summerer de som kommer fra samme opplysningspliktigID.
 * @param flatInntektListe Den flate inntektslisten som inneholder alle del-inntekter.
 */
const summerInntektsTyperFraSammeOpplysningspliktig = flatInntektListe => (
  flatInntektListe.reduce((samling, enkeltInntekt) => {
    const eksisterendeInntektFunnetVedIndeks = samling
      .findIndex(element => (element.opplysningspliktigID === enkeltInntekt.opplysningspliktigID) && element.aarMaaned === enkeltInntekt.aarMaaned);

    const nyEnkeltInntekt = eksisterendeInntektFunnetVedIndeks > -1 ? samling[eksisterendeInntektFunnetVedIndeks] : enkeltInntekt;
    nyEnkeltInntekt.beloep = eksisterendeInntektFunnetVedIndeks > -1 ? nyEnkeltInntekt.beloep + enkeltInntekt.beloep : nyEnkeltInntekt.beloep;
    nyEnkeltInntekt.beloep = Math.max(nyEnkeltInntekt.beloep, 0);

    // Dersom ingen eksisterende inntekt på opplysningspliktigID ble funnet vil eksisterendeInntektFunnetVedIndeks være 0
    // og samlingen vil dermed ikke påvirkes av filteret nedenfor
    const nySamling = samling.filter((enkelt, indeks) => indeks !== eksisterendeInntektFunnetVedIndeks);

    return [...nySamling, nyEnkeltInntekt];
  }, [])
);

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
  const filtrerteInntekterFraOpplysningspliktig = inntekter.filter(inntekt => inntekt.opplysningspliktigID === orgnr);
  if (filtrerteInntekterFraOpplysningspliktig.length === 0) { return []; }

  const startDato = relevantPeriode.fom;
  const antallMaaneder = parseInt(datoDiff(relevantPeriode.fom, relevantPeriode.tom, 'months'), 10) + 1;

  if (relevantPeriode.fom === 'Invalid date' || relevantPeriode.tom === 'Invalid date') { return ([]); }

  return Array(antallMaaneder).fill({}).map((verdi, index) => {
    const aarMaaned = moment(startDato).add(index, 'months').format('YYYY-MM');

    const eksisterendeInntektFunnetVedIndeks = filtrerteInntekterFraOpplysningspliktig.findIndex(enkeltInntekt => enkeltInntekt.aarMaaned === aarMaaned);

    return eksisterendeInntektFunnetVedIndeks > -1
      ?
      filtrerteInntekterFraOpplysningspliktig[eksisterendeInntektFunnetVedIndeks]
      :
      { aarMaaned, beloep: 0, opplysningspliktigID: orgnr };
  });
};

export const InntektSelector = createSelector(
  state => SaksopplysningerSelector(state).inntekt || {},
  inntekt => inntekt
);

// {inntekt:[{opplysningspliktigID: "973063804", beloep: 30000, aarMaaned: "2017-12"}]}
export const InntekterPrAarMaanedSelector = createSelector(
  state => SaksopplysningerSelector(state).inntekt || {},
  inntekt => {
    if (!inntekt) return [];
    const { arbeidsInntektMaanedListe } = inntekt;
    if (!arbeidsInntektMaanedListe) return [];

    const flatInntektsListe = lagFlatInntektListe(arbeidsInntektMaanedListe);
    return summerInntektsTyperFraSammeOpplysningspliktig(flatInntektsListe);
  }
);

export const BekreftelserSelector = createSelector(
  state => (state.behandlinger.data ? {} : {}),
  bekreftelser => bekreftelser
);

export const MedlemskapSelector = createSelector(
  state => (state.behandlinger.data && state.behandlinger.data.saksopplysninger ? state.behandlinger.data.saksopplysninger.medlemskap : {}),
  medlemskap => {
    // Medlemskapskoder fra kodeverk
    const PERIODE_MED_MEDLEMSKAP = 'PMMEDSKP';
    const PERIODE_UTEN_MEDLEMSKAP = 'PUMEDSKP';
    const GYLDIG_MEDLEMSKAP = 'GYLD';
    const UAVKLART_MEDLEMSKAP = 'UAVK';
    const AVVIST_MEDLEMSKAP = 'AVST';

    const { medlemsperiode } = medlemskap;
    if (!medlemsperiode) return null;

    return {
      perioderMed: medlemsperiode.filter(periode => KV.objektTilKode(periode.periodetype) === PERIODE_MED_MEDLEMSKAP && KV.objektTilKode(periode.status) === GYLDIG_MEDLEMSKAP),
      perioderUten: medlemsperiode.filter(periode => KV.objektTilKode(periode.periodetype) === PERIODE_UTEN_MEDLEMSKAP && KV.objektTilKode(periode.status) !== AVVIST_MEDLEMSKAP),
      perioderUavklart: medlemsperiode.filter(periode => KV.objektTilKode(periode.status) === UAVKLART_MEDLEMSKAP),
    };
  }
);

/**
 * Arbeidsforhold refererer til organisasjon med arbeidsforholdID. For at komponenten skal kunne vise
 * navn på arbeidsgiver og evt adresse etc må dette flettes inn i arbeidsforhold. Selectoren gjør en map p
 * alle arbeidsforhold og finner relevant organisasjon etter orgnr og setter hele dette objektet inn
 * i arbeidsforholdet dersom det finnes.
 */
export const ArbeidsforholdeneSelector = createSelector(
  state => ArbeidsforholdSelector(state),
  state => OrganisasjonerSelector(state),
  state => InntekterPrAarMaanedSelector(state),
  (arbeidsforhold, organisasjoner, inntekt) => (arbeidsforhold.map(item => {
    if (!arbeidsforhold || !organisasjoner || !inntekt) return [];
    const arbeid = { ...item };
    arbeid.arbeidsgiver = organisasjoner.find(org => org.orgnr === arbeid.arbeidsgiverID) || {};
    arbeid.inntekt = inntekt.filter(linje => linje.opplysningspliktigID === arbeid.arbeidsgiverID) || [];
    return arbeid;
  }))
);
/** Finner alle organisasjonsnummer som er listet i arbeidsforhold.
 * Det er range i arbeidsforhold som avgjør hvilke organisasjoner som selectoren
 * regner som relevante å vise.
 */
export const OrganisasjonSelector = createSelector(
  state => OrganisasjonerSelector(state),
  state => ArbeidsforholdeneSelector(state),
  (organisasjoner, arbeidsforholdene) => {
    // Lag en array med orgnummer (arbeidsgiverID)
    const alleRelevanteOrgnummer = arbeidsforholdene.reduce((samling, element) => [...samling, element.arbeidsgiverID], []);
    // Filter organisasjoner hvis orgnr er inkludert i arrayen alleRelevanteOrgnummer.
    return organisasjoner.filter(item => alleRelevanteOrgnummer.includes(item.orgnr));
  }
);
/** Hjelpefunksjon for ArbeidsgivereNorgeSelector. Funksjonen bygger en ny gruppe av et arbeidsforhold
 * med arbeidsforholdene (array), inntekter (array) og organisasjonen (objekt)
 * @param arbeidsforholdet
 * @param organisasjoner
 * @param inntekter
 * @param relevantPeriode
 * @returns {{arbeidsforholdene: *[], organisasjon: *, inntekter: any[]}}
 */
const byggNyArbeidsforholdGruppe = (arbeidsforholdet, organisasjoner, inntekter, relevantPeriode) => (
  {
    arbeidsforholdene: [arbeidsforholdet],
    organisasjon: organisasjoner.find(org => org.orgnr === arbeidsforholdet.opplysningspliktigID) || {},
    inntektListe: filtrerOgSpreInntekt(relevantPeriode, arbeidsforholdet.opplysningspliktigID, inntekter),
  }
);

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
  state => OrganisasjonerSelector(state),
  state => ArbeidsforholdeneSelector(state),
  state => InntekterPrAarMaanedSelector(state),
  state => soknadSelectors.SoknadsperiodeSelector(state),
  (organisasjoner, arbeidsforholdene, inntekter, oppholdsPeriode) => {
    // Inntekten skal vises 6 måneder forut for startdato. Dersom søknaden gjelder en periode
    // tilbake i tid, skal også inntekt i selve perioden vises.

    const { fom: soknadPeriodeStart, tom: soknadPeriodeSlutt } = oppholdsPeriode;
    if (!soknadPeriodeStart && !soknadPeriodeSlutt) { return []; }

    const relevantPeriodeStart = moment(soknadPeriodeStart, 'YYYY-MM-DD')
      .subtract(6, 'months')
      .format('YYYY-MM-DD');

    let relevantPeriodeSlutt = moment(soknadPeriodeSlutt, 'YYYY-MM-DD') < moment() ? soknadPeriodeSlutt : moment().format('YYYY-MM-DD');
    if (moment(relevantPeriodeSlutt, 'YYYY-MM-DD').isBefore(moment(soknadPeriodeStart, 'YYYY-MM-DD'))) relevantPeriodeSlutt = soknadPeriodeStart;

    const relevantPeriode = {
      fom: relevantPeriodeStart,
      tom: relevantPeriodeSlutt,
    };

    return arbeidsforholdene.reduce((samling, arbeidsforholdet) => {
      const tmpSamling = [...samling];

      // Sjekk om det allerede er laget en gruppe for den aktuelle opplysningspliktigID.
      const arbeidsforholdEksistererVedIndeks = samling
        .findIndex(enkelt =>
          enkelt.arbeidsforholdene.some(enkeltforhold =>
            enkeltforhold.opplysningspliktigID === arbeidsforholdet.opplysningspliktigID));

      if (arbeidsforholdEksistererVedIndeks > -1) {
        tmpSamling[arbeidsforholdEksistererVedIndeks].arbeidsforholdene.push(arbeidsforholdet);
      } else {
        tmpSamling.push(byggNyArbeidsforholdGruppe(arbeidsforholdet, organisasjoner, inntekter, relevantPeriode));
      }
      return tmpSamling;
    }, []);
  }
);

