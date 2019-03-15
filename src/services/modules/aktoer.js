import * as QS from 'qs';
import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

export async function hent(saksnr, rolleKode, representererKode) {
  const URI_PATH = `${API_BASE_URL}fagsaker/${saksnr}/aktoerer`;
  const qs = QS.stringify({ rolleKode, representererKode });

  const URI_AKTOER = qs ? `${URI_PATH}/?${qs}` : URI_PATH;
  return getAsJson(URI_AKTOER);
}

export async function send(saksnr, data) {
  const URI_AKTOER = `${API_BASE_URL}fagsaker/${saksnr}/aktoerer`;
  return postAsJson(URI_AKTOER, data);
}
