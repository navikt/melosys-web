import { StateSection } from 'AppTypes';
import { STATUS } from '../../services/utils';
import * as Types from './types';

export const initialState: StateSection<Types.Data> = {
  data: {},
  status: STATUS.NOT_STARTED,
};

export default function reducer(state = initialState, action: Types.Action): StateSection<Types.Data> {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK: {
      const { data: medlemskapsperioder } = action;
      const bestemmelse = medlemskapsperioder.length > 0 ? medlemskapsperioder[0].bestemmelse : '';
      return {
        ...state,
        status: STATUS.OK,
        data: {
          bestemmelse,
          medlemskapsperioder,
        },
      };
    }
    case Types.OPPDATER_BESTEMMELSE:
      return {
        ...state,
        data: {
          ...state.data,
          bestemmelse: action.data,
        },
      };
    default:
      return state;
  }
}
