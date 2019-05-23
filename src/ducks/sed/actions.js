import * as Types from './types';

export const oppdaterBucinfo = bucinfo => (
  {
    type: Types.OPPDATER_BUCINFO,
    data: bucinfo,
  }
);

export const oppdaterSedUnderArbeid = sedUnderArbeid => (
  {
    type: Types.OPPDATER_SEDUNDERARBEID,
    data: sedUnderArbeid,
  }
);
