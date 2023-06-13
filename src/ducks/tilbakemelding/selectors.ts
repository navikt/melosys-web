import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";
import * as Types from "./types";

const TilbakemeldingSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state: RootState) => state.tilbakemelding,
  (tilbakemelding) => tilbakemelding
);

export const TilbakemeldingDataSelector: Selector<RootState, Types.Data> = createSelector(
  TilbakemeldingSelector,
  (tilbakemelding) => tilbakemelding.data
);

export const ErTilbakemeldingSynligSelector = createSelector(
  TilbakemeldingDataSelector,
  (tilbakemelding) => tilbakemelding.synlig
);

export const TilbakemeldingTekstSelector = createSelector(
  TilbakemeldingDataSelector,
  (tilbakemelding) => tilbakemelding.tekst
);
