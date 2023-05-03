/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

import * as Api from "../../services/api";

/**
 * Kaller backend for å be om oppfrisking av en sak.
 * @param behandlingID
 * @returns {*}
 */
export function oppfrisk(behandlingID) {
  return Api.Saksopplysninger.oppfrisk(behandlingID);
}
