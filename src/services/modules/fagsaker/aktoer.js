import * as QS from 'qs';
import { getAsJson, postAsJson, deleteAsJson } from '../../utils';
import { API_BASE_URL, FAGSAKER } from '../../api-constants';

export const hentAktoer = (saksnr, rolleKode, representererKode) => {
  const URI_PATH = `${API_BASE_URL}${FAGSAKER}/${saksnr}/aktoerer`;
  const qs = QS.stringify({ rolleKode, representererKode });

  const URI_AKTOER = qs ? `${URI_PATH}/?${qs}` : URI_PATH;
  return getAsJson(URI_AKTOER);
};

export const sendAktoer = (saksnr, data) => {
  const URI_AKTOER = `${API_BASE_URL}${FAGSAKER}/${saksnr}/aktoerer`;
  return postAsJson(URI_AKTOER, data);
};

export const slettAktoer = databaseid => {
  const URI_AKTOER = `${API_BASE_URL}${FAGSAKER}/aktoerer/${databaseid}`;
  return deleteAsJson(URI_AKTOER);
};
