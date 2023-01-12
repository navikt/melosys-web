import MKV from "../melosyskodeverk";
import * as Constants from "../constants";

const { EU_EOS, FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;
const { HENVENDELSE, KLAGE } = MKV.Koder.behandlinger.behandlingstyper;

const lagUrlForEuEøsFlyter = (saksnummer: number | string, behandlingID: number, behandlingstemaKode: string) => {
  switch (behandlingstemaKode) {
    case MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING:
    case MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE:
      return `/${EU_EOS}/registrering/${saksnummer}/unntaksperioder/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL:
      return `/${EU_EOS}/registrering/${saksnummer}/anmodningunntak/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER:
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND:
      return `/${EU_EOS}/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE:
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND:
      return `/${EU_EOS}/vurderutpeking/${saksnummer}/?behandlingID=${behandlingID}`;
    default:
      throw new Error(`Finner ikke EuEøs-flyt for behandlingstema: ${behandlingstemaKode}`);
  }
};

const lagUrlForFtrlFlyt = (saksnummer: number | string, behandlingID: number) => {
  return `/${FTRL}/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
};

const lagUrlForTrygdeavtaleFlyt = (saksnummer: number | string, behandlingID: number, behandlingstemaKode: string) => {
  if (behandlingstemaKode === MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV) {
    return `/${TRYGDEAVTALE}/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
  }
  throw new Error(`Finner ikke trygdeavtale-flyt for behandlingstema: ${behandlingstemaKode}`);
};

export const lagUrlFraSakstypeOgBehandlingstema = (
  saksnummer: number | string,
  behandlingID: number,
  sakstypeKode: string,
  behandlingstemaKode: string
) => {
  if (sakstypeKode === EU_EOS) {
    return lagUrlForEuEøsFlyter(saksnummer, behandlingID, behandlingstemaKode);
  }
  if (sakstypeKode === FTRL) {
    return lagUrlForFtrlFlyt(saksnummer, behandlingID);
  }
  if (sakstypeKode === TRYGDEAVTALE) {
    return lagUrlForTrygdeavtaleFlyt(saksnummer, behandlingID, behandlingstemaKode);
  }
  throw new Error(`Støtter ikke sakstype: ${sakstypeKode}`);
};

export const lagUrl = (
  saksnummer: number | string,
  behandlingID: number,
  sakstypeKode: string,
  sakstemaKode: string,
  behandlingstemaKode: string,
  behandlingstypeKode: string,
  folketrygdenToggleEnabled: boolean = false
) => {
  if (
    skalViseTomFlyt(sakstypeKode, sakstemaKode, behandlingstemaKode, behandlingstypeKode, folketrygdenToggleEnabled)
  ) {
    return `/${sakstypeKode}/behandling/${saksnummer}/?behandlingID=${behandlingID}`;
  }
  return lagUrlFraSakstypeOgBehandlingstema(saksnummer, behandlingID, sakstypeKode, behandlingstemaKode);
};

export const skalViseTomFlyt = (
  sakstype: string,
  sakstema: string,
  behandlingstema: string,
  behandlingstype: string,
  folketrygdenToggleEnabled: boolean = false
) => {
  if (sakstema === MKV.Koder.sakstemaer.TRYGDEAVGIFT) {
    return true;
  }
  if ([HENVENDELSE, KLAGE].includes(behandlingstype)) {
    return true;
  }
  if (sakstype === FTRL && !folketrygdenToggleEnabled) {
    return true;
  }
  if (
    sakstype === TRYGDEAVTALE &&
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL
  ) {
    return true;
  }

  return [
    MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV,
    MKV.Koder.behandlinger.behandlingstema.ARBEID_KUN_NORGE,
    MKV.Koder.behandlinger.behandlingstema.PENSJONIST,
    MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK,
    MKV.Koder.behandlinger.behandlingstema.UNNTAK_MEDLEMSKAP,
    MKV.Koder.behandlinger.behandlingstema.FORESPØRSEL_TRYGDEMYNDIGHET,
    MKV.Koder.behandlinger.behandlingstema.TRYGDETID,
  ].includes(behandlingstema);
};

export const nyFane = (url: string) => {
  window.open(`${Constants.URL_BASENAME}/${url}`);
};
