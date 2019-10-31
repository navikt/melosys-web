import * as behandlingsresultatOperations from './operations';
import * as behandlingsresultatSelectors from './selectors';
import * as behandlingsresultatTypes from './types';

import behandlingsresultatReducers, { initialState } from './reducers';

export {
  initialState,
  behandlingsresultatOperations,
  behandlingsresultatSelectors,
  behandlingsresultatTypes,
};
export default behandlingsresultatReducers;
