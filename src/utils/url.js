import * as MKV from 'melosys-kodeverk';

export const lagUrl = (saksnummer, behandlingID, behandlingstype) => {
  switch (behandlingstype.kode) {
    case MKV.Koder.behandlinger.typer.REGISTRERING_UNNTAK_NORSK_TRYGD:
    case MKV.Koder.behandlinger.typer.UTL_MYND_UTPEKT_SEG_SELV:
      return `/registrering/${saksnummer}/unntaksperioder/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.typer.ANMODNING_OM_UNNTAK_HOVEDREGEL:
      return `/registrering/${saksnummer}/anmodningunntak/?behandlingID=${behandlingID}`;
    default:
      return `/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
  }
};
