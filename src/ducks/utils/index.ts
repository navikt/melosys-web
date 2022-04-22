import { ErrorResponse } from "melosys-api";

import { STATUS } from "../../services";

export const hentFeilmeldinger = (res: ErrorResponse | undefined, reduxStatus: string) => {
  if (res && res.feilkoder && reduxStatus === STATUS.ERROR) {
    return res.feilkoder;
  }
  if (res && res.message && reduxStatus === STATUS.ERROR) {
    return res.message;
  }
  return [];
};
