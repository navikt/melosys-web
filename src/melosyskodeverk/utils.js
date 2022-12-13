import MKV from "./filtrertmelosyskodeverk";

// DEPRECATED. Vi vil ikke bruke denne i melosys.behandle_alle_saker
export const erSoknad = (behandlingstema) =>
  [
    MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
    MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG,
    MKV.Koder.behandlinger.behandlingstema.ARBEID_ETT_LAND_ØVRIG,
    MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY,
    MKV.Koder.behandlinger.behandlingstema.ARBEID_KUN_NORGE,
    MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV,
    MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND,
    MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND,
  ].includes(behandlingstema);

export const erBehandlingstemaSedTema = [
  MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
  MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
  MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE,
  MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND,
];

export const erBehandlingstemaSedTemaOgSakstypeEuEøs = [
  ...erBehandlingstemaSedTema,
  MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL,
];

export const erEOS = (sakstype) => {
  return sakstype === MKV.Koder.sakstyper.EU_EOS;
};

export const erBehandlingAvSed = (behandlingstema, sakstype) => {
  return erEOS(sakstype)
    ? erBehandlingstemaSedTemaOgSakstypeEuEøs.includes(behandlingstema)
    : erBehandlingstemaSedTema.includes(behandlingstema);
};

export const erUtsendt = (behandlingstema) =>
  [
    MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
    MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG,
  ].includes(behandlingstema);

export const kanHaFlereSoknadsland = (behandlingstema) =>
  [
    MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND,
    MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE,
    MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND,
  ].includes(behandlingstema);

export const erAvsluttetEllerMidlertidigBeslutning = (behandlingsstatus) =>
  [
    MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET,
    MKV.Koder.behandlinger.behandlingsstatus.MIDLERTIDIG_LOVVALGSBESLUTNING,
  ].includes(behandlingsstatus);

export const erHenlagtEllerHenlagtBortfalt = (saksstatus) =>
  [MKV.Koder.saksstatuser.HENLAGT, MKV.Koder.saksstatuser.HENLAGT_BORTFALT].includes(saksstatus);
