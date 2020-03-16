import MKV from './filtrertmelosyskodeverk';

export const erSoknad = behandlingstype => [
  MKV.Koder.behandlinger.behandlingstyper.SOEKNAD,
  MKV.Koder.behandlinger.behandlingstyper.SOEKNAD_IKKE_YRKESAKTIV,
  MKV.Koder.behandlinger.behandlingstyper.SOEKNAD_ARBEID_FLERE_LAND,
  MKV.Koder.behandlinger.behandlingstyper.SOEKNAD_ARBEID_NORGE_BOSATT_ANNET_LAND,
].includes(behandlingstype);
