import { API_BASE_URL, SAKSFLYT, UTPEKING } from '../../api-constants';

import { postAsJson } from '../../utils';

export const avvis = (behandlingID, body) => postAsJson(`${API_BASE_URL}${SAKSFLYT}/${UTPEKING}/${behandlingID}/avvis`, body);
