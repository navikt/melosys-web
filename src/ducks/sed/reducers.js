import { STATUS } from '../../services/utils';
import * as Types from './types';

const initialState = {
  status: STATUS.NOT_STARTED,
  data: {
    bucinfo: {},
    sedunderarbeid: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK:
      return { ...state, status: STATUS.OK };
    case Types.OPPDATER_SEDUNDERARBEID:
      return { ...state, status: STATUS.OK, data: { ...state.data, sedunderarbeid: [...action.data] } };
    case Types.OPPDATER_BUCINFO:
      return { ...state, status: STATUS.OK, data: { ...state.data, bucinfo: { ...action.data } } };
    default:
      return state;
  }
}
