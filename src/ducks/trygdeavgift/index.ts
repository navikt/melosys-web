import * as trygdeavgiftOperations from "./operations";
import * as trygdeavgiftSelectors from "./selectors";
import * as trygdeavgiftTypes from "./types";

import trygdeavgiftReducers, { initialState } from "./reducers";

export { initialState, trygdeavgiftOperations, trygdeavgiftSelectors, trygdeavgiftTypes };
export default trygdeavgiftReducers;
