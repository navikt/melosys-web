import MKV from "../melosyskodeverk";

const { EU_EOS, FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;

const erSedBehandling = (behandlingstema: string) => {
  return [
    MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV,
    MKV.Koder.behandlinger.behandlingstema.TRYGDETID,
    MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_MED,
    MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_UFM,
  ].includes(behandlingstema);
};

export const lagUrlFraBehandlingstema = (
  saksnummer: number | string,
  behandlingID: number,
  behandlingstemaKode: string
) => {
  if (erSedBehandling(behandlingstemaKode)) {
    return `/${EU_EOS}/sedbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
  }
  switch (behandlingstemaKode) {
    case MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING:
    case MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE:
      return `/${EU_EOS}/registrering/${saksnummer}/unntaksperioder/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL:
      return `/${EU_EOS}/registrering/${saksnummer}/anmodningunntak/?behandlingID=${behandlingID}`;
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER:
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_ETT_LAND_ØVRIG:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND:
      return `/${EU_EOS}/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
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
