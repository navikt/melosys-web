import * as MKV from 'melosys-kodeverk';

export const lagUrl = (saksnummer, behandlingID, behandlingstype) => {
  switch (behandlingstype.kode) {
    case MKV.Koder.behandlinger.behandlingstyper.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING:
    case MKV.Koder.behandlinger.behandlingstyper.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE:
    case MKV.Koder.behandlinger.behandlingstyper.UTL_MYND_UTPEKT_SEG_SELV:
      return `/registrering/${saksnummer}/unntaksperioder/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstyper.ANMODNING_OM_UNNTAK_HOVEDREGEL:
      return `/registrering/${saksnummer}/anmodningunntak/?behandlingID=${behandlingID}`;
    default:
      return `/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
  }
};
