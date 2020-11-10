import { createSelector } from 'reselect';
import {fagsakSelectors} from "../fagsaker";
import MKV from "../../melosyskodeverk";

export const SoknadspanelSelector = createSelector(
  state => state.soknadspanel.data,
  soknadspanel => soknadspanel
);

export const ErSoknadspanelSynlig = createSelector(
  SoknadspanelSelector,
  fagsakSelectors.SakstypeKodeSelector,
  (soknadspaneldata, sakstype) => (sakstype === MKV.Koder.sakstyper.EU_EOS) || (soknadspaneldata && soknadspaneldata.synlig)
);
