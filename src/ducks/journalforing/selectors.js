/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

import * as DucksUtils from '../utils';

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

const ReduxStatusSelector = createSelector(
  JournalforingSelector,
  journalforing => journalforing.status
);

const JournalforingDataSelector = createSelector(
  JournalforingAlle,
  journalforing => journalforing.data || {}
);

const HttpStatusSelector = createSelector(
  JournalforingDataSelector,
  journalforingData => journalforingData && journalforingData.status
);

const HttpMessageSelector = createSelector(
  JournalforingDataSelector,
  journalforingData => journalforingData && journalforingData.message
);

export const FeilmeldingSelector = createSelector(
  ReduxStatusSelector,
  HttpStatusSelector,
  HttpMessageSelector,
  DucksUtils.hentFeilmelding
);

export const FeilkoderSelector = createSelector(
  JournalforingDataSelector,
  ReduxStatusSelector,
  DucksUtils.hentFeilkoder
);
