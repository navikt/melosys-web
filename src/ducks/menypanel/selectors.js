import { createSelector } from "reselect";

/**
 * @typedef {{ synlig?: boolean, fullmektig?: { erFullmektigEndret?: boolean } }} MenypanelStateData
 * @type {import('reselect').Selector<import('../../AppTypes').RootState, MenypanelStateData | undefined>}
 */
export const MenypanelSelector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) => state.menypanel.data, // Ensure this can be undefined if no data
  (menypanel) => menypanel,
);

export const MenypanelSynligSelector = createSelector(
  (state) => MenypanelSelector(state),
  (menypanel) => menypanel?.synlig,
);

export const MenypanelErFullmektigEndretSelector = createSelector(
  (state) => MenypanelSelector(state),
  (menypanel) => menypanel?.fullmektig?.erFullmektigEndret,
);
