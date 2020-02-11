import * as Types from './types';

export const oppdaterHenlegg = data => ({
  type: Types.OPPDATER_HENLEGG,
  data,
});

export const oppdaterAvsluttSakSomBortfalt = data => ({
  type: Types.OPPDATER_AVSLUTT_SAK_SOM_BORTFALT,
  data,
});

export const oppdaterAvslagSoknad = data => ({
  type: Types.OPPDATER_AVSLAG_SOKNAD,
  data,
});

export const oppdaterOppfrisk = data => ({
  type: Types.OPPDATER_OPPFRISK,
  data,
});

export const oppdaterValidering = data => ({
  type: Types.OPPDATER_VALIDERING,
  data,
});

export const oppdaterOppfriskningBlokkererInnhold = data => ({
  type: Types.OPPDATER_OPPFRISKNING_BLOKKERER_INNHOLD,
  data,
});

export const oppdaterRevurderVedtak = data => ({
  type: Types.OPPDATER_REVURDER_VEDTAK,
  data,
});
