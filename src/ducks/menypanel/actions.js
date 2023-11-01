import * as Types from "./types";

export const oppdaterVisMenypanel = (data) => ({
  type: Types.OPPDATER_VIS_MENYPANEL,
  data,
});

export const toggleFullmektigEndret = (data) => ({
  type: Types.TOGGLE_FULLMEKTIG_ENDRET,
  data,
});
