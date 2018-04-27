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
  // TODO: Nedenfor er en midlertidig filter fix for å unngå at søkeresultatet
  // viser journalføringsoppgaver. Denne skal egentlig filtreres backend, så denne vil bli
  // overflødig. Vurderes fjernet. (Notat skrevet 26. april)
  oppgaver => oppgaver.filter(oppgave => oppgave.oppgavetype.kode !== 'JFR')
);
