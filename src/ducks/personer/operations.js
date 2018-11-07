/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */
import * as Api from '../../services/api';

/* eslint-disable import/prefer-default-export */
export function hent(fnr) {
  return Api.Personer.hentPerson(fnr);
}
