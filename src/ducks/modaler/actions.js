import * as Types from "./types";

export const oppdaterHenlegg = (data) => ({
  type: Types.OPPDATER_HENLEGG,
  data,
});

export const oppdaterAvsluttSakSomBortfalt = (data) => ({
  type: Types.OPPDATER_AVSLUTT_SAK_SOM_BORTFALT,
  data,
});

export const oppdaterBekreftValg = (data) => ({
  type: Types.OPPDATER_BEKREFT_VALG,
  data,
});

export const oppdaterAvslagSoknad = (data) => ({
  type: Types.OPPDATER_AVSLAG_SOKNAD,
  data,
});

export const oppdaterOppfrisk = (data) => ({
  type: Types.OPPDATER_OPPFRISK,
  data,
});
