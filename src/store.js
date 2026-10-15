import { combineReducers } from "redux";
import rootReducer from "./reducer";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: combineReducers(rootReducer),
});
