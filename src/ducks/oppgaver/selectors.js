import { createSelector } from 'reselect';

import { kodeverkObjektTilKode } from '../../utils/kodeverk';

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
/*
export const MineSakerAntallSelector = createSelector(
  state => state.oppgaver.data || [],
  minesaker => minesaker.length
);
*/
export const SokOppgaveSelector = createSelector(
  state => state.oppgaver.data || [],
  oppgaver => oppgaver.filter(oppgave => kodeverkObjektTilKode(oppgave.oppgavetype) !== 'JFR')
);
