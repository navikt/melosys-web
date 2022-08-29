import * as Koder from "./koder";
import MKV from "../melosyskodeverk";

export const mapBehandlingstemaToBehandlingskategori = (behandlingstemaKode: string) => {
  switch (behandlingstemaKode) {
    case MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING:
    case MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE:
    case MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL:
      return Koder.Behandlingskategori.EØS_REGISTRERING;
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER:
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_ETT_LAND_ØVRIG:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND:
      return Koder.Behandlingskategori.EØS_SAKSBEHANDLING;
    case MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV:
    case MKV.Koder.behandlinger.behandlingstema.TRYGDETID:
    case MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_MED:
    case MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_UFM:
      return Koder.Behandlingskategori.EØS_SED_BEHANDLING;
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE:
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND:
      return Koder.Behandlingskategori.EØS_VURDER_UTPEKING;
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET:
      return Koder.Behandlingskategori.FTRL_SAKSBEHANDLING;
    case MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV:
      return Koder.Behandlingskategori.TRYGDEAVTALE_SAKSBEHANDLING;
    default:
      throw new Error(`Mangler mapping for ${behandlingstemaKode}`);
  }
};
