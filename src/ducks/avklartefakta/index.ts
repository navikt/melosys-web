import * as avklartefaktaActions from './actions';
import * as avklartefaktaOperations from './operations';
import * as avklartefaktaTypes from './types';
import * as avklartefaktaSelectors from './selectors';

import avklartefaktaReducers, { initialState } from './reducers';

export {
  initialState,
  avklartefaktaActions,
  avklartefaktaOperations,
  avklartefaktaTypes,
  avklartefaktaSelectors,
};

export default avklartefaktaReducers;
