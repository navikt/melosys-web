/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */

import { STATUS } from '../../services/utils';
import * as Utils from '../../utils';
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
  } : Types.NULL
);

// En faktisk avklart fakta
const lagAvklartfaktaObjekt = (avklarteFakta, avklartefaktaKode) => {
  if (Utils._isNil(avklarteFakta)) {
    return Types.NULL;
  }
  return {
    ...avklartfaktaMal,
    avklartefaktaKode,
    referanse: avklartefaktaKode,
    subjektID: null,
    fakta: [avklarteFakta],
  };
};

const lagAvklartfaktaObjektMedReferanse = (avklarteFakta, referanse, avklartefaktaKode) => {
  if (Utils._isUndefined(avklarteFakta)) {
    return Types.NULL;
  }
  return {
    ...avklartfaktaMal,
    avklartefaktaKode,
    referanse,
    subjektID: null,
    fakta: [avklarteFakta],
  };
};

const lagSokkelEllerSkipObjekt = (referanse, avklartefaktaKode, maritimtArbeid) => (
  maritimtArbeid.reduce((samling, installasjon = {}) => {
    const installasjonsNavn = installasjon.navn || Types.NULL;

    const { sokkelEllerSkip } = installasjon;
    const installasjonsType = sokkelEllerSkip ? sokkelEllerSkip.installasjonsType : Types.NULL;
    const begrunnelseKoder = sokkelEllerSkip ? [sokkelEllerSkip.installasjonsTypeBegrunnelse] : Types.NULL;

    return installasjonsType ? [
      ...samling,
      {
        ...avklartfaktaMal,
        avklartefaktaKode,
        referanse,
        subjektID: installasjonsNavn,
        begrunnelseKoder,
        fakta: [installasjonsType],
      },
    ] : [...samling];
  }, [])
);

const avklarEllerUtledBostedsland = (bostedsland, bosattINorge) => {
  if (bosattINorge) {
    return lagAvklartfaktaObjektMedReferanse('NO', 'BOSTEDSLAND', 'BOSTEDSLAND');
  }
  return lagAvklartfaktaObjektMedReferanse(bostedsland, 'BOSTEDSLAND', 'BOSTEDSLAND');
};

const lagFlagglandObjekt = (referanse, avklartefaktaKode, maritimtArbeid) => (
  maritimtArbeid.reduce((samling, installasjon = {}) => {
    const installasjonsNavn = installasjon.navn || Types.NULL;

    const { sokkelEllerSkip } = installasjon;
    const installasjonsType = sokkelEllerSkip ? sokkelEllerSkip.installasjonsType : Types.NULL;
    const arbeidsland = sokkelEllerSkip ? sokkelEllerSkip.arbeidsland : Types.NULL;

    return installasjonsType ? [...samling, {
      ...avklartfaktaMal,
      avklartefaktaKode,
      referanse,
      subjektID: installasjonsNavn,
      fakta: [arbeidsland],
    }] : [...samling];
  }, [])
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
        ...dokument.avklartefakta.soknadsland,
        ...dokument.avklartefakta.virksomheter,
        lagAvklartfaktaObjekt(dokument.avklartefakta.yrkesgruppe, 'YRKESGRUPPE'),
        lagAvklartStateObjekt(dokument.avklartefakta.yrkesaktivitetAntallLand, 'YRKESAKTIVITET_ANTALL_LAND'),
        lagAvklartStateObjekt(dokument.avklartefakta.yrkesaktivitet, 'YRKESAKTIVITET'),
        avklarEllerUtledBostedsland(dokument.avklartefakta.bostedsland, dokument.vilkar.bosattINorge),
        ...lagSokkelEllerSkipObjekt('SOKKEL_ELLER_SKIP', 'SOKKEL_ELLER_SKIP', dokument.maritimtArbeid),
        ...lagFlagglandObjekt('INSTALLASJON_ARBEIDSLAND', 'ARBEIDSLAND', dokument.maritimtArbeid),
        lagAvklartfaktaObjekt(dokument.avklartefakta.sokkelSkipKonklusjon, 'ARBEID_SOKKEL_SKIP'),
      ].filter(fakta => fakta !== Types.NULL);

      return { ...state, data: [...avklartefakta] };
    }
    default:
      return state;
  }
}
