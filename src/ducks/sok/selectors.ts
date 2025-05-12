import { createSelector } from "reselect";
import { RootState } from "AppTypes";
import { FagsakOppsummering } from "../../services/modules/types";

/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

export const FagsakSokSelector = createSelector(
  (state: RootState) => (state.sok.data.fagsakListe ? state.sok.data.fagsakListe : []),
  (sokResultat: FagsakOppsummering[]) => sokResultat || [],
);
