/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

import * as Api from '../../services/api';
import { doThenDispatch } from '../../services/utils';

import * as Types from './types';
import * as Actions from '../vilkar/actions';
import * as Selectors from './selectors';

import { behandlingerSelectors } from '../behandlinger';

import MKV from '../../melosyskodeverk';

export function hent(behandlingID) {
  return doThenDispatch(() => Api.Vilkar.hent(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

function send(behandlingID, body) {
  return doThenDispatch(() => Api.Vilkar.send(behandlingID, body), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

const VILKAAR_FRONTEND_MANGLER_SKRIVETILGANG_TIL = [
  MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
];

const filtrerVilkar = vilkar => vilkar.filter(enkeltVilkar => !VILKAAR_FRONTEND_MANGLER_SKRIVETILGANG_TIL.includes(enkeltVilkar.vilkaar));

export function lagre() {
  return (dispatch, getState) => {
    const vilkar = Selectors.VilkarSelector(getState());
    const bid = behandlingerSelectors.BehandlingIDSelector(getState());

    const filtrerteVilkar = filtrerVilkar(vilkar);

    return dispatch(send(bid, filtrerteVilkar));
  };
}

export function oppdaterState(skjema) {
  return dispatch => (dispatch(Actions.oppdaterState(skjema)));
}

export function resetState() {
  return Actions.resetState();
}
