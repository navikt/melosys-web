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
    case Types.OK:
      return {
        ...state,
        status: STATUS.OK,
        data: action.data,
      };
    // case Types.OPPDATER_OPPSUMMERTFAKTA:
    //   return {
    //     ...state,
    //     data: {
    //       virksomheter: action.data.virksomheter
    //     }
    //   };
    default:
      return state;
  }
}
