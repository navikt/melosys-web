import { getAsJson, postAsJson } from '../../utils';
import { API_BASE_URL, EESSI } from '../../api-constants';

export const opprett = (behandlingID, bucData) => postAsJson(`${API_BASE_URL}${EESSI}/bucer/${behandlingID}/opprett`, bucData);

export const hentBucerForBehandling = (behandlingID, statuser) => getAsJson(`${API_BASE_URL}${EESSI}/bucer/${behandlingID}?statuser=${statuser ? statuser.join(',') : ''}`);
