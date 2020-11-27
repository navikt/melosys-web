import { AppThunk } from 'AppTypes';
import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';
import * as Types from './types';
import * as Actions from './actions';

export function hentMedlemskapsperioder(behandlingID: number) {
  return doThenDispatch(() => Api.Medlemskapsperioder.getMedlemskapsperioder(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function oppdaterBestemmelse(bestemmelse: string): AppThunk<Types.Action, Types.Action> {
  return dispatch => (dispatch(Actions.oppdaterBestemmelse(bestemmelse)));
}
