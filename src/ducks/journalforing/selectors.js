/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

const JournalforingSelector = createSelector(
  state => state.journalforing || {},
  journalforing => journalforing
);

export const JournalforingAlle = createSelector(
  JournalforingSelector,
  journalforing => journalforing.data || {}
);

export const JournalforingHovedDokument = createSelector(
  JournalforingAlle,
  journalforing => journalforing.hoveddokument || { tittel: '', dokumentID: null, logiskeVedlegg: [] }
);

export const JournalforingHovedDokumentTittelSelector = createSelector(
  JournalforingHovedDokument,
  hoveddokument => hoveddokument.tittel
);

export const JournalforingLogiskeVedleggSelector = createSelector(
  JournalforingHovedDokument,
  hoveddokument => hoveddokument.logiskeVedlegg || []
);

export const JournalforingVedleggsDokumenter = createSelector(
  JournalforingAlle,
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

export const ErBrukerAvsenderSelector = createSelector(
  JournalforingAlle,
  journalforing => journalforing.erBrukerAvsender
);

export const MottattDatoSelector = createSelector(
  JournalforingAlle,
  journalforing => journalforing.mottattDato
);

export const ErAvsenderPreutfyltSelector = createSelector(
  AvsenderIDSelector,
  AvsenderNavnSelector,
  AvsenderTypeSelector,
  (avsenderID, avsenderNavn, avsenderType) => (
    Boolean(avsenderID) && Boolean(avsenderNavn) && Boolean(avsenderType)
  )
);
