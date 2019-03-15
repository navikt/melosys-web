import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

export async function hent(saksnr, rolleKode, representererKode) {
  const sporsmaltegn = rolleKode || representererKode ? '?' : '';
  const rolleKodeParam = rolleKode ? `rolle=${rolleKode}` : '';
  const and = rolleKode && representererKode ? '&' : '';
  const representererKodeParam = representererKode ? `representerer=${representererKode}` : '';

  const URI_AKTOER = `${API_BASE_URL}fagsaker/${saksnr}/aktoerer${sporsmaltegn}${rolleKodeParam}${and}${representererKodeParam}`;
  return getAsJson(URI_AKTOER);
}

export async function send(saksnr, data) {
  const URI_AKTOER = `${API_BASE_URL}fagsaker/${saksnr}/aktoerer`;
  return postAsJson(URI_AKTOER, data);
}
