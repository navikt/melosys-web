/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */
import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./actions";
import * as Selectors from "./selectors";

export function hentBehandling(behandlingID) {
  return doThenDispatch(() => Api.Behandlinger.behandling.hentBehandling(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function resetBehandlingerState() {
  return Actions.resetBenadlingerState();
}

export function oppdaterBehandling() {
  return (dispatch, getState) => {
    const behandlingID = Selectors.BehandlingIDSelector(getState());
    dispatch(hentBehandling(behandlingID));
  };
}

/**
 * Som oppdaterBehandling, men kaster hvis oppfriskningen feiler, slik at kalleren
 * kan si fra til brukeren. Krever at kalleren håndterer feilen.
 */
export function oppfriskBehandling() {
  return async (dispatch, getState) => {
    const behandlingID = Selectors.BehandlingIDSelector(getState());
    const behandling = await Api.Behandlinger.behandling.hentBehandling(behandlingID);
    dispatch({ type: Types.OK, data: behandling });
    return behandling;
  };
}
