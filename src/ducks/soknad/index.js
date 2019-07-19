import * as soknadOperations from './operations';
import * as soknadSelectors from './selectors';
import * as soknadActions from './actions';
import * as soknadTypes from './types';

import soknadReducers, { initialState } from './reducers';

export {
  initialState,
  soknadOperations,
  soknadSelectors,
  soknadTypes,
  soknadActions,
};

export default soknadReducers;
