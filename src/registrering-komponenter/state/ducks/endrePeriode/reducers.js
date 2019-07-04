import * as MKV from 'melosys-kodeverk';
import * as Types from './types';

export const initialState = {
  skalEndres: false,
  fom: '',
  tom: '',
  begrunnelse: MKV.Koder.folketrygdloven.begrunnelser_endret_unntaksperiode.PERIODE_FEILREGISTERT,
  fritekst: '',
};

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case Types.ENDREPERIODE_SKALENDRES_TOGGLE:
      return {
        ...state,
        skalEndres: !state.skalEndres,
      };
    case Types.ENDREPERIODE_FOM_UPDATE:
      return {
        ...state,
        fom: action.fom,
      };
    case Types.ENDREPERIODE_TOM_UPDATE:
      return {
        ...state,
        tom: action.tom,
      };
    case Types.ENDREPERIODE_BEGRUNNELSE_UPDATE:
      return {
        ...state,
        begrunnelse: action.begrunnelse,
      };
    case Types.ENDREPERIODE_FRITEKST_UPDATE:
      return {
        ...state,
        fritekst: action.fritekst,
      };
    default:
      return state;
  }
};
