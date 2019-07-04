import * as Validering from '../../soknad-komponenter/skjema/validering';
import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';
import * as Actions from './actions';
import * as Types from './types';

/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

// Action Creators
export function hent(behandlingID) {
  return doThenDispatch(() => Api.Soknader.hent(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function send(bid, soknad) {
  return doThenDispatch(
    () => Api.Soknader.send(bid, soknad), {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    (dispatch, data) => Validering.Felles.forsokValidering(dispatch, data)
  );
}

export function oppdaterPeriode(periode) {
  return dispatch => dispatch(Actions.oppdaterPeriode(periode));
}

export function resetSoknadState() {
  return Actions.resetSoknadState();
}
