import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';
import * as Types from './types';
import * as Actions from './actions';
import { modalerOperations } from '../modaler';
import { navigeringOperations } from '../navigering';
import * as DucksUtils from '../utils';

export function send(snr, body) {
  return doThenDispatch(
    () => Api.Fagsaker.fagsak.videresend(snr, body), {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      success: dispatch => {
        dispatch(modalerOperations.skjulValidering());
        dispatch(navigeringOperations.tilForsiden());
      },
      error: (dispatch, data) => {
        if (DucksUtils.harFeilmelding(data)) {
          dispatch(modalerOperations.visValidering());
        }
      },
    }
  );
}

export function reset() {
  return dispatch => (dispatch(Actions.reset()));
}
