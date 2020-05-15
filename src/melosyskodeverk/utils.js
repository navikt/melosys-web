import MKV from './filtrertmelosyskodeverk';

export const erSoknad = behandlingstema => [
  MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
  MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG,
  MKV.Koder.behandlinger.behandlingstema.ARBEID_ETT_LAND_ØVRIG,
  MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV,
  MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND,
  MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND,
].includes(behandlingstema);

export const erUtsendt = behandlingstema => [
  MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
  MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG,
].includes(behandlingstema);
