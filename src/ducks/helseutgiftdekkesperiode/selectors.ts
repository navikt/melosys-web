/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";
import { HelseutgiftDekkesPeriodeDto } from "../../services/modules/helseutgiftDekkesPeriode/helseutgiftDekkesPeriode";

export const HelseutgiftDekkesPeriode: Selector<RootState, StateSection<HelseutgiftDekkesPeriodeDto>> = createSelector(
  (state: RootState) => state.helseutgiftdekkesperiode,
  (helseutgiftdekkesperiode) => {
    if (helseutgiftdekkesperiode.status === "ERROR") {
      return {
        ...helseutgiftdekkesperiode,
        data: {} as HelseutgiftDekkesPeriodeDto,
      };
    }
    return helseutgiftdekkesperiode;
  },
);
