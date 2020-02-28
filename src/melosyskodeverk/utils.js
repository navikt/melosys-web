import MKV from './filtrertmelosyskodeverk';

export const erSoknad = behandlingstype => (
  behandlingstype === MKV.Koder.behandlinger.behandlingstyper.SOEKNAD ||
  behandlingstype === MKV.Koder.behandlinger.behandlingstyper.SOEKNAD_IKKE_YRKESAKTIV
);
