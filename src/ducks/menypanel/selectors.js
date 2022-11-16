import { createSelector } from "reselect";

export const MenypanelSelector = createSelector(
  (state) => state.menypanel.data,
  (menypanel) => menypanel
);
