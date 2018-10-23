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
export function hentDokument(journalforingID, dokumentID) {
  return doThenDispatch(() => Api.Dokumenter.hentDokument(journalforingID, dokumentID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}
export function opprettDokument(behandlingID, dokumenttypeKode, dokument) {
  return doThenDispatch(() => Api.Dokumenter.opprettDokument(behandlingID, dokumenttypeKode, dokument), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}
export function lagPdfUtkast(behandlingID, dokumenttypeKode, dokument) {
  return doThenDispatch(() => Api.Dokumenter.lagPdfUtkast(behandlingID, dokumenttypeKode, dokument), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}
export function resetDokument() {
  return dispatch => (dispatch(Actions.resetDokment()));
}
