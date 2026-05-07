import MKV from "../melosyskodeverk";
import * as Constants from "../constants";

const { EU_EOS, FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;
const { TRYGDEAVGIFT } = MKV.Koder.sakstemaer;
const { HENVENDELSE, KLAGE } = MKV.Koder.behandlinger.behandlingstyper;

const flytFinnesIkkeForBehandlingPath = "/flyt-finnes-ikke-for-behandling";

const lagUrlForEuEøsFlyter = (saksnummer: number | string, behandlingID: number, behandlingstemaKode: string) => {
  switch (behandlingstemaKode) {
    case MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING:
    case MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE:
      return `/${EU_EOS}/registrering/${saksnummer}/unntaksperioder/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL:
      return `/${EU_EOS}/registrering/${saksnummer}/anmodningunntak/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.A1_ANMODNING_OM_UNNTAK_PAPIR:
      return `/${EU_EOS}/unntaksregistrering/${saksnummer}/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER:
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_KUN_NORGE:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND:
      return `/${EU_EOS}/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE:
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND:
      return `/${EU_EOS}/vurderutpeking/${saksnummer}/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV:
      return `/${EU_EOS}/ikkeYrkesaktiv/${saksnummer}/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.PENSJONIST:
      return `/${EU_EOS}/pensjonist/${saksnummer}/?behandlingID=${behandlingID}`;
    default:
      return flytFinnesIkkeForBehandlingPath;
  }
};

const lagUrlForFtrlFlyt = (saksnummer: number | string, behandlingID: number, behandlingstemaKode: string) => {
  switch (behandlingstemaKode) {
    case MKV.Koder.behandlinger.behandlingstema.PENSJONIST:
    case MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV:
    case MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV:
      return `/${FTRL}/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
    default:
      return flytFinnesIkkeForBehandlingPath;
  }
};

const lagUrlForTrygdeavtaleFlyt = (saksnummer: number | string, behandlingID: number, behandlingstemaKode: string) => {
  switch (behandlingstemaKode) {
    case MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV:
      return `/${TRYGDEAVTALE}/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;

    case MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV:
      return `/${TRYGDEAVTALE}/ikkeYrkesaktiv/${saksnummer}/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK:
    case MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL:
      return `/${TRYGDEAVTALE}/unntaksregistrering/${saksnummer}/?behandlingID=${behandlingID}`;
    default:
      return flytFinnesIkkeForBehandlingPath;
  }
};

export const lagUrlFraSakstypeOgBehandlingstema = (
  saksnummer: number | string,
  behandlingID: number,
  sakstypeKode: string,
  behandlingstemaKode: string,
) => {
  if (sakstypeKode === EU_EOS) {
    return lagUrlForEuEøsFlyter(saksnummer, behandlingID, behandlingstemaKode);
  }
  if (sakstypeKode === FTRL) {
    return lagUrlForFtrlFlyt(saksnummer, behandlingID, behandlingstemaKode);
  }
  if (sakstypeKode === TRYGDEAVTALE) {
    return lagUrlForTrygdeavtaleFlyt(saksnummer, behandlingID, behandlingstemaKode);
  }
  return flytFinnesIkkeForBehandlingPath;
};

export const lagIngenFlytUrl = (sakstypeKode: string, saksnummer: number | string, behandlingID: number) =>
  `/${sakstypeKode}/behandling/${saksnummer}/?behandlingID=${behandlingID}`;

export const lagÅrsavregningFlytUrl = (sakstypeKode: string, saksnummer: number | string, behandlingID: number) =>
  `/${sakstypeKode}/aarsavregning/${saksnummer}/?behandlingID=${behandlingID}`;

export const lagUrl = (
  saksnummer: number | string,
  behandlingID: number,
  sakstypeKode: string,
  sakstemaKode: string,
  behandlingstemaKode: string,
  behandlingstypeKode: string,
  erPensjonistToggleEnabled?: boolean,
  erPensjonistEØSToggleEnabled?: boolean,
) => {
  if (
    skalViseIngenFlyt(
      sakstypeKode,
      sakstemaKode,
      behandlingstemaKode,
      behandlingstypeKode,
      erPensjonistToggleEnabled,
      erPensjonistEØSToggleEnabled,
    )
  ) {
    return lagIngenFlytUrl(sakstypeKode, saksnummer, behandlingID);
  }

  if (behandlingstypeKode === MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING) {
    return lagÅrsavregningFlytUrl(sakstypeKode, saksnummer, behandlingID);
  }

  return lagUrlFraSakstypeOgBehandlingstema(saksnummer, behandlingID, sakstypeKode, behandlingstemaKode);
};

export const harUnntaksregistreringFlyt = (sakstype: string, sakstema: string, behandlingstema: string) => {
  if (sakstema !== MKV.Koder.sakstemaer.UNNTAK) {
    return false;
  }

  if (
    sakstype === TRYGDEAVTALE &&
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL
  ) {
    return true;
  }

  if (sakstype === TRYGDEAVTALE && behandlingstema === MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK) {
    return true;
  }

  if (sakstype === EU_EOS && behandlingstema === MKV.Koder.behandlinger.behandlingstema.A1_ANMODNING_OM_UNNTAK_PAPIR) {
    return true;
  }

  return false;
};

export const harIkkeYrkesaktivFlyt = (sakstype: string, behandlingstema: string) => {
  return sakstype !== FTRL && behandlingstema === MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV;
};

export const skalViseFullmektigFørPeriodeOgLand = (behandlingstema: string) => {
  if (
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV ||
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.PENSJONIST
  ) {
    return true;
  }
  return false;
};

export const skalViseIngenFlyt = (
  sakstype: string,
  sakstema: string,
  behandlingstema: string,
  behandlingstype: string,
  erPensjonsistToggleEnabled?: boolean,
  erPensjonistToggleEnabled_EØS?: boolean,
) => {
  // Årsavregning EØS offentlig tjenesteperson
  if (
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY &&
    behandlingstype === MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING
  ) {
    return true;
  }

  if (
    sakstype === EU_EOS &&
    sakstema === TRYGDEAVGIFT &&
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.PENSJONIST &&
    erPensjonistToggleEnabled_EØS
  ) {
    return false;
  }

  if (sakstema === MKV.Koder.sakstemaer.TRYGDEAVGIFT) {
    return true;
  }

  if ([HENVENDELSE, KLAGE].includes(behandlingstype)) {
    return true;
  }

  if (harUnntaksregistreringFlyt(sakstype, sakstema, behandlingstema)) return false;

  if (harIkkeYrkesaktivFlyt(sakstype, behandlingstema)) return false;

  if (
    sakstype === TRYGDEAVTALE &&
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL
  ) {
    return true;
  }

  if (
    sakstype === FTRL &&
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.PENSJONIST &&
    erPensjonsistToggleEnabled
  ) {
    return false;
  }

  return [
    MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK,
    MKV.Koder.behandlinger.behandlingstema.UNNTAK_MEDLEMSKAP,
    MKV.Koder.behandlinger.behandlingstema.FORESPØRSEL_TRYGDEMYNDIGHET,
    MKV.Koder.behandlinger.behandlingstema.TRYGDETID,
    MKV.Koder.behandlinger.behandlingstema.PENSJONIST,
    MKV.Koder.behandlinger.behandlingstema.A1_ANMODNING_OM_UNNTAK_PAPIR,
  ].includes(behandlingstema);
};

export const nyFane = (url: string) => {
  window.open(`${Constants.URL_BASENAME}/${url}`);
};
