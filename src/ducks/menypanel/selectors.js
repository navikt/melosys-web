import { createSelector } from "reselect";

export const MenypanelSelector = createSelector(
  (state) => state.menypanel.data,
  (menypanel) => menypanel
);

export const MenypanelSynligSelector = createSelector(
  (state) => MenypanelSelector(state),
  (menypanel) => menypanel?.synlig
);
