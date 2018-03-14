import { createSelector, createStructuredSelector } from 'reselect';
import moment from 'moment';

import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';

import { FaktaavklaringOppholdPeriodeSelector } from './faktaavklaring';

// Actions
const OK = 'fagsaker/OK';
const FEILET = 'fagsaker/FEILET';
const PENDING = 'fagsaker/PENDING';

const initialState = {
  data: {},
  status: STATUS.NOT_STARTED,
};

// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case PENDING:
      return { ...state, status: STATUS.PENDING };
    case FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case OK:
      return {
        ...state,
        status: STATUS.OK,
        data: action.data,
      };
    default:
      return state;
  }
}

// Action Creators
export function hentFagsaker(snr) {
  return doThenDispatch(() => Api.hentFagsaker(snr), {
    OK,
    FEILET,
    PENDING,
  });
}

export function opprettNyFagsak(fnr) {
  return doThenDispatch(() => Api.opprettNyFagsak(fnr), {
    OK,
    FEILET,
    PENDING,
  });
}

// selector(s)
export const PersonSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.person : state.fagsaker.data),
  person => person
);

export const OrganisasjonerSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.organisasjoner : []),
  organisasjoner => organisasjoner || []
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
 * Inntekt er nøstet inn i måned og deretter en blanding av flere typer fra samme
 * opplysningspliktigID og forskjellige opplysningspliktigID. I tillegg er det mye data
 * som vi ikke har behov for. For å kunne gjøre fremtidige filtreringer ønsker vi å omforme
 * den opprinnelige modellen til en flatere modell:
 *
 * [{ opplysningspliktigID: '123456789', beloep: 100000, aarMaaned: '2017-18' }]
 *
 * @param arbeidsInntektMaanedListe Det opprinnelige objektet for inntekten.
 */
const lagFlatInntektListe = arbeidsInntektMaanedListe => (
  arbeidsInntektMaanedListe.reduce((samling, enkeltMaaned) => {
    const { arbeidsInntektInformasjon = {}, aarMaaned } = enkeltMaaned;
    const { inntektListe = [] } = arbeidsInntektInformasjon;

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

    // Dersom ingen eksisterende inntekt på opplysningspliktigID ble funnet vil eksisterendeInntektFunnetVedIndeks være 0
    // og samlingen vil dermed ikke påvirkes av filteret nedenfor
    const nySamling = samling.filter((enkelt, indeks) => indeks !== eksisterendeInntektFunnetVedIndeks);

    return [...nySamling, nyEnkeltInntekt];
  }, [])
);

/** Denne funksjonen filtrerer inntekten på siste 6 måneder fra startdato og
 * sprer den over tilsvarende måneder slik at evt manglende inntektsdata vises som beloep:0 for den
 * aktuelle måneden.
 *
 * @param startDato Startdatoen for når vi teller bakover.
 * @param orgnr Organisasjonsnummmeret som det filtreres på.
 * @param inntekter Listen over ufiltrerte inntekter.
 * @returns {any[]}
 */
const filtrerOgSpreInntekt = (startDato, orgnr, inntekter) => {
  const filtrerteInntekterFraOpplysningspliktig = inntekter.filter(inntekt => inntekt.opplysningspliktigID === orgnr);

  return Array(6).fill({}).map((val, index) => {
    const aarMaaned = moment(startDato).subtract(index, 'months').format('YYYY-MM');
    const inntektIndex = filtrerteInntekterFraOpplysningspliktig.findIndex(inn => inn.aarMaaned === aarMaaned);
    return inntektIndex > -1 ? filtrerteInntekterFraOpplysningspliktig[inntektIndex] : { aarMaaned, beloep: 0, opplysningspliktigID: orgnr };
  });
};

export const InntektSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.inntekt : {}),
  inntekt => {
    if (!inntekt) return [];

    const { arbeidsInntektMaanedListe = [] } = inntekt;

    const flatInntektsListe = lagFlatInntektListe(arbeidsInntektMaanedListe);
    return summerInntektsTyperFraSammeOpplysningspliktig(flatInntektsListe);
  }
);

export const SoknadenSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.soknaden : state.fagsaker.data),
  soknaden => soknaden
);

export const InntektSoknadenSelector = createStructuredSelector({
  inntekt: InntektSelector,
  soknaden: SoknadenSelector,
});

export const BekreftelserSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? {} : {}),
  bekreftelser => bekreftelser
);

export const MedlemskapSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.medlemskap : {}),
  medlemskap => {
    // Medlemskapskoder fra kodeverk
    const PERIODE_MED_MEDLEMSKAP = 'PMMEDSKP';
    const PERIODE_UTEN_MEDLEMSKAP = 'PUMEDSKP';
    const GYLDIG_MEDLEMSKAP = 'GYLD';
    const AVVIST_MEDLEMSKAP = 'AVST';
    const UAVKLART_MEDLEMSKAP = 'UAVK';

    const { medlemsperiode = [] } = medlemskap;
    return {
      perioderMed: medlemsperiode.filter(periode => periode.type.kode === PERIODE_MED_MEDLEMSKAP && periode.status.kode === GYLDIG_MEDLEMSKAP),
      perioderUten: medlemsperiode.filter(periode => periode.type.kode === PERIODE_UTEN_MEDLEMSKAP),
      perioderUavklart: medlemsperiode.filter(periode => periode.status.kode === UAVKLART_MEDLEMSKAP),
      perioderAvvist: medlemsperiode.filter(periode => periode.status.kode === AVVIST_MEDLEMSKAP),
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
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.arbeidsforhold : []),
  state => OrganisasjonerSelector(state),
  state => InntektSelector(state),
  (arbeidsforhold = [], organisasjoner = [], inntekt = []) => (arbeidsforhold.map(item => {
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
    const alleRelevanteOrganisasjoner = organisasjoner.filter(item => alleRelevanteOrgnummer.includes(item.orgnr));
    return alleRelevanteOrganisasjoner;
  }
);

export const ArbeidsgivereNorgeSelector = createSelector(
  state => OrganisasjonerSelector(state),
  state => ArbeidsforholdeneSelector(state),
  state => InntektSelector(state),
  state => FaktaavklaringOppholdPeriodeSelector(state),
  (organisasjoner, arbeidsforholdene, inntekter, periode) => {
    const { fom: startDato = moment().format('YYYY-MM-DD') } = periode;
    const arbeidsgivere = organisasjoner.reduce((samling, organisasjon) => {
      const filtrerteArbeidsforholdene = arbeidsforholdene.filter(arbeidsforholdet => arbeidsforholdet.opplysningspliktigID === organisasjon.orgnr);
      const filtrerteInntekter = filtrerOgSpreInntekt(startDato, organisasjon.orgnr, inntekter);
      return ([...samling, { organisasjon, arbeidsforholdene: filtrerteArbeidsforholdene, inntektListe: filtrerteInntekter }]);
    }, [])
      .filter(arbeidsgiver => arbeidsgiver.arbeidsforholdene.length > 0 || arbeidsgiver.inntektListe.length > 0);
    return arbeidsgivere;
  }
);

export const OppsummeringSelector = createSelector(
  state => (state.fagsaker.data ? state.fagsaker.data : {}),
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].oppsummering : []),
  (saksdata, behandlingsdata) => ({
    saksnummer: saksdata.saksnummer,
    behandlingID: behandlingsdata.behandlingID,
    type: saksdata.type,
    status: behandlingsdata.status,
    registrertDato: behandlingsdata.registrertDato,
  })
);

