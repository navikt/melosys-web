import React from "react";
import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import MKV from "../../../melosyskodeverk";
import Handling from "./handling";

type avsluttSakProps = {
  avslaaSoknad: () => void;
  henleggSak: () => void;
  avsluttSakSomBortfalt: () => void;
  ferdigbehandleNyVurdering: () => void;
  behandlingstema: string;
  behandlingstype: string;
  redigerbart: boolean;
  behandlingsstatus: string;
};

const AvsluttSak = ({
  avslaaSoknad,
  henleggSak,
  avsluttSakSomBortfalt,
  behandlingstema,
  behandlingstype,
  ferdigbehandleNyVurdering,
  redigerbart,
  behandlingsstatus,
}: avsluttSakProps) => {
  const behandlingskategori = KV.Utils.mapBehandlingstemaToBehandlingskategori(behandlingstema);

  const behandlingstemaErTrygdetid = behandlingstema === MKV.Koder.behandlinger.behandlingstema.TRYGDETID;
  const behandlingstypeErNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const behandlingstypeErEndretPeriode = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE;
  const behandlingstypeErUnntakNorskTrygdØvrigEllerUtstasjonering =
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE ||
    MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING;

  const skalViseAvslaaSoknad = () => {
    switch (behandlingskategori) {
      case KV.Koder.Behandlingskategori.EØS_SAKSBEHANDLING:
        return redigerbart;
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
    if (
      behandlingstypeErUnntakNorskTrygdØvrigEllerUtstasjonering &&
      behandlingsstatus === MKV.Koder.behandlinger.behandlingsstatus.VURDER_DOKUMENT
    ) {
      return true;
    }
    switch (behandlingskategori) {
      case KV.Koder.Behandlingskategori.EØS_SAKSBEHANDLING:
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

  const skalViseFerdigbehandlet = () => {
    switch (behandlingskategori) {
      case KV.Koder.Behandlingskategori.EØS_SAKSBEHANDLING:
      case KV.Koder.Behandlingskategori.EØS_SED_BEHANDLING:
      case KV.Koder.Behandlingskategori.EØS_VURDER_UTPEKING:
      case KV.Koder.Behandlingskategori.FTRL_SAKSBEHANDLING:
      case KV.Koder.Behandlingskategori.TRYGDEAVTALE_SAKSBEHANDLING:
        return redigerbart && behandlingstypeErNyVurdering;
      case KV.Koder.Behandlingskategori.EØS_REGISTRERING:
      default:
        return false;
    }
  };

  if (!skalViseAvslaaSoknad() && !skalViseHenleggSak() && !skalViseAvsluttSak() && !skalViseFerdigbehandlet())
    return null;

  return (
    <Nav.Ekspanderbartpanel
      className="behandlingsmeny__meny__avslutt-sak"
      tittel={<div className="title">Avslutt sak</div>}
    >
      {skalViseAvslaaSoknad() && <Handling tekst="Avslå søknad pga. manglende opplysninger" onClick={avslaaSoknad} />}
      {skalViseFerdigbehandlet() && <Handling tekst="Ferdigbehandlet" onClick={ferdigbehandleNyVurdering} />}
      {skalViseAvsluttSak() && <Handling tekst="Kan ikke behandles i Melosys" onClick={avsluttSakSomBortfalt} />}
      {skalViseHenleggSak() && <Handling tekst="Søknaden er henlagt/trukket" onClick={henleggSak} />}
    </Nav.Ekspanderbartpanel>
  );
};

export default AvsluttSak;
