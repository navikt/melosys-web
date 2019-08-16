import * as Types from './types';

export const toggleSkalEndres = () => ({
  type: Types.ENDREPERIODE_SKALENDRES_TOGGLE,
});

export const oppdaterFom = fom => ({
  type: Types.ENDREPERIODE_FOM_UPDATE,
  fom,
});

export const oppdaterTom = tom => ({
  type: Types.ENDREPERIODE_TOM_UPDATE,
  tom,
});

export const oppdaterBegrunnelse = begrunnelse => ({
  type: Types.ENDREPERIODE_BEGRUNNELSE_UPDATE,
  begrunnelse,
});

export const oppdaterFritekst = fritekst => ({
  type: Types.ENDREPERIODE_FRITEKST_UPDATE,
  fritekst,
});
