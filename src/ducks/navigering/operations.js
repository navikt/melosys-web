import { push } from "connected-react-router";

export const tilForsiden = () => async (dispatch) => {
  return dispatch(push("/"));
};

export const tilAnnenSide = (link) => (dispatch) => {
  dispatch(push(link));
};
