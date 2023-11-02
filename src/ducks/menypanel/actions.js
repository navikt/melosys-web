import * as Types from "./types";

export const oppdaterVisMenypanel = (data) => ({
  type: Types.OPPDATER_VIS_MENYPANEL,
  data,
});

export const oppdaterErFullmektigEndret = (data) => ({
  type: Types.OPPDATER_ER_FULLMEKTIG_ENDRET,
  data,
});
