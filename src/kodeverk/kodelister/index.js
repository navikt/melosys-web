import { kodeverk } from 'melosys-kodeverk';

export const {
  begrunnelser,
  begrunnelser: {
    art16_1_anmodning,
  },
  behandlinger: {
    resultattyper,
    status,
    typer,
  },
  brev: {
    produserbaredokumenter,
  },
  lovvalgsbestemmelser,
  lovvalgsbestemmelser: {
    forordning_883_2004,
    forordning_987_2009,
    tillegg,
  },
  vilkaar: {
    vilkaar,
  },
  yrker: {
    yrkesaktivitetstyper,
    yrkesgrupper,
  },
  aktoersroller,
  avklartefakta,
  dokumenttitler,
  dokumenttyper,
  finansiering,
  forespoerseltyper,
  henleggelsesgrunner,
  kontantytelser_eu_fo,
  landkoder,
  medlemskapstyper,
  mottaksretning,
  oppgavetyper,
  representerer,
  saksstatuser,
  sakstyper,
  trygdedekninger,
  vedleggstitler,
} = kodeverk;

export const fartsomrader = [
  { kode: 'innenriks', term: 'Innenriks' },
  { kode: 'utenriks', term: 'Utenriks' },
];
