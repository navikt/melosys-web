import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";

import * as DucksUtils from "../utils";
import * as Types from "./types";

const FeiletResponsSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state: RootState) => state.feiletRespons,
  (feiletRespons) => feiletRespons
);

const ReduxStatusSelector = createSelector(FeiletResponsSelector, (feiletRespons) => feiletRespons.status);

const FeiletResponsDataSelector = createSelector(FeiletResponsSelector, (feiletRespons) => feiletRespons.data);

const HttpResponsDataSelector = createSelector(
  FeiletResponsDataSelector,
  (feiletResponsData) => feiletResponsData.data
);

export const FeilmeldingerSelector = createSelector(
  HttpResponsDataSelector,
  ReduxStatusSelector,
  DucksUtils.hentFeilmeldinger
);
