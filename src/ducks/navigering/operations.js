import { naviger } from "../../navigering";
import { lagIngenFlytUrl } from "../../url";
import { fagsakSelectors } from "../fagsaker";
import { behandlingerSelectors } from "../behandlinger";

export const tilForsiden = () => async () => {
  return naviger("/");
};

export const tilAnnenSide = (link) => () => {
  naviger(link);
};

export const tilIngenFlyt = () => async (dispatch, getState) => {
  const sakstypeKode = await fagsakSelectors.SakstypeKodeSelector(getState());
  const saksnummer = await fagsakSelectors.SaksnummerSelector(getState());
  const behandlingID = await behandlingerSelectors.BehandlingIDSelector(getState());
  return naviger(lagIngenFlytUrl(sakstypeKode, saksnummer, behandlingID));
};
