import { postAsJson, putAsText } from '../../utils';
import { API_BASE_URL, SAKSFLYT, UNNTAKSPERIODER } from '../../api-constants';

// eslint-disable-next-line import/prefer-default-export
export const godkjenn = behandlingID => putAsText(`${API_BASE_URL}${SAKSFLYT}/${UNNTAKSPERIODER}/${behandlingID}/godkjenn`);
export const innhentinfo = behandlingID => putAsText(`${API_BASE_URL}${SAKSFLYT}/${UNNTAKSPERIODER}/${behandlingID}/innhentinfo`);

export const ikkegodkjenn = (behandlingID, data) => postAsJson(`${API_BASE_URL}${SAKSFLYT}/${UNNTAKSPERIODER}/${behandlingID}/ikkegodkjenn`, data);
