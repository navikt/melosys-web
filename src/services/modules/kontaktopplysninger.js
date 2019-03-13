import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

export async function hent(saksnr, juridiskorgnr) {
  const URI_KONTAKTOPPLYSNINGER = `${API_BASE_URL}fagsaker/${saksnr}/kontaktopplysninger/${juridiskorgnr}`;
  return getAsJson(URI_KONTAKTOPPLYSNINGER);
}

export async function send(saksnr, juridiskorgnr, data) {
  const URI_KONTAKTOPPLYSNINGER = `${API_BASE_URL}fagsaker/${saksnr}/kontaktopplysninger/${juridiskorgnr}`;
  return postAsJson(URI_KONTAKTOPPLYSNINGER, data);
}
