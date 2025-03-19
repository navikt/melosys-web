import qs from "qs";

import { getAsJson, postAsJson } from "../utils";
import { API_BASE_URL, SAKSOPPLYSNINGER } from "../api-constants";

export const oppfrisk = (behandlingID, options = {}) => {
  const params = qs.stringify(options);
  return getAsJson(`${API_BASE_URL}${SAKSOPPLYSNINGER}/oppfriskning/${behandlingID}${params ? `?${params}` : ""}`);
};

export const oppfriskSaksopplysningerForAarsavregning = (behandlingID) => {
  return postAsJson(`${API_BASE_URL}${SAKSOPPLYSNINGER}/oppfriskning/aarsavregning/${behandlingID}`);
};
