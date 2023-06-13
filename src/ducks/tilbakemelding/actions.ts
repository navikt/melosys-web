import * as Types from "./types";

export const oppdater = (data: Types.Data) => ({
  type: Types.OPPDATER_TILBAKEMELDING,
  data,
});
