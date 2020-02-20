import { push } from 'connected-react-router';

import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';
import * as Types from './types';
import * as DucksUtils from '../utils';
import * as Utils from '../../utils';

import { modalerOperations } from '../modaler';
import { behandlingerSelectors } from '../behandlinger';

export function utpek(saksnummer, body) {
  return doThenDispatch(
    () => Api.Fagsaker.fagsak.utpek(saksnummer, body),
    {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      success: dispatch => {
        dispatch(modalerOperations.skjulValidering());
        dispatch(push('/'));
      },
      error: (dispatch, data) => {
        if (DucksUtils.valideringFeilet(data)) {
          dispatch(modalerOperations.visValidering());
        }
      },
    }
  );
}

export function avvis(body) {
  return async (dispatch, getState) => {
    const behandlingID = behandlingerSelectors.BehandlingIDSelector(getState());

    try {
      await Api.Saksflyt.Utpeking.avvis(behandlingID, body);
      dispatch(push('/'));
    } catch (e) {
      Utils.logger.error(e);
    }
  };
}
