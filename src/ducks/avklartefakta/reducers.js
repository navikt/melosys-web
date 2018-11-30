/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */

import { STATUS } from '../../services/utils';
import * as Types from './types';

const initialState = {
  data: [],
  status: STATUS.NOT_STARTED,
};

const avklartfaktaMal = {
  referanse: null,
  avklartefaktaKode: null,
  fakta: [],
  subjektID: null,
  begrunnelseKoder: [],
  begrunnelseFritekst: null,
};

// Et stateObjekt brukes kun for at stegvelger skal kunne gjenskapes basert på
// valg som saksbehandler har gjort. Disse valgene må lagres backend og kunne returneres
// frontend senere, men de er egentlig ikke avklarte fakta.
const lagStateObjekt = (avklartFakta, referanse) => (
  avklartFakta ? {
    ...avklartfaktaMal,
    referanse,
    fakta: [avklartFakta],
  } : null
);

const lagSokkelEllerSkipObjekt = (avklarteFakta, referanse, avklartefaktaKode, maritimtArbeid) => {
  if (!avklarteFakta) { return []; }

  return avklarteFakta.reduce((samling, enkeltAvklaring, index) => {
    const installasjon = maritimtArbeid[index] || {};
    const installasjonsNavn = installasjon.navn || null;
    const begrunnelseKoder = enkeltAvklaring.installasjonsTypeBegrunnelse ? [enkeltAvklaring.installasjonsTypeBegrunnelse] : null;

    return enkeltAvklaring.installasjonsType ? [...samling, {
      ...avklartfaktaMal,
      avklartefaktaKode,
      referanse,
      subjektID: installasjonsNavn,
      begrunnelseKoder,
      fakta: [enkeltAvklaring.installasjonsType],
    }] : [...samling];
  }, []);
};

const lagArbeidslandObjekt = (avklarteFakta, referanse, avklartefaktaKode, maritimtArbeid) => {
  if (!avklarteFakta) { return []; }

  return avklarteFakta.reduce((samling, enkeltAvklaring, index) => {
    const installasjon = maritimtArbeid[index] || {};
    const installasjonsNavn = installasjon.navn || null;

    return enkeltAvklaring.installasjonsType ? [...samling, {
      ...avklartfaktaMal,
      avklartefaktaKode,
      referanse,
      subjektID: installasjonsNavn,
      fakta: [enkeltAvklaring.arbeidsland],
    }] : [...samling];
  }, []);
};

// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK:
      return {
        ...state,
        status: STATUS.OK,
        data: action.data,
      };
    case Types.RESET:
      return { ...initialState };
    case Types.OPPDATER_AVKLARTEFAKTA: {
      const { dokument } = action;
      const avklartefakta = [
        ...dokument.avklartefakta.oppholdsland,
        ...dokument.avklartefakta.arbeidsgivere,
        lagStateObjekt(dokument.avklartefakta.sysselsetting, 'SYSSELSETTING'),
        lagStateObjekt(dokument.avklartefakta.yrkesaktivitetAntallLand, 'YRKESAKTIVITET_ANTALL_LAND'),
        lagStateObjekt(dokument.avklartefakta.yrkesaktivitet, 'YRKESAKTIVITET'),
        ...lagSokkelEllerSkipObjekt(dokument.avklartefakta.sokkelEllerSkip, 'SOKKEL_ELLER_SKIP', 'SOKKEL_ELLER_SKIP', dokument.maritimtArbeid),
        ...lagArbeidslandObjekt(dokument.avklartefakta.sokkelEllerSkip, 'INSTALLASJON_ARBEIDSLAND', 'ARBEIDSLAND', dokument.maritimtArbeid),
      ].filter(fakta => fakta !== null);

      return { ...state, data: [...avklartefakta] };
    }
    default:
      return state;
  }
}
