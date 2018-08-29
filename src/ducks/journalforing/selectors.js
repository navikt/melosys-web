/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

export const JournalforingAlle = createSelector(
  state => state.journalforing.data || {},
  journalforing => journalforing || {}
);

export const JournalforingDokument = createSelector(
  state => state.journalforing.data || {},
  journalforing => journalforing.dokument || { tittel: '', vedleggstitler: [] }
);

export const JournalforingAvsenderID = createSelector(
  state => state.journalforing.data || {},
  journalforing => journalforing.avsenderID || ''
);
