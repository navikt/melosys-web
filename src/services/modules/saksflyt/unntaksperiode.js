import { postAsJson, putAsText } from '../../utils';
import { API_BASE_URL, SAKSFLYT, UNNTAKSPERIODER } from '../../api-constants';

// eslint-disable-next-line import/prefer-default-export
export const godkjenn = behandlingID => {
  const URI_SAKSFLYT_UNNTAKSPERIODE_GODKJENN = `${API_BASE_URL}${SAKSFLYT}/${UNNTAKSPERIODER}/${behandlingID}/godkjenn`;
  return putAsText(URI_SAKSFLYT_UNNTAKSPERIODE_GODKJENN);
};

export const innhentinfo = behandlingID => {
  const URI_SAKSFLYT_UNNTAKSPERIODE_INNHENTINFO = `${API_BASE_URL}${SAKSFLYT}/${UNNTAKSPERIODER}/${behandlingID}/innhentinfo`;
  return putAsText(URI_SAKSFLYT_UNNTAKSPERIODE_INNHENTINFO);
};

export const ikkegodkjenn = (behandlingID, body) => {
  const URI_SAKSFLYT_UNNTAKSPERIODE_IKKEGODKJENN = `${API_BASE_URL}${SAKSFLYT}/${UNNTAKSPERIODER}/${behandlingID}/ikkegodkjenn`;
  return postAsJson(URI_SAKSFLYT_UNNTAKSPERIODE_IKKEGODKJENN, body);
};

export const anmodning = behandlingID => {
  const URI_SAKSFLYT_UNNTAKPERIODE_ANMODNING = `${API_BASE_URL}${SAKSFLYT}/${UNNTAKSPERIODER}/${behandlingID}/anmodning`;
  return postAsJson(URI_SAKSFLYT_UNNTAKPERIODE_ANMODNING);
};
