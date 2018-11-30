import { getAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

const sjekkStatus = async behandlingID => {
  const SAKSOPPLYSNIINGER_OPPFRISKNING_STATUS = `${API_BASE_URL}saksopplysninger/oppfriskning/${behandlingID}/status`;
  return getAsJson(SAKSOPPLYSNIINGER_OPPFRISKNING_STATUS);
};

const oppfrisk = async behandlingID => {
  const SAKSOPPLYSNIINGER_OPPFRISKNING = `${API_BASE_URL}saksopplysninger/oppfriskning/${behandlingID}`;
  return getAsJson(SAKSOPPLYSNIINGER_OPPFRISKNING);
};
export {
  sjekkStatus,
  oppfrisk,
};
