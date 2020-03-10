import MKV from '../melosyskodeverk';
import * as Constants from '../constants';

export const lagUrl = (saksnummer, behandlingID, behandlingstypeKode) => {
  switch (behandlingstypeKode) {
    case MKV.Koder.behandlinger.behandlingstyper.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING:
    case MKV.Koder.behandlinger.behandlingstyper.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE:
    case MKV.Koder.behandlinger.behandlingstyper.BESLUTNING_LOVVALG_ANNET_LAND:
      return `/registrering/${saksnummer}/unntaksperioder/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstyper.ANMODNING_OM_UNNTAK_HOVEDREGEL:
      return `/registrering/${saksnummer}/anmodningunntak/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstyper.SOEKNAD:
    case MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE:
    case MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING:
    case MKV.Koder.behandlinger.behandlingstyper.SOEKNAD_ARBEID_FLERE_LAND:
    case MKV.Koder.behandlinger.behandlingstyper.SOEKNAD_ARBEID_NORGE_BOSATT_ANNET_LAND:
      return `/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstyper.SOEKNAD_IKKE_YRKESAKTIV:
    case MKV.Koder.behandlinger.behandlingstyper.VURDER_TRYGDETID:
    case MKV.Koder.behandlinger.behandlingstyper.ØVRIGE_SED:
      return `/sedbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstyper.BESLUTNING_LOVVALG_NORGE:
      return `/vurderutpeking/${saksnummer}/?behandlingID=${behandlingID}`;
    default:
      return null;
  }
};

export const nyFane = url => {
  window.open(`${Constants.URL_BASENAME}/${url}`);
};
