import React from "react";
import * as Api from "../../../services/api";
import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import MKV from "../../../melosyskodeverk";
import { useFeatureToggle } from "../../../featuretoggle";
import Handling from "./handling";

const {
  TRYGDETID,
  REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
  REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
  YRKESAKTIV,
  IKKE_YRKESAKTIV,
  ARBEID_KUN_NORGE,
  PENSJONIST,
  UNNTAK_MEDLEMSKAP,
  ARBEID_ETT_LAND_ØVRIG,
  ARBEID_TJENESTEPERSON_ELLER_FLY,
} = MKV.Koder.behandlinger.behandlingstema;
const { NY_VURDERING, ENDRET_PERIODE, FØRSTEGANG } = MKV.Koder.behandlinger.behandlingstyper;
const { EU_EOS, FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;
const { MEDLEMSKAP_LOVVALG } = MKV.Koder.sakstemaer;
const { MEDLEM_I_FOLKETRYGDEN, UNNTATT_MEDLEMSKAP, FASTSATT_LOVVALGSLAND, AVSLAG_SØKNAD } =
  MKV.Koder.behandlinger.behandlingsresultattyper;

type avsluttSakProps = {
  avslaaSoknad: () => void;
  behandlingID: string;
  henleggSak: () => void;
  avsluttSakSomBortfalt: () => void;
  ferdigbehandleNyVurdering: () => void;
  sakstema: string;
  sakstype: string;
  behandlingstema: string;
  behandlingstype: string;
  redigerbart: boolean;
  behandlingsstatus: string;
  tilForsiden: () => void;
};

const AvsluttSak = ({
  avslaaSoknad,
  behandlingID,
  tilForsiden,
  henleggSak,
  avsluttSakSomBortfalt,
  sakstema,
  sakstype,
  behandlingstema,
  behandlingstype,
  ferdigbehandleNyVurdering,
  redigerbart,
  behandlingsstatus,
}: avsluttSakProps) => {
  const sakstemaToggle = useFeatureToggle("melosys.sakstema");
  const behandlingskategori = KV.Utils.mapBehandlingstemaToBehandlingskategori(behandlingstema);
  const behandlingstemaErTrygdetid = behandlingstema === TRYGDETID;
  const behandlingstypeErNyVurdering = behandlingstype === NY_VURDERING;
  const behandlingstypeErEndretPeriode = behandlingstype === ENDRET_PERIODE;
  const behandlingstemaErUnntakNorskTrygdØvrigEllerUtstasjonering =
    behandlingstema === REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE ||
    behandlingstema === REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING;

  const skalViseAvslåPgaManglendeOpplysninger = () => {
    switch (behandlingskategori) {
      case KV.Koder.Behandlingskategori.EØS_SED_BEHANDLING:
        return redigerbart && !behandlingstemaErTrygdetid;
      case KV.Koder.Behandlingskategori.EØS_SAKSBEHANDLING:
      case KV.Koder.Behandlingskategori.EØS_VURDER_UTPEKING:
      case KV.Koder.Behandlingskategori.FTRL_SAKSBEHANDLING:
      case KV.Koder.Behandlingskategori.TRYGDEAVTALE_SAKSBEHANDLING:
        return redigerbart;
      case KV.Koder.Behandlingskategori.EØS_REGISTRERING:
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
      case KV.Koder.Behandlingskategori.EØS_VURDER_UTPEKING:
      case KV.Koder.Behandlingskategori.FTRL_SAKSBEHANDLING:
      case KV.Koder.Behandlingskategori.TRYGDEAVTALE_SAKSBEHANDLING:
        return redigerbart;
      case KV.Koder.Behandlingskategori.EØS_REGISTRERING:
      default:
        return false;
    }
  };

  const skalViseAvsluttSak = () => {
    if (
      behandlingstemaErUnntakNorskTrygdØvrigEllerUtstasjonering &&
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

  const skalViseSøknadenErInnvilget = () => {
    if (sakstemaToggle !== "enabled" || !redigerbart || sakstema !== MEDLEMSKAP_LOVVALG) {
      return false;
    }
    if (
      sakstype === FTRL &&
      [FØRSTEGANG, NY_VURDERING].includes(behandlingstype) &&
      [YRKESAKTIV, IKKE_YRKESAKTIV, PENSJONIST, UNNTAK_MEDLEMSKAP].includes(behandlingstema)
    )
      return true;
    if (
      [EU_EOS, TRYGDEAVTALE].includes(sakstype) &&
      [FØRSTEGANG, NY_VURDERING].includes(behandlingstype) &&
      [YRKESAKTIV, IKKE_YRKESAKTIV, PENSJONIST].includes(behandlingstema)
    )
      return true;
    if (
      [EU_EOS].includes(sakstype) &&
      [FØRSTEGANG, NY_VURDERING].includes(behandlingstype) &&
      [ARBEID_KUN_NORGE].includes(behandlingstema)
    )
      return true;
    return false;
  };

  const skalViseSøknadenErAvslått = () => {
    if (sakstemaToggle !== "enabled" || !redigerbart || sakstema !== MEDLEMSKAP_LOVVALG) {
      return false;
    }

    if (
      [EU_EOS].includes(sakstype) &&
      [FØRSTEGANG, NY_VURDERING].includes(behandlingstype) &&
      [ARBEID_KUN_NORGE].includes(behandlingstema)
    )
      return true;

    return (
      [FØRSTEGANG, NY_VURDERING].includes(behandlingstype) &&
      [
        ARBEID_ETT_LAND_ØVRIG,
        ARBEID_TJENESTEPERSON_ELLER_FLY,
        YRKESAKTIV,
        IKKE_YRKESAKTIV,
        PENSJONIST,
        UNNTAK_MEDLEMSKAP,
      ].includes(behandlingstema)
    );
  };

  const mapType = () => {
    switch (sakstype) {
      case FTRL:
        return behandlingstype === UNNTAK_MEDLEMSKAP ? UNNTATT_MEDLEMSKAP : MEDLEM_I_FOLKETRYGDEN;
      case EU_EOS:
      case TRYGDEAVTALE:
        return FASTSATT_LOVVALGSLAND;
      default:
        throw new Error("Finner ikke behandlingsresultattype for denne sakstypen");
    }
  };

  const angiBehandlingsresultattype = async (type: string) => {
    await Api.Behandlinger.resultat.angiBehandlingsresultattype(behandlingID, { type });
    tilForsiden();
  };

  if (
    !skalViseSøknadenErInnvilget() &&
    !skalViseSøknadenErAvslått() &&
    !skalViseAvslåPgaManglendeOpplysninger() &&
    !skalViseHenleggSak() &&
    !skalViseAvsluttSak() &&
    !skalViseFerdigbehandlet()
  )
    return null;

  return (
    <Nav.Ekspanderbartpanel
      className="behandlingsmeny__meny__avslutt-sak"
      tittel={<div className="title">Avslutt sak</div>}
    >
      {skalViseSøknadenErInnvilget() && (
        <Handling tekst="Søknaden er innvilget" onClick={() => angiBehandlingsresultattype(mapType())} />
      )}
      {skalViseSøknadenErAvslått() && (
        <Handling tekst="Søknaden er avslått" onClick={() => angiBehandlingsresultattype(AVSLAG_SØKNAD)} />
      )}
      {skalViseAvslåPgaManglendeOpplysninger() && (
        <Handling tekst="Avslå søknad pga. manglende opplysninger" onClick={avslaaSoknad} />
      )}
      {skalViseHenleggSak() && <Handling tekst="Søknaden er henlagt/trukket" onClick={henleggSak} />}
      {skalViseAvsluttSak() && <Handling tekst="Kan ikke behandles i Melosys" onClick={avsluttSakSomBortfalt} />}
      {skalViseFerdigbehandlet() && <Handling tekst="Ferdigbehandlet" onClick={ferdigbehandleNyVurdering} />}
    </Nav.Ekspanderbartpanel>
  );
};

export default AvsluttSak;
