import qs from "qs";

import { getAsJson } from "../utils";
import { API_BASE_URL, SAKSOPPLYSNINGER } from "../api-constants";

export const oppfrisk = (behandlingID, options = {}) => {
  const params = qs.stringify(options);
  return getAsJson(`${API_BASE_URL}${SAKSOPPLYSNINGER}/oppfriskning/${behandlingID}${params ? `?${params}` : ""}`);
};

export const sjekkStatus = async (behandlingID) => {
  const SAKSOPPLYSNIINGER_OPPFRISKNING_STATUS = `${API_BASE_URL}saksopplysninger/oppfriskning/${behandlingID}/status`;
  return getAsJson(SAKSOPPLYSNIINGER_OPPFRISKNING_STATUS);
};
