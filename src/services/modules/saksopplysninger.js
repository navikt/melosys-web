import { getAsJson } from '../utils';
import { API_BASE_URL, SAKSOPPLYSNINGER } from '../api-constants';

export const sjekkStatus = behandlingID => {
  const SAKSOPPLYSNIINGER_OPPFRISKNING_STATUS = `${API_BASE_URL}${SAKSOPPLYSNINGER}/oppfriskning/${behandlingID}/status`;
  return getAsJson(SAKSOPPLYSNIINGER_OPPFRISKNING_STATUS);
};

export const oppfrisk = behandlingID => {
  const SAKSOPPLYSNIINGER_OPPFRISKNING = `${API_BASE_URL}${SAKSOPPLYSNINGER}/oppfriskning/${behandlingID}`;
  return getAsJson(SAKSOPPLYSNIINGER_OPPFRISKNING);
};

