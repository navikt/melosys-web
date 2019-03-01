import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

const endepunkt = 'fagsaker/';

export async function hent(saksnr, juridiskorgnr) {
  const URI_JOURNALFORING_OPPGAVE = `${API_BASE_URL}${endepunkt}${saksnr}/kontaktopplysninger/${juridiskorgnr}`;
  return getAsJson(URI_JOURNALFORING_OPPGAVE);
}

export async function send(saksnr, juridiskorgnr, data) {
  const URI_JOURNALFORING_OPPGAVE = `${API_BASE_URL}${endepunkt}${saksnr}/kontaktopplysninger/${juridiskorgnr}`;
  return postAsJson(URI_JOURNALFORING_OPPGAVE, data);
}
