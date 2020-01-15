import { push } from 'connected-react-router';

import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';
import * as Types from './types';
import * as DucksUtils from '../utils';

import { modalerOperations } from '../modaler';

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
