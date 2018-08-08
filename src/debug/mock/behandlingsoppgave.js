/* eslint-disable */
const sakstyper = {
  EU_EOS: true,
  TRG_AVT: true,
  FLK_TRG: true,
};
const behandlingstyper = {
  SKND: true,
  UFM: false,
  KLG: true,
  REV: false,
  ML_U: true,
  PS_U: false,
};

export const behandlingsOppgave = {...sakstyper, ...behandlingstyper};
