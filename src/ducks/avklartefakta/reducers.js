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

// Kun for å holde state i stegvelgeren.
const lagAvklartStateObjekt = (avklartFakta, referanse) => (
  avklartFakta ? {
    ...avklartfaktaMal,
    referanse,
    fakta: [avklartFakta],
  } : null
);

// En faktisk avklart fakta
const lagAvklartfaktaObjekt = (avklarteFakta, avklartefaktaKode) => (
  {
    ...avklartfaktaMal,
    avklartefaktaKode,
    referanse: avklartefaktaKode,
    subjektID: null,
    fakta: [avklarteFakta],
  }
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

const lagBostedsland = (avklarteFakta, referanse, avklartefaktaKode) => (
  {
    ...avklartfaktaMal,
    avklartefaktaKode,
    referanse,
    subjektID: null,
    fakta: [avklarteFakta],
  }
);

const avklarEllerUtledBostedsland = (bostedsland, bosattINorge) => {
  if (bosattINorge) {
    return lagBostedsland('NO', 'BOSTEDSLAND', 'BOSTEDSLAND');
  }

  return lagBostedsland(bostedsland, 'BOSTEDSLAND', 'BOSTEDSLAND');
};

const lagFlagglandObjekt = (avklarteFakta, referanse, avklartefaktaKode, maritimtArbeid) => {
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

const lagArbeidsKonklusjon = (avklarteFakta, referanse, avklartefaktaKode) => (
  {
    ...avklartfaktaMal,
    avklartefaktaKode,
    referanse,
    subjektID: null,
    fakta: [avklarteFakta],
  }
);

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
        lagAvklartfaktaObjekt(dokument.avklartefakta.yrkesgruppe, 'YRKESGRUPPE'),
        lagAvklartStateObjekt(dokument.avklartefakta.yrkesaktivitetAntallLand, 'YRKESAKTIVITET_ANTALL_LAND'),
        lagAvklartStateObjekt(dokument.avklartefakta.yrkesaktivitet, 'YRKESAKTIVITET'),
        avklarEllerUtledBostedsland(dokument.avklartefakta.bostedsland, dokument.vilkar.bosattINorge),
        ...lagSokkelEllerSkipObjekt(dokument.avklartefakta.sokkelEllerSkip, 'SOKKEL_ELLER_SKIP', 'SOKKEL_ELLER_SKIP', dokument.maritimtArbeid),
        ...lagFlagglandObjekt(dokument.avklartefakta.sokkelEllerSkip, 'INSTALLASJON_ARBEIDSLAND', 'FLAGGLAND', dokument.maritimtArbeid),
        lagArbeidsKonklusjon(dokument.avklartefakta.sokkelSkipKonklusjon, 'ARBEID_SOKKEL_SKIP', null, dokument.maritimtArbeid),
      ].filter(fakta => fakta !== null);

      return { ...state, data: [...avklartefakta] };
    }
    default:
      return state;
  }
}
