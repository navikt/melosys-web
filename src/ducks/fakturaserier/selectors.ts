/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";
import * as Types from "./types";

export const FakturaserierSelector: Selector<RootState, StateSection<Types.Fakturaserie[]>> = createSelector(
  (state: RootState) => state.fakturaserier,
  (fakturaserier) => fakturaserier,
);
