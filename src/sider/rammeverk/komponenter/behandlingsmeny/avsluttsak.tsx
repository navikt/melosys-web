import React from "react";
import * as Nav from "../../../../utils/navFrontend";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";
import Handling from "./handling";

type avsluttSakProps = {
  avslaaSoknad: () => void;
  henleggSak: () => void;
  avsluttSakSomBortfalt: () => void;
  behandlingstema: string;
  behandlingstype: string;
  redigerbart: boolean;
};

const AvsluttSak = ({
  avslaaSoknad,
  henleggSak,
  avsluttSakSomBortfalt,
  behandlingstema,
  behandlingstype,
  redigerbart,
}: avsluttSakProps) => {
  const behandlingskategori = KV.Utils.mapBehandlingstemaToBehandlingskategori(behandlingstema);

  const behandlingstemaErTrygdetid = behandlingstema === MKV.Koder.behandlinger.behandlingstema.TRYGDETID;
  const behandlingstypeErNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const behandlingstypeErEndretPeriode = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE;

  const skalViseAvslaaSoknad = () => {
    switch (behandlingskategori) {
      case KV.Koder.Behandlingskategori.EØS_SAKSBEHANDLING:
        return redigerbart && !behandlingstypeErNyVurdering;
      case KV.Koder.Behandlingskategori.EØS_SED_BEHANDLING:
        return redigerbart && !behandlingstemaErTrygdetid;
      case KV.Koder.Behandlingskategori.EØS_REGISTRERING:
        return false;
      case KV.Koder.Behandlingskategori.EØS_VURDER_UTPEKING:
      case KV.Koder.Behandlingskategori.FTRL_SAKSBEHANDLING:
      case KV.Koder.Behandlingskategori.TRYGDEAVTALE_SAKSBEHANDLING:
        return redigerbart;
      default:
        return false;
    }
  };

  const skalViseHenleggSak = () => {
    switch (behandlingskategori) {
      case KV.Koder.Behandlingskategori.EØS_SAKSBEHANDLING:
        return redigerbart && !behandlingstypeErEndretPeriode;
      case KV.Koder.Behandlingskategori.EØS_SED_BEHANDLING:
        return redigerbart && !behandlingstemaErTrygdetid;
      case KV.Koder.Behandlingskategori.EØS_REGISTRERING:
        return false;
      case KV.Koder.Behandlingskategori.EØS_VURDER_UTPEKING:
      case KV.Koder.Behandlingskategori.FTRL_SAKSBEHANDLING:
      case KV.Koder.Behandlingskategori.TRYGDEAVTALE_SAKSBEHANDLING:
        return redigerbart;
      default:
        return false;
    }
  };

  const skalViseAvsluttSak = () => {
    switch (behandlingskategori) {
      case KV.Koder.Behandlingskategori.EØS_SAKSBEHANDLING:
        return redigerbart && !behandlingstypeErNyVurdering;
      case KV.Koder.Behandlingskategori.EØS_SED_BEHANDLING:
      case KV.Koder.Behandlingskategori.EØS_VURDER_UTPEKING:
      case KV.Koder.Behandlingskategori.FTRL_SAKSBEHANDLING:
      case KV.Koder.Behandlingskategori.TRYGDEAVTALE_SAKSBEHANDLING:
        return redigerbart;
      case KV.Koder.Behandlingskategori.EØS_REGISTRERING:
      default:
        return false;
    }
  };

  if (!skalViseAvslaaSoknad() && !skalViseHenleggSak() && !skalViseAvsluttSak()) return null;

  return (
    <Nav.EkspanderbartpanelBase
      ariaTittel="avsluttsak"
      className="behandlingsmeny__meny__avslutt-sak"
      heading={<div className="title">Avslutt sak</div>}
    >
      {skalViseAvslaaSoknad() && <Handling tekst="Avslå søknad pga. manglende opplysninger" onClick={avslaaSoknad} />}
      {skalViseHenleggSak() && <Handling tekst="Henlegg sak" onClick={henleggSak} />}
      {skalViseAvsluttSak() && <Handling tekst="Avslutt sak som bortfalt" onClick={avsluttSakSomBortfalt} />}
    </Nav.EkspanderbartpanelBase>
  );
};

export default AvsluttSak;
