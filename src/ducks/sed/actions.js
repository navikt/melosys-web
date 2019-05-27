import * as Types from './types';

export const oppdaterBucSedRelasjoner = bucinfo => (
  {
    type: Types.OPPDATER_BUCSEDRELASJONER,
    data: bucinfo,
  }
);

export const oppdaterMottakerinstitusjoner = institusjoner => (
  {
    type: Types.OPPDATER_MOTTAKERINSTITUSJONER,
    data: institusjoner,
  }
);

export const oppdaterSedUnderArbeid = sedUnderArbeid => (
  {
    type: Types.OPPDATER_SEDUNDERARBEID,
    data: sedUnderArbeid,
  }
);
