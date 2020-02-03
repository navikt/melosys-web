/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */
import { doThenDispatch } from '../../services/utils';
import * as Actions from './actions';
import * as Api from '../../services/api';
import * as Types from './types';
import * as Selectors from './selectors';

import { behandlingerSelectors } from '../behandlinger';
import { formSelectors } from '../form';

export function hentMedlemsPerioder(behandlingID) {
  return doThenDispatch(() => Api.Behandlinger.perioder.hentMedlemsPerioder(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}
export function sendMedlemsPerioder(behandlingID, perioder) {
  return doThenDispatch(() => Api.Behandlinger.perioder.sendMedlemsPerioder(behandlingID, perioder), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function lagre() {
  return (dispatch, getState) => {
    const perioder = Selectors.behandlingsPerioderSelector(getState());
    const behandlingID = behandlingerSelectors.BehandlingIDSelector(getState());
    dispatch(sendMedlemsPerioder(behandlingID, perioder));
  };
}

export function oppdaterPerioderState(state) {
  return dispatch => (dispatch(Actions.oppdaterPerioderState(state)));
}

export function oppdaterOgLagre() {
  return (dispatch, getState) => {
    const skjema = formSelectors.SoknadenFormSelector(getState()).values;
    const artikkel16_skjema = formSelectors.Artikkel16AnmodningFormSelector(getState()).values;

    dispatch(oppdaterPerioderState({ ...skjema, ...artikkel16_skjema }));
    dispatch(lagre());
  };
}

export function resetPerioderState() {
  return Actions.resetPerioderState();
}
