import * as QS from 'qs';
import { getAsJson, postAsJson, deleteAsJson } from '../../utils';
import { API_BASE_URL, FAGSAKER } from '../../api-constants';

export const hent = (saksnr, rolleKode, representererKode) => {
  const URI_PATH = `${API_BASE_URL}${FAGSAKER}/${saksnr}/aktoerer`;
  const qs = QS.stringify({ rolleKode, representererKode });

  const URI_AKTOER = qs ? `${URI_PATH}/?${qs}` : URI_PATH;
  return getAsJson(URI_AKTOER);
};

export const send = (saksnr, data) => postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnr}/aktoerer`, data);

export const slett = databaseid => deleteAsJson(`${API_BASE_URL}${FAGSAKER}/aktoerer/${databaseid}`);
