import MKV from '../melosyskodeverk';
import * as Constants from '../constants';

export const lagUrl = (saksnummer: number, behandlingID: number, behandlingstemaKode: string) => {
  switch (behandlingstemaKode) {
    case MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING:
    case MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE:
      return `/${MKV.Koder.sakstyper.EU_EOS}/registrering/${saksnummer}/unntaksperioder/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL:
      return `/${MKV.Koder.sakstyper.EU_EOS}/registrering/${saksnummer}/anmodningunntak/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER:
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_ETT_LAND_ØVRIG:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND:
      return `/${MKV.Koder.sakstyper.EU_EOS}/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV:
    case MKV.Koder.behandlinger.behandlingstema.TRYGDETID:
    case MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_MED:
    case MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_UFM:
      return `/${MKV.Koder.sakstyper.EU_EOS}/sedbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE:
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND:
      return `/vurderutpeking/${saksnummer}/?behandlingID=${behandlingID}`;
    case 'ARBEID_I_UTLANDET':
      return `/${MKV.Koder.sakstyper.FTRL}/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
    default:
      return null;
  }
};

export const nyFane = (url: string) => {
  window.open(`${Constants.URL_BASENAME}/${url}`);
};
