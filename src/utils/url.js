import * as MKV from 'melosys-kodeverk';

export const lagUrl = (saksnummer, behandlingID, behandlingstypeKode) => {
  switch (behandlingstypeKode) {
    case MKV.Koder.behandlinger.behandlingstyper.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING:
    case MKV.Koder.behandlinger.behandlingstyper.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE:
    case MKV.Koder.behandlinger.behandlingstyper.UTL_MYND_UTPEKT_SEG_SELV:
      return `/registrering/${saksnummer}/unntaksperioder/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstyper.ANMODNING_OM_UNNTAK_HOVEDREGEL:
      return `/registrering/${saksnummer}/anmodningunntak/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstyper.SOEKNAD:
    case MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE:
      return `/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
    default:
      return null;
  }
};
