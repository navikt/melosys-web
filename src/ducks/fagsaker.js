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

/** InntektLinjer leveres gruppert inn i maaned. Denne selectoren gjør derfor en reduce slik at alle inntekter
 * leveres som én array, hvert element er da én inntektLinje.
 *
 * @return { inntekstListe } Et objekt med array for all inntekt.
 */
export const InntektSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.inntekt : {}),
  inntekt => {
    const inntektListe = Array.isArray(inntekt.arbeidsInntektMaanedListe)
      ?
      inntekt.arbeidsInntektMaanedListe.reduce((samling, element) => [...samling, ...element.arbeidsInntektInformasjon.inntektListe], [])
      :
      [];
    return inntektListe;
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
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.bekreftelser : state.fagsaker.data),
  bekreftelser => bekreftelser
);

export const MedlemsskapSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.medlemsskap : state.fagsaker.data),
  medlemsskap => medlemsskap
);
export const OrganisasjonerSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.organisasjoner : []),
  organisasjoner => organisasjoner
);

export const ArbeidsforholdeneSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.arbeidsforhold : []),
  state => OrganisasjonerSelector(state),
  (arbeidsforhold, organisasjoner) => {
    const populertArbeidsforhold = arbeidsforhold.map(item => {
      const arbeid = { ...item };
      arbeid.arbeidsgiver = organisasjoner.find(org => org.orgnr === arbeid.arbeidsgiverID) || {};
      return arbeid;
    });

    return populertArbeidsforhold;
  }
);

/**
 *  Denne er depricated når vi fjerner spikes fra tidlig prototype
 *  */
export const ArbeidsforholdSelector = createSelector(
  (state, arbeidsforholdID) => arbeidsforholdID,
  state => state.fagsaker.data.behandlinger[0].saksopplysninger.arbeidsforhold || [],
  (arbeidsforholdID, arbeidsforhold) =>
    arbeidsforhold.find(
      item => item.arbeidsforholdIDnav.toString() === arbeidsforholdID
    )
);

/** Finner alle organisasjonsnummer som er listet i arbeidsforhold.
 * Det er range i arbeidsforhold som avgjør hvilke organisasjoner som selectoren
 * regner som relevante å vise.
 */
export const OrganisasjonSelector = createSelector(
  state => OrganisasjonerSelector(state),
  state => ArbeidsforholdeneSelector(state),
  (organisasjoner, arbeidsforholdene) => {
    const alleRelevanteOrgnummer = arbeidsforholdene.reduce((samling, element) => [...samling, element.arbeidsgiverID], []);
    const alleRelevanteOrganisasjoner = organisasjoner.filter(item => alleRelevanteOrgnummer.includes(item.orgnummer));
    return alleRelevanteOrganisasjoner;
  }
);

export const OppsummeringSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].oppsummering : {}),
  state => SoknadenSelector(state),
  (oppsummering, soknaden) => ({ ...oppsummering, soknaden })
);

/** Hent alle arbeidsforhold og trekk ut permisjoner. I tillegg skal hver permisjon ha en kopi av arbeidsgiver
 * slik at komponenten enklere kan loope ut hver permisjon med tilhørende arbeidsgiver i en tabell.
 */
export const PermisjonerSelector = createSelector(
  state => ArbeidsforholdeneSelector(state),
  arbeidsforholdene => {
    // Reduce alle permisjoner fra flere arbeidsforhold inn i én array.
    const permisjoner = arbeidsforholdene.reduce((samling, forhold) => {
      // Slå sammen hver permisjon i ett arbeidsforhold med en kopi av kopi av "arbeidstiver"-objektet.
      const permisjonerIForhold = forhold.permisjonOgPermittering.map(permisjon => ({ ...permisjon, arbeidsgiver: forhold.arbeidsgiver }));
      return [...samling, ...permisjonerIForhold];
    }, []);

    return permisjoner;
  }
);
