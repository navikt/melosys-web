/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';
import * as Types from './types';
import * as Actions from './actions';

/* eslint-disable import/prefer-default-export */
export function hentDokument(journalpostID, dokumentID) {
  return doThenDispatch(() => Api.Dokumenter.pdf.hent(journalpostID, dokumentID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}
export function opprettDokument(behandlingID, dokumenttypeKode, dokument) {
  return doThenDispatch(() => Api.Dokumenter.dokument.opprett(behandlingID, dokumenttypeKode, dokument), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

async function getObjectURL(response) {
  const arrayBuffer = await response.arrayBuffer();
  const file = new Blob([arrayBuffer], { type: 'application/pdf' });
  return URL.createObjectURL(file);
}

export async function forhandsvisBrev(behandlingID, dokumenttypeKode, data) {
  const utfyltdata = {
    mottaker: data.mottaker ? data.mottaker : null,
    fritekst: data.fritekst ? data.fritekst : null,
    begrunnelseKode: data.begrunnelseKode ? data.begrunnelseKode : null,
  };

  const response = await Api.Dokumenter.pdf.forhandsvisBrev(behandlingID, dokumenttypeKode, utfyltdata);

  if (response.ok) {
    return getObjectURL(response);
  }
  return false;
}

export async function forhandsvisSed(behandlingID, sedType, data) {
  const vilSendeAnmodningOmMerInformasjon = data.vilSendeAnmodningOmMerInformasjon || (data.vilSendeAnmodningOmMerInformasjon === false ? false : null);

  const utfyltdata = {
    fritekst: data.fritekst || null,
    nyttLovvalgsland: data.nyttLovvalgsland || null,
    begrunnelseUtenlandskMyndighet: data.begrunnelseUtenlandskMyndighet || null,
    vilSendeAnmodningOmMerInformasjon,
  };

  const response = await Api.Dokumenter.pdf.forhandsvisSed(behandlingID, sedType, utfyltdata);

  if (response.ok) {
    return getObjectURL(response);
  }
  return false;
}

export function resetDokument() {
  return dispatch => (dispatch(Actions.resetDokment()));
}
