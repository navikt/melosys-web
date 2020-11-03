import { createSelector } from 'reselect';

export const SoknadspanelSelector = createSelector(
  state => state.soknadspanel.data,
  soknadspanel => soknadspanel
);

export const ErSoknadspanelSynlig = createSelector(
  SoknadspanelSelector,
  soknadspaneldata => soknadspaneldata && soknadspaneldata.synlig
);
