import { STATUS } from '../../services/utils';
import * as Types from './types';

const initalState: Types.State = {
  status: STATUS.NOT_STARTED,
  data: {},
};

export default function reducer(state = initalState, action: Types.Action): Types.State {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: { ...state.data, ...action.data } };
    case Types.OK:
      return { ...state, status: STATUS.OK, data: action.data };
    case Types.RESET:
      return { ...initalState };
    default:
      return state;
  }
}
