import { createSelector, createStructuredSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';

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
// selector(s)
export const PersonSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.person : state.fagsaker.data),
  person => person
);

export const OrganisasjonerSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.organisasjoner : []),
  organisasjoner => organisasjoner || []
);

/** InntektLinjer leveres gruppert inn i maaned. Denne selectoren gjør derfor en reduce slik at alle inntekter
 * leveres som én array, hvert element er da én inntektLinje. I tillegg hekter den på "virksomhet"-objekt
 * fra organisasjoner-selector slik at navnet på organisasjonen kan listes.
 *
 * @return Inntektliste Et objekt med array for all inntekt.
 */
export const InntektSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.inntekt : {}),
  inntekt => {
    if (!inntekt) return [];

    const { arbeidsInntektMaanedListe = [] } = inntekt;

    return arbeidsInntektMaanedListe
      .reduce((samling, element) => {
        const { arbeidsInntektInformasjon = {} } = element;
        const inntektListe = arbeidsInntektInformasjon.inntektListe ? arbeidsInntektInformasjon.inntektListe : [];
        const subInntektliste = [...inntektListe];
        return ([...samling, ...subInntektliste]);
      }, []);
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
  medlemskap => medlemskap || {}
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
      .filter(arbeidsgiver => arbeidsgiver.arbeidsforholdene.length > 0);
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

