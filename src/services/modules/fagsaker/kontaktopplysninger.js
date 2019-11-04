import { cachedGetAsJson, deleteAsJson, postAsJson } from '../../utils';
import { API_BASE_URL, FAGSAKER } from '../../api-constants';

export const hent = (saksnr, juridiskorgnr) => cachedGetAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnr}/kontaktopplysninger/${juridiskorgnr}`);
export const send = (saksnr, juridiskorgnr, data) => postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnr}/kontaktopplysninger/${juridiskorgnr}`, data);
export const slett = (saksnr, juridiskorgnr) => deleteAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnr}/kontaktopplysninger/${juridiskorgnr}`);
