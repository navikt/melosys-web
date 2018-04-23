/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

/* eslint-disable import/prefer-default-export */
export const OppgaveSelector = createSelector(
  state => state.sokbehandlingsoppgave.data,
  oppgaver => oppgaver
);
