import React from "react";
import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import MKV from "../../../melosyskodeverk";
import Handling from "./handling";
import { useFeatureToggle } from "../../../featuretoggle";

type avsluttSakProps = {
  avslaaSoknad: () => void;
  henleggSak: () => void;
  avsluttSakSomBortfalt: () => void;
  ferdigbehandleNyVurdering: () => void;
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
  ferdigbehandleNyVurdering,
  redigerbart,
}: avsluttSakProps) => {
  const behandlingskategori = KV.Utils.mapBehandlingstemaToBehandlingskategori(behandlingstema);

  const behandlingstemaErTrygdetid = behandlingstema === MKV.Koder.behandlinger.behandlingstema.TRYGDETID;
  const behandlingstypeErNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const behandlingstypeErEndretPeriode = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE;

  const avsluttUtenEndringToggle = useFeatureToggle("melosys.behandling.AVSLUTTE_UTEN_ENDRING");

  const skalViseAvslaaSoknad = () => {
    switch (behandlingskategori) {
      case KV.Koder.Behandlingskategori.EØS_SAKSBEHANDLING:
        return (
          (redigerbart && avsluttUtenEndringToggle === "enabled") || (redigerbart && !behandlingstypeErNyVurdering)
        ); // TODO: Sjekk på redigerbart alene er nok ved fjerning av toggle
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
        return (
          (redigerbart && avsluttUtenEndringToggle === "enabled") || (redigerbart && !behandlingstypeErNyVurdering)
        ); // TODO: Denne linjen kan fjernes ved fjerning av toggle
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
        return redigerbart && behandlingstypeErNyVurdering && avsluttUtenEndringToggle === "enabled";
      case KV.Koder.Behandlingskategori.EØS_REGISTRERING:
      default:
        return false;
    }
  };

  if (!skalViseAvslaaSoknad() && !skalViseHenleggSak() && !skalViseAvsluttSak() && !skalViseFerdigbehandlet())
    return null;

  return (
    <Nav.EkspanderbartpanelBase
      ariaTittel="avsluttsak"
      className="behandlingsmeny__meny__avslutt-sak"
      heading={<div className="title">Avslutt sak</div>}
    >
      {skalViseAvslaaSoknad() && <Handling tekst="Avslå søknad pga. manglende opplysninger" onClick={avslaaSoknad} />}
      {skalViseFerdigbehandlet() && <Handling tekst="Ferdigbehandlet" onClick={ferdigbehandleNyVurdering} />}
      {skalViseAvsluttSak() && <Handling tekst="Kan ikke behandles i Melosys" onClick={avsluttSakSomBortfalt} />}
      {skalViseHenleggSak() && <Handling tekst="Søknaden er henlagt/trukket" onClick={henleggSak} />}
    </Nav.EkspanderbartpanelBase>
  );
};

export default AvsluttSak;
