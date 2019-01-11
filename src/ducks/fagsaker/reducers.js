/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */
import _ from 'lodash';

import * as Types from './types';

import { STATUS } from '../../services/utils';

const initialState = {
  data: {},
  status: STATUS.NOT_STARTED,
};

const OppdaterOppsummeringBehandlingsStatus = (state, action) => {
  const nydata = _.cloneDeep(state.data);
  _.assign(nydata.behandlinger[0].oppsummering.behandlingsstatus, action.data);
  return nydata;
};
/**
 * Default reducer som i hovedsak håndterer lagring og feiling av inkomne data i tillegg til
 * manipulasjon og oppdatering av state-data.
 * @param state Object Default state før noen data er forsøkt sendt til reducer.
 * @param action Object Bestående av type (action type) og data.
 * @returns {{data: {}, status: string}}
 */
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK:
      return {
        ...state,
        status: STATUS.OK,
        data: action.data,
      };
    case Types.SAKSLISTE_PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.SAKSLISTE_FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.SAKSLISTE_OK:
      return { ...state, status: STATUS.OK, data: { ...state.data, fagsakListe: action.data } };
    case Types.RESET:
      return initialState;
    case Types.BEHANDLINGSSTATUS_UPDATE:
      return { ...state, status: STATUS.OK, data: OppdaterOppsummeringBehandlingsStatus(state, action) };
    default:
      return state;
  }
}
