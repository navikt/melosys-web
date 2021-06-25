import { push } from "connected-react-router";

import { oppgaverOperations } from "../oppgaver";

export const tilForsiden = () => async (dispatch) => {
  dispatch(oppgaverOperations.oversikt());
  return dispatch(push("/"));
};

export const tilAnnenSide = (link) => (dispatch) => {
  dispatch(push(link));
};
