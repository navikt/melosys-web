import * as fagsakActions from './actions';
import * as fagsakOperations from './operations';
import * as fagsakTypes from './types';
import * as fagsakSelectors from './selectors';

import fagsakReducers, { initialState } from './reducers';

export {
  initialState,
  fagsakActions,
  fagsakOperations,
  fagsakTypes,
  fagsakSelectors,
};

export default fagsakReducers;
