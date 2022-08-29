import MKV from "../melosyskodeverk";
import * as Constants from "../constants";

const { EU_EOS, FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;
const { HENVELDELSE, KLAGE } = MKV.Koder.behandlinger.behandlingstyper;

export const lagUrl = (saksnummer: number | string, behandlingID: number, behandlingstemaKode: string) => {
  switch (behandlingstemaKode) {
    case MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING:
    case MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE:
      return `/${EU_EOS}/registrering/${saksnummer}/unntaksperioder/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL:
      return `/${EU_EOS}/registrering/${saksnummer}/anmodningunntak/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER:
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_ETT_LAND_ØVRIG:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND:
      return `/${EU_EOS}/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV:
    case MKV.Koder.behandlinger.behandlingstema.TRYGDETID:
    case MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_MED:
    case MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_UFM:
      return `/${EU_EOS}/sedbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE:
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND:
      return `/${EU_EOS}/vurderutpeking/${saksnummer}/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET:
      return `/${FTRL}/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV:
      return `/${TRYGDEAVTALE}/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
    default:
      return null;
  }
};

export const lagUrlNy = (
  // TODO  Når melosys.sakstema / melosys.behandle_alle_saker fjernes, kan denne funksjonen kalles lagUrl og den over lagUrlFraBehandlingstema
  saksnummer: number | string,
  behandlingID: number,
  sakstypeKode: string,
  behandlingstemaKode: string,
  behandlingstypeKode: string
) => {
  if (skalViseTomFlyt(sakstypeKode, behandlingstemaKode, behandlingstypeKode)) {
    return `/${sakstypeKode}/behandling/${saksnummer}/?behandlingID=${behandlingID}`;
  }
  return lagUrl(saksnummer, behandlingID, behandlingstemaKode);
};

const skalViseTomFlyt = (sakstype: string, behandlingstema: string, behandlingstype: string) => {
  if ([HENVELDELSE, KLAGE].includes(behandlingstype)) {
    return true;
  }
  if (sakstype === FTRL && behandlingstema === MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV) {
    return true;
  }
  if (
    sakstype === TRYGDEAVTALE &&
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL
  ) {
    return true;
  }

  return [
    MKV.Koder.behandlinger.behandlingstema.ARBEID_KUN_NORGE,
    MKV.Koder.behandlinger.behandlingstema.PENSJONIST,
    MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK,
    MKV.Koder.behandlinger.behandlingstema.UNNTAK_MEDLEMSKAP,
    MKV.Koder.behandlinger.behandlingstema.FORESPØRSEL_TRYGDEMYNDIGHET,
  ].includes(behandlingstema);
};

export const nyFane = (url: string) => {
  window.open(`${Constants.URL_BASENAME}/${url}`);
};
