import { postAsJson, putAsText } from '../../utils';
import {API_BASE_URL, SAKSFLYT, UNNTAKSPERIODE} from '../../api-constants';

// eslint-disable-next-line import/prefer-default-export
export const godkjenn = behandlingID => {
  const URI_SAKSFLYT_UNNTAKSPERIODE_GODKJENN = `${API_BASE_URL}${SAKSFLYT}/${UNNTAKSPERIODE}/${behandlingID}/godkjenn`;
  return putAsText(URI_SAKSFLYT_UNNTAKSPERIODE_GODKJENN);
};

export const innhentinfo = behandlingID => {
  const URI_SAKSFLYT_UNNTAKSPERIODE_INNHENTINFO = `${API_BASE_URL}${SAKSFLYT}/${UNNTAKSPERIODE}/${behandlingID}/innhentinfo`;
  return putAsText(URI_SAKSFLYT_UNNTAKSPERIODE_INNHENTINFO);
};

export const ikkegodkjenn = (behandlingID, body) => {
  const URI_SAKSFLYT_UNNTAKSPERIODE_IKKEGODKJENN = `${API_BASE_URL}${SAKSFLYT}/${UNNTAKSPERIODE}/${behandlingID}/ikkegodkjenn`;
  return postAsJson(URI_SAKSFLYT_UNNTAKSPERIODE_IKKEGODKJENN, body);
};

