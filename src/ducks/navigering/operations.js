import { push } from "redux-first-history";
import { lagIngenFlytUrl } from "../../url";
import { fagsakSelectors } from "../fagsaker";
import { behandlingerSelectors } from "../behandlinger";

export const tilForsiden = () => async (dispatch) => {
  return dispatch(push("/"));
};

export const tilAnnenSide = (link) => (dispatch) => {
  dispatch(push(link));
};

export const tilIngenFlyt = () => async (dispatch, getState) => {
  const sakstypeKode = await fagsakSelectors.SakstypeKodeSelector(getState());
  const saksnummer = await fagsakSelectors.SaksnummerSelector(getState());
  const behandlingID = await behandlingerSelectors.BehandlingIDSelector(getState());
  return dispatch(push(lagIngenFlytUrl(sakstypeKode, saksnummer, behandlingID)));
};
