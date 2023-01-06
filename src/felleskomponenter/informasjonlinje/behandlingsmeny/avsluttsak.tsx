import React from "react";
import MKV from "../../../melosyskodeverk";
import * as Api from "../../../services/api";
import * as Nav from "../../../navFrontend";
import Handling from "./handling";

const {
  YRKESAKTIV,
  IKKE_YRKESAKTIV,
  ARBEID_KUN_NORGE,
  PENSJONIST,
  UNNTAK_MEDLEMSKAP,
  ARBEID_TJENESTEPERSON_ELLER_FLY,
  ANMODNING_OM_UNNTAK_HOVEDREGEL,
  REGISTRERING_UNNTAK,
  BESLUTNING_LOVVALG_NORGE,
  UTSENDT_ARBEIDSTAKER,
  UTSENDT_SELVSTENDIG,
  ARBEID_FLERE_LAND,
} = MKV.Koder.behandlinger.behandlingstema;
const { NY_VURDERING, FØRSTEGANG, KLAGE, HENVENDELSE } = MKV.Koder.behandlinger.behandlingstyper;
const { EU_EOS, FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;
const { MEDLEMSKAP_LOVVALG } = MKV.Koder.sakstemaer;
const {
  MEDLEM_I_FOLKETRYGDEN,
  UNNTATT_MEDLEMSKAP,
  FASTSATT_LOVVALGSLAND,
  AVSLAG_SØKNAD,
  MEDHOLD,
  KLAGEINNSTILLING,
  AVVIST_KLAGE,
  OMGJORT,
  REGISTRERT_UNNTAK,
  DELVIS_GODKJENT_UNNTAK,
} = MKV.Koder.behandlinger.behandlingsresultattyper;

type avsluttSakProps = {
  avslaaSoknad: () => void;
  behandlingID: string;
  henleggSak: () => void;
  avsluttSakSomBortfalt: () => void;
  ferdigbehandleSak: () => void;
  sakstema: string;
  sakstype: string;
  behandlingstema: string;
  behandlingstype: string;
  redigerbart: boolean;
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
  ferdigbehandleSak,
  redigerbart,
}: avsluttSakProps) => {
  const behandlingstypeErNyVurdering = behandlingstype === NY_VURDERING;
  const behandlingstypeErKlage = behandlingstype === KLAGE;
  const behandlingstemaErUnntak =
    behandlingstema === ANMODNING_OM_UNNTAK_HOVEDREGEL || behandlingstema === REGISTRERING_UNNTAK;

  const skalViseAvslåPgaManglendeOpplysninger = () => {
    if (!redigerbart || sakstema !== MEDLEMSKAP_LOVVALG) return false;

    if (sakstype === EU_EOS) {
      return (
        [FØRSTEGANG, NY_VURDERING].includes(behandlingstype) &&
        [
          UTSENDT_ARBEIDSTAKER,
          UTSENDT_SELVSTENDIG,
          ARBEID_TJENESTEPERSON_ELLER_FLY,
          ARBEID_FLERE_LAND,
          IKKE_YRKESAKTIV,
          ARBEID_KUN_NORGE,
          PENSJONIST,
        ].includes(behandlingstema)
      );
    }
    if (sakstype === FTRL) {
      return (
        [FØRSTEGANG, NY_VURDERING].includes(behandlingstype) &&
        [YRKESAKTIV, IKKE_YRKESAKTIV, PENSJONIST, UNNTAK_MEDLEMSKAP].includes(behandlingstema)
      );
    }
    if (sakstype === TRYGDEAVTALE) {
      return (
        ![HENVENDELSE, KLAGE].includes(behandlingstype) &&
        [YRKESAKTIV, IKKE_YRKESAKTIV, PENSJONIST].includes(behandlingstema)
      );
    }

    return false;
  };

  const skalViseBehandlingenErHenlagt = () => {
    if (!redigerbart || sakstema !== MEDLEMSKAP_LOVVALG) return false;

    if (sakstype === EU_EOS) {
      return (
        [FØRSTEGANG, NY_VURDERING].includes(behandlingstype) &&
        [
          UTSENDT_ARBEIDSTAKER,
          UTSENDT_SELVSTENDIG,
          ARBEID_TJENESTEPERSON_ELLER_FLY,
          ARBEID_FLERE_LAND,
          IKKE_YRKESAKTIV,
          ARBEID_KUN_NORGE,
          PENSJONIST,
        ].includes(behandlingstema)
      );
    }
    if (sakstype === FTRL) {
      return (
        ![HENVENDELSE, KLAGE].includes(behandlingstype) &&
        [YRKESAKTIV, IKKE_YRKESAKTIV, PENSJONIST, UNNTAK_MEDLEMSKAP].includes(behandlingstema)
      );
    }
    if (sakstype === TRYGDEAVTALE) {
      return (
        ![HENVENDELSE, KLAGE].includes(behandlingstype) &&
        [YRKESAKTIV, IKKE_YRKESAKTIV, PENSJONIST].includes(behandlingstema)
      );
    }

    return false;
  };

  const skalViseBehandlingenErBortfalt = () => {
    return redigerbart;
  };

  const skalViseFerdigbehandlet = () => {
    switch (behandlingstema) {
      case BESLUTNING_LOVVALG_NORGE:
      case UTSENDT_ARBEIDSTAKER:
      case UTSENDT_SELVSTENDIG:
      case ARBEID_TJENESTEPERSON_ELLER_FLY:
      case ARBEID_FLERE_LAND:
        return redigerbart && (behandlingstypeErNyVurdering || behandlingstype === HENVENDELSE);
      default:
        return redigerbart;
    }
  };

  const skalViseKlageHandlinger = redigerbart && behandlingstypeErKlage;

  const skalViseVedtakOmgjort = redigerbart && behandlingstypeErNyVurdering;

  const skalViseUnntaksHandlinger = redigerbart && behandlingstemaErUnntak && sakstype === TRYGDEAVTALE;

  const skalViseSøknadenErInnvilget = () => {
    if (!redigerbart || sakstema !== MEDLEMSKAP_LOVVALG) {
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
      [YRKESAKTIV, IKKE_YRKESAKTIV, PENSJONIST, ARBEID_KUN_NORGE].includes(behandlingstema)
    )
      return true;

    return false;
  };

  const skalViseSøknadenErAvslått = () => {
    if (!redigerbart || sakstema !== MEDLEMSKAP_LOVVALG) {
      return false;
    }

    return (
      [FØRSTEGANG, NY_VURDERING].includes(behandlingstype) &&
      [
        ARBEID_TJENESTEPERSON_ELLER_FLY,
        ARBEID_KUN_NORGE,
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
        return behandlingstema === UNNTAK_MEDLEMSKAP ? UNNTATT_MEDLEMSKAP : MEDLEM_I_FOLKETRYGDEN;
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

  const skalKunneAngiBehandlingsresultat =
    skalViseSøknadenErInnvilget() ||
    skalViseSøknadenErAvslått() ||
    skalViseAvslåPgaManglendeOpplysninger() ||
    skalViseVedtakOmgjort ||
    skalViseKlageHandlinger ||
    skalViseUnntaksHandlinger;

  if (
    !skalViseBehandlingenErHenlagt() &&
    !skalViseBehandlingenErBortfalt() &&
    !skalViseFerdigbehandlet() &&
    !skalKunneAngiBehandlingsresultat
  )
    return null;

  return (
    <Nav.Ekspanderbartpanel
      className="behandlingsmeny__meny__avslutt-sak"
      tittel={<div className="title">Avslutt sak</div>}
    >
      {skalKunneAngiBehandlingsresultat && (
        <div className="skillestrek">
          {skalViseKlageHandlinger && (
            <Handling tekst="Medhold på klage" onClick={() => angiBehandlingsresultattype(MEDHOLD)} />
          )}
          {skalViseKlageHandlinger && (
            <Handling
              tekst="Klageinnstilling er oversendt til klageinstansen"
              onClick={() => angiBehandlingsresultattype(KLAGEINNSTILLING)}
            />
          )}
          {skalViseKlageHandlinger && (
            <Handling tekst="Klage er avvist" onClick={() => angiBehandlingsresultattype(AVVIST_KLAGE)} />
          )}
          {skalViseSøknadenErInnvilget() && (
            <Handling tekst="Søknaden er innvilget" onClick={() => angiBehandlingsresultattype(mapType())} />
          )}
          {skalViseSøknadenErAvslått() && (
            <Handling tekst="Søknaden er avslått" onClick={() => angiBehandlingsresultattype(AVSLAG_SØKNAD)} />
          )}
          {skalViseAvslåPgaManglendeOpplysninger() && (
            <Handling tekst="Avslå søknad pga. manglende opplysninger" onClick={avslaaSoknad} />
          )}
          {skalViseVedtakOmgjort && (
            <Handling tekst="Vedtaket er omgjort (fvl § 35)" onClick={() => angiBehandlingsresultattype(OMGJORT)} />
          )}
          {skalViseUnntaksHandlinger && (
            <>
              <Handling tekst="Perioden er godkjent" onClick={() => angiBehandlingsresultattype(REGISTRERT_UNNTAK)} />
              <Handling
                tekst="Perioden er delvis godkjent"
                onClick={() => angiBehandlingsresultattype(DELVIS_GODKJENT_UNNTAK)}
              />
              <Handling
                tekst="Medlem i folketrygden"
                onClick={() => angiBehandlingsresultattype(MEDLEM_I_FOLKETRYGDEN)}
              />
            </>
          )}
        </div>
      )}

      {skalViseFerdigbehandlet() && <Handling tekst="Ferdigbehandlet" onClick={ferdigbehandleSak} />}
      {skalViseBehandlingenErHenlagt() && <Handling tekst="Søknaden/klagen er trukket" onClick={henleggSak} />}
      {skalViseBehandlingenErBortfalt() && (
        <Handling tekst="Behandlingen er bortfalt" onClick={avsluttSakSomBortfalt} />
      )}
    </Nav.Ekspanderbartpanel>
  );
};

export default AvsluttSak;
