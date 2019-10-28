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

export const JournalforingHovedDokument = createSelector(
  state => state.journalforing.data || {},
  journalforing => journalforing.hoveddokument || { tittel: '', dokumentID: null }
);


export const JournalforingVedleggsDokumenter = createSelector(
  state => state.journalforing.data || {},
  journalforing => journalforing.vedlegg || []
);

export const BrukerIDSelector = createSelector(
  JournalforingAlle,
  journalforing => journalforing.brukerID
);

export const AvsenderIDSelector = createSelector(
  JournalforingAlle,
  journalforing => journalforing.avsenderID
);

export const AvsenderNavnSelector = createSelector(
  JournalforingAlle,
  journalforing => journalforing.avsenderNavn
);

export const AvsenderTypeSelector = createSelector(
  JournalforingAlle,
  journalforing => journalforing.avsenderType
);
