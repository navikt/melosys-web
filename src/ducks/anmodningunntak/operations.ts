import { AppThunk, RootState } from 'AppTypes';
import { AnmodningOmUnntak } from 'Domene';
import { ThunkDispatch } from 'redux-thunk';

import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';
import * as Types from './types';
import * as Actions from './actions';
import { modalerOperations } from '../modaler';
import { navigeringOperations } from '../navigering';
import * as DucksUtils from '../utils';

export function send(behandlingID: number, body: AnmodningOmUnntak): AppThunk<Promise<Types.Action>, Types.Action> {
  return doThenDispatch(
    () => Api.Saksflyt.Anmodningsperioder.bestill(behandlingID, body), {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      success: (dispatch: ThunkDispatch<RootState, unknown, Types.Action>) => {
        dispatch(modalerOperations.skjulValidering());
        dispatch(navigeringOperations.tilForsiden());
      },
      error: (dispatch: ThunkDispatch<RootState, unknown, Types.Action>, data: any) => {
        if (DucksUtils.harFeilmelding(data)) {
          dispatch(modalerOperations.visValidering());
        }
      },
    }
  );
}

export function reset(): AppThunk<Types.Action, Types.Action> {
  return dispatch => dispatch(Actions.reset());
}
