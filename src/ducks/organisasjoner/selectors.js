/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from "reselect";

/**
 * @type {import('reselect').Selector<import('../../AppTypes').RootState, import('../../services/api').Organisasjon[]>}
 */
export const organisasjonerSelector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) => state.organisasjoner.data || [],
  (organisasjoner) => organisasjoner || [], // Ensure it's always an array
);
