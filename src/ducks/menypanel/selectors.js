import { createSelector } from "reselect";

export const MenypanelSelector = createSelector(
  (state) => state.menypanel.data,
  (menypanel) => menypanel
);

export const MenypanelSynligSelector = createSelector(
  (state) => MenypanelSelector(state),
  (menypanel) => menypanel?.synlig
);

export const MenypanelErFullmektigEndretSelector = createSelector(
  (state) => MenypanelSelector(state),
  (menypanel) => menypanel?.fullmektig?.erFullmektigEndret
);
