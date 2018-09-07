import { createSelector } from 'reselect';

/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */
/* eslint-disable import/prefer-default-export */
export const MineSakerSelector = createSelector(
  state => state.oppgaver.data || {},
  minesaker => minesaker
);
