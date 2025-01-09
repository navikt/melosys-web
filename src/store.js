/* eslint-env browser */
import { combineReducers } from "redux";
import thunkMiddleware from "redux-thunk";
import freeze from "redux-freeze";
import rootReducer from "./reducer";
import { configureStore } from "@reduxjs/toolkit";
import { createReduxHistoryContext } from "redux-first-history";
import { createBrowserHistory } from "history";
import * as Constants from "./constants";

const { createReduxHistory, routerMiddleware, routerReducer } = createReduxHistoryContext({
  history: createBrowserHistory({ basename: Constants.URL_BASENAME }),
});

export const store = configureStore({
  reducer: combineReducers({
    router: routerReducer,
    ...rootReducer,
  }),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunkMiddleware, routerMiddleware, freeze),
});

export const history = createReduxHistory(store);
