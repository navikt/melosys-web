/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';
import { DokumentOversikt, FysiskDokument, Mottaksretning } from 'Domene';

import MKV from '../../melosyskodeverk';

export const dokumenterSelector = createSelector(
  (state: { dokumenter: { data: { dokumentOversikt: DokumentOversikt[] } } }) => state.dokumenter.data,
  dokumenter => dokumenter
);

export const DokumentOversiktSelector = createSelector(
  dokumenterSelector,
  (dokumenter: { dokumentOversikt: DokumentOversikt[] }) => dokumenter.dokumentOversikt || []
);

const lagID = (journalpostID: string, dokumentID: string) => `${journalpostID}-${dokumentID}`;

export const hentDato = (mottaksretning: Mottaksretning, mottattDato: string, journalforingDato: string) => {
  if (mottaksretning.kode === MKV.Koder.mottaksretning.INN && mottattDato) {
    return mottattDato;
  }

  return journalforingDato;
};

const lagHoveddokument = ({
  journalpostID,
  avsenderEllerMottaker,
  hoveddokument: {
    tittel,
    dokumentID,
    logiskeVedlegg,
  },
  mottaksretning,
  mottattDato,
  journalforingDato,
}: DokumentOversikt): FysiskDokument => ({
  journalpostID,
  dokumentID,
  tittel,
  logiskeVedlegg,
  avsenderEllerMottaker,
  id: lagID(journalpostID, dokumentID),
  dato: hentDato(mottaksretning, mottattDato, journalforingDato),
});

const HoveddokumentSelector = createSelector(
  DokumentOversiktSelector,
  (dokumentOversikt: DokumentOversikt[]) => dokumentOversikt.map(lagHoveddokument) || []
);

const lagVedlegg = ({
  journalpostID,
  avsenderEllerMottaker,
  vedlegg = [],
  mottaksretning,
  mottattDato,
  journalforingDato,
}: DokumentOversikt): FysiskDokument[] => [
  ...vedlegg.map(({ dokumentID, tittel, logiskeVedlegg }) => ({
    journalpostID,
    dokumentID,
    tittel,
    logiskeVedlegg,
    avsenderEllerMottaker,
    id: lagID(journalpostID, dokumentID),
    dato: hentDato(mottaksretning, mottattDato, journalforingDato),
  })),
];

const VedleggSelector = createSelector(
  DokumentOversiktSelector,
  (dokumentOversikt: DokumentOversikt[]) => ([] as FysiskDokument[]).concat(...dokumentOversikt.map(lagVedlegg)) || []
);

export const AlleFysiskeDokumentSelector = createSelector(
  VedleggSelector,
  HoveddokumentSelector,
  (vedlegg: FysiskDokument[], hoveddokument: FysiskDokument[]) => ([] as FysiskDokument[]).concat(...vedlegg, ...hoveddokument)
);
