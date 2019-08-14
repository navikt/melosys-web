import { postAsJson } from '../../../utils';
import { API_BASE_URL, REGISTRERING } from '../../../api-constants';

export const send = (behandlingID, data) =>
  postAsJson(`${API_BASE_URL}${REGISTRERING}/${behandlingID}/unntaksperioder`, data);
