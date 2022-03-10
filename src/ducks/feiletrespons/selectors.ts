import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";

import * as DucksUtils from "../utils";
import * as Types from "./types";

const FeiletresponsSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state: RootState) => state.feiletrespons,
  (feiletrespons) => feiletrespons
);

const ReduxStatusSelector = createSelector(FeiletresponsSelector, (feiletrespons) => feiletrespons.status);

const FeiletResponsDataSelector = createSelector(FeiletresponsSelector, (feiletrespons) => feiletrespons.data);

const HttpResponsDataSelector = createSelector(
  FeiletResponsDataSelector,
  (feiletresponsData) => feiletresponsData.data
);

const HttpStatusSelector = createSelector(
  HttpResponsDataSelector,
  (httpResponsData) => httpResponsData && httpResponsData.status
);

const HttpMessageSelector = createSelector(
  HttpResponsDataSelector,
  (httpResponsData) => httpResponsData && httpResponsData.message
);

export const FeilmeldingSelector = createSelector(
  ReduxStatusSelector,
  HttpStatusSelector,
  HttpMessageSelector,
  DucksUtils.hentFeilmelding
);

export const FeilkoderSelector = createSelector(HttpResponsDataSelector, ReduxStatusSelector, DucksUtils.hentFeilkoder);
