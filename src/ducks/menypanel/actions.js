import * as Types from "./types";

export const oppdaterVisMenypanel = (data) => ({
  type: Types.OPPDATER_VIS_MENYPANEL,
  data,
});

export const setErFullmektigEndret = (data) => ({
  type: Types.OPPDATER_ER_FULLMEKTIG_ENDRET,
  data,
});
