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

export function hentBehandling(behandlingID) {
  return doThenDispatch(() => Api.Behandlinger.hentBehandling(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function oppdaterBehandlingsStatus(status) {
  return Actions.oppdaterBehandlingsStatus(status);
}
export function resetBehandlingerState() {
  return Actions.resetBenadlingerState();
}
