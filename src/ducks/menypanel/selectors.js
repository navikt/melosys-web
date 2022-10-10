import { createSelector } from "reselect";
import { fagsakSelectors } from "../fagsaker";
import MKV from "../../melosyskodeverk";
import { behandlingerSelectors } from "../behandlinger";
import { skalViseTomFlytEllerErSedBehandling } from "../../routing";

export const MenypanelSelector = createSelector(
  (state) => state.menypanel.data,
  (menypanel) => menypanel
);

export const ErMenypanelSynlig = createSelector(
  MenypanelSelector,
  fagsakSelectors.SakstypeKodeSelector,
  fagsakSelectors.SakstemaKodeSelector,
  behandlingerSelectors.BehandlingstemaKodeSelector,
  behandlingerSelectors.BehandlingstypeKodeSelector,
  (menypanel, sakstype, sakstema, behandlingstema, behandlingstype) =>
    sakstype === MKV.Koder.sakstyper.EU_EOS ||
    menypanel?.synlig ||
    skalViseTomFlytEllerErSedBehandling(sakstype, behandlingstema, behandlingstype, sakstema)
);
