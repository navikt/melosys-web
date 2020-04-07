import MKV from '../melosyskodeverk';
import * as Constants from '../constants';

export const lagUrl = (saksnummer, behandlingID, behandlingstemaKode) => {
  switch (behandlingstemaKode) {
    case MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING:
    case MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE:
      return `/registrering/${saksnummer}/unntaksperioder/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL:
      return `/registrering/${saksnummer}/anmodningunntak/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER:
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_ETT_LAND_ØVRIG:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND:
      return `/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV:
    case MKV.Koder.behandlinger.behandlingstema.TRYGDETID:
    case MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED:
      return `/sedbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE:
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND:
      return `/vurderutpeking/${saksnummer}/?behandlingID=${behandlingID}`;
    default:
      return null;
  }
};

export const nyFane = url => {
  window.open(`${Constants.URL_BASENAME}/${url}`);
};
