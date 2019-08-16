import { STATUS } from '../../services/utils';
import * as Types from './types';

const initialState = {
  data: [],
  status: STATUS.NOT_STARTED,
};

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
        data: action.data.anmodningsperioder,
      };
    case Types.RESET:
      return { ...initialState };
    case Types.OPPDATER_ANMODNINGSPERIODER: {
      const { anmodningsperioder } = action;
      return {
        ...state,
        data: anmodningsperioder,
        status: STATUS.OK,
      };
    }
    default:
      return state;
  }
}
