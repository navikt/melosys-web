import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";
import { STATUS } from "../../services";

import * as Types from "./types";

const KontrollSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state: RootState) => state.kontroll,
  (kontroller) => kontroller,
);

const KontrollDataSelector = createSelector(KontrollSelector, (kontroll) => kontroll.data || {});

export const KontrollFeilSelector = createSelector(KontrollDataSelector, (data) => {
  return data.kontrollfeilList ? data.kontrollfeilList.filter((feil) => feil.type === "FEIL") : [];
});

export const KontrollAdvarslerSelector = createSelector(KontrollDataSelector, (data) => {
  return data.kontrollfeilList ? data.kontrollfeilList.filter((feil) => feil.type === "ADVARSEL") : [];
});

const ReduxStatusSelector = createSelector(KontrollSelector, (kontroll) => kontroll.status);

export const ErPendingSelector = createSelector(ReduxStatusSelector, (status) => status === STATUS.PENDING);
