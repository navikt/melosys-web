/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */
import { push } from 'connected-react-router';

import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';
import * as Types from './types';
import * as Actions from '../journalforing/actions';
import { modalerOperations } from '../modaler';
import * as DucksUtils from '../utils';

// eslint-disable-next-line import/prefer-default-export
export function hent(journalpostID) {
  return doThenDispatch(() => Api.Journalforing.hent(journalpostID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function resetJournalforing() {
  return dispatch => (dispatch(Actions.resetJournalforing()));
}

export function opprett(body) {
  return doThenDispatch(
    () => Api.Journalforing.opprett(body),
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
        if (DucksUtils.harFeilmelding(data)) {
          dispatch(modalerOperations.visValidering());
        }
      },
    }
  );
}

export function tilordne(body) {
  return doThenDispatch(
    () => Api.Journalforing.tilordne(body),
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
        if (DucksUtils.harFeilmelding(data)) {
          dispatch(modalerOperations.visValidering());
        }
      },
    }
  );
}
