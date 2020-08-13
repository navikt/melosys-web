import { STATUS } from '../../services/utils';
import * as Types from './types';

export const initialState = {
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
        data: action.data.utpekingsperioder,
      };
    case Types.RESET:
      return { ...initialState };
    case Types.OPPDATER_UTPEKINGSPERIODER: {
      const { utpekingsperioder } = action;
      return {
        ...state,
        data: utpekingsperioder,
        status: STATUS.OK,
      };
    }
    case Types.ENDRE_PERIODE: {
      return {
        ...state,
        data: [
          {
            ...state.data[0],
            fomDato: action.data.fomdato,
            tomDato: action.data.tomdato,
          },
        ],
      };
    }
    default:
      return state;
  }
}
