import { createSelector } from "reselect";
import { fagsakSelectors } from "../fagsaker";
import MKV from "../../melosyskodeverk";
import { behandlingerSelectors } from "../behandlinger";
import { skalViseTomFlytEllerErSedBehandling } from "../../routing";
import { erFeatureToggleEnabled } from "../../featuretoggle";

export const MenypanelSelector = createSelector(
  (state) => state.menypanel.data,
  (menypanel) => menypanel
);

const folketrygdenToggleEnabled = async () => erFeatureToggleEnabled("melosys.folketrygden.mvp");

export const ErMenypanelSynlig = createSelector(
  MenypanelSelector,
  fagsakSelectors.SakstypeKodeSelector,
  fagsakSelectors.SakstemaKodeSelector,
  behandlingerSelectors.BehandlingstemaKodeSelector,
  behandlingerSelectors.BehandlingstypeKodeSelector,
  (menypanel, sakstype, sakstema, behandlingstema, behandlingstype) =>
    sakstype === MKV.Koder.sakstyper.EU_EOS ||
    menypanel?.synlig ||
    skalViseTomFlytEllerErSedBehandling(sakstype, sakstema, behandlingstema, behandlingstype, folketrygdenToggleEnabled)
);
