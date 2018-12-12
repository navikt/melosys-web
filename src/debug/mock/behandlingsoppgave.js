/* eslint-disable */
const sakstyper = {
  EU_EOS: true,
  TRYGDEAVTALE: true,
  FTRL: true,
};
const behandlingstyper = {
  SOEKNAD: true,
  UNNTAK_FRA_MEDLEMSKAP: false,
  KLAGE: true,
  NY_VURDERING: false,
  PAASTAND_UTL: false,
};

export const behandlingsOppgave = {...sakstyper, ...behandlingstyper};
