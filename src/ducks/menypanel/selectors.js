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
  behandlingerSelectors.BehandlingstemaKodeSelector,
  behandlingerSelectors.BehandlingstypeKodeSelector,
  (menypanel, sakstype, behandlingstema, behandlingstype) =>
    sakstype === MKV.Koder.sakstyper.EU_EOS ||
    (menypanel && menypanel.synlig) ||
    skalViseTomFlytEllerErSedBehandling(sakstype, behandlingstema, behandlingstype)
);
