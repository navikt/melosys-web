import * as behandlingerOperations from './operations';
import * as behandlingerSelectors from './selectors';

import behandlingerReducers, { initialState} from './reducers';

export {
  initialState,
  behandlingerOperations,
  behandlingerSelectors,
};
export default behandlingerReducers;

