import * as Validering from '../../felleskomponenter/skjema/validering';
import * as Api from '../../services/api';
import * as Utils from '../../utils';
import * as Actions from './actions';
import * as Types from './types';
import * as Selectors from './selectors';

import { doThenDispatch } from '../../services/utils';
import { formSelectors } from '../form';
import { behandlingerSelectors } from '../behandlinger';

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
    {
      success: (dispatch, data) => Validering.Felles.forsokValidering(dispatch, data),
    }
  );
}

export function oppdaterSoknadState() {
  return (dispatch, getState) => {
    const soknadData = {
      ...formSelectors.SoknadenFormSelector(getState()).values,
      ...formSelectors.InngangFormSelector(getState()).values,
    };

    if (Utils._isEmpty(soknadData)) return;

    dispatch(Actions.oppdaterSoknadState(soknadData));
  };
}

export function lagre() {
  return (dispatch, getState) => {
    dispatch(oppdaterSoknadState());

    const soknad = Selectors.SoknadSelector(getState());
    const bid = behandlingerSelectors.BehandlingIDSelector(getState());
    dispatch(send(bid, soknad));
  };
}

export function oppdaterPeriode(periode) {
  return dispatch => dispatch(Actions.oppdaterPeriode(periode));
}

export function resetSoknadState() {
  return Actions.resetSoknadState();
}
