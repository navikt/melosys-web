import { createSelector, Selector } from "reselect";
import { STATUS } from "../../services/utils";
import { RootState, StateSection } from "AppTypes";

import * as Types from "./types";

const KontrollSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state: RootState) => state.kontroll,
  (kontroller) => kontroller
);

const ReduxStatusSelector = createSelector(KontrollSelector, (vedtak) => vedtak.status);

export const ErPendingSelector = createSelector(ReduxStatusSelector, (status) => status === STATUS.PENDING);
