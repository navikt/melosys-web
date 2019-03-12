import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

const endepunkt = 'fagsaker/';

export async function hent(saksnr, rolleKode = '', representererKode = '') {
  const URI_AKTOER = `${API_BASE_URL}${endepunkt}${saksnr}/aktoerer?rolle=${rolleKode}&representerer=${representererKode}`;
  return getAsJson(URI_AKTOER);
}

export async function send(saksnr, data) {
  const URI_AKTOER = `${API_BASE_URL}${endepunkt}${saksnr}/aktoerer`;
  return postAsJson(URI_AKTOER, data);
}
