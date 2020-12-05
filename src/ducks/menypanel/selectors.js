import { createSelector } from 'reselect';
import { fagsakSelectors } from '../fagsaker';
import MKV from '../../melosyskodeverk';

export const MenypanelSelector = createSelector(
  state => state.menypanel.data,
  menypanel => menypanel
);

export const ErMenypanelSynlig = createSelector(
  MenypanelSelector,
  fagsakSelectors.SakstypeKodeSelector,
  (menypanel, sakstype) => (sakstype === MKV.Koder.sakstyper.EU_EOS) || (menypanel && menypanel.synlig)
);
