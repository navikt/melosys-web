import MKV from "./filtrertmelosyskodeverk";

export const erBehandlingAvSed = (sakstype, behandlingstema) => {
  switch (behandlingstema) {
    case MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING:
    case MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE:
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE:
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND:
    case MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL:
      return sakstype === MKV.Koder.sakstyper.EU_EOS;
    default:
      return false;
  }
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
