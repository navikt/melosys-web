import { createSelector, createStructuredSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';

import moment from 'moment';

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

/** InntektLinjer leveres i en array av aarMaaned, men med potensielt flere del-inntekter innenfor en enkelt-
 * måned. Derfor må disse inntektene summeres slik at vi sitter med én totalinntekt pr måned. Deretter kan vi
 * bygge opp en array hvor også måneder som mangler er med (men dermed inntekt === 0)
 *
 */

const lagFlatInntektListe = arbeidsInntektMaanedListe => {
  return arbeidsInntektMaanedListe.reduce((oppsamletMaanedListe, enkeltMaaned) => {
    const { arbeidsInntektInformasjon = {}, aarMaaned } = enkeltMaaned;
    const { inntektListe = [] } = arbeidsInntektInformasjon;

    const inntektListeInnenforEnkeltMaaned = inntektListe.reduce((samling, inntekten) => {
      const { opplysningspliktigID, beloep } = inntekten;

      return [...samling, { opplysningspliktigID, beloep, aarMaaned }];
    }, []);

    return [...oppsamletMaanedListe, ...inntektListeInnenforEnkeltMaaned];
  }, []);
};

const summerDuplikateInntekter = flatInntektListe => {
  return flatInntektListe.reduce((samling, nyInntekt) => {
    const samlingKopi = [...samling];
    const index = samlingKopi.findIndex(element => (element.opplysningspliktigID === nyInntekt.opplysningspliktigID) && element.aarMaaned === nyInntekt.aarMaaned);
    const inntektForInnlegg = index > -1 ? samling[index] : nyInntekt;

    if (index > -1) {
      inntektForInnlegg.beloep += nyInntekt.beloep;
      samlingKopi.splice(index, 1);
    }

    return [...samlingKopi, inntektForInnlegg];
  }, []);
};


export const InntektSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.inntekt : {}),
  state => FaktaavklaringOppholdPeriodeSelector(state),
  (inntekt, periode) => {
    if (!inntekt) return [];

    const { fom: startDato = moment().format('YYYY-MM-DD') } = periode;
    const { arbeidsInntektMaanedListe = [] } = inntekt;

    const flatInntektsListe = lagFlatInntektListe(arbeidsInntektMaanedListe);
    const summDuplikater = summerDuplikateInntekter(flatInntektsListe);

    console.log(summDuplikater);
    return [];
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
  (organisasjoner, arbeidsforholdene, inntekter) => {
    const arbeidsgivere = organisasjoner.reduce((samling, organisasjon) => {
      const filtrerteArbeidsforholdene = arbeidsforholdene.filter(arbeidsforholdet => arbeidsforholdet.opplysningspliktigID === organisasjon.orgnr);
      const filtrerteInntekter = inntekter.filter(inntekt => inntekt.opplysningspliktigID === organisasjon.orgnr);
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

