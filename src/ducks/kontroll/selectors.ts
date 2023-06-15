import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";
import { STATUS } from "../../services";

import * as Types from "./types";

const KontrollSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state: RootState) => state.kontroll,
  (kontroller) => kontroller
);

const KontrollDataSelector = createSelector(KontrollSelector, (kontroll) => kontroll.data);

export const KontrollfeilSelector = createSelector(KontrollDataSelector, (data) =>
  data?.kontrollfeilList ? data.kontrollfeilList : []
);

const ReduxStatusSelector = createSelector(KontrollSelector, (vedtak) => vedtak.status);

export const ErPendingSelector = createSelector(ReduxStatusSelector, (status) => status === STATUS.PENDING);
