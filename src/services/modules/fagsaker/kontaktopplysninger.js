import { getAsJson, postAsJson } from '../../utils';
import { API_BASE_URL, FAGSAKER } from '../../api-constants';

export const hent = (saksnr, juridiskorgnr) => {
  const URI_KONTAKTOPPLYSNINGER = `${API_BASE_URL}${FAGSAKER}/${saksnr}/kontaktopplysninger/${juridiskorgnr}`;
  return getAsJson(URI_KONTAKTOPPLYSNINGER);
};

export const send = (saksnr, juridiskorgnr, data) => {
  const URI_KONTAKTOPPLYSNINGER = `${API_BASE_URL}${FAGSAKER}/${saksnr}/kontaktopplysninger/${juridiskorgnr}`;
  return postAsJson(URI_KONTAKTOPPLYSNINGER, data);
};
