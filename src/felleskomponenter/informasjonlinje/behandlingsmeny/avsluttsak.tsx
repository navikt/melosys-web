import React from "react";
import { useDispatch, useSelector } from "react-redux";
import MKV from "../../../melosyskodeverk";
import * as Nav from "../../../navFrontend";
import { BekreftValgTypes } from "../../../modals/bekreftValgTypes";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { modalerOperations } from "../../../ducks/modaler";
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
  A1_ANMODNING_OM_UNNTAK_PAPIR,
} = MKV.Koder.behandlinger.behandlingstema;
const { NY_VURDERING, FØRSTEGANG, KLAGE, HENVENDELSE } = MKV.Koder.behandlinger.behandlingstyper;
const { EU_EOS, FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;
const { MEDLEMSKAP_LOVVALG } = MKV.Koder.sakstemaer;

const AvsluttSak = () => {
  const dispatch = useDispatch();
  const apneBekreftValgModal = (type: BekreftValgTypes) => dispatch(modalerOperations.visBekreftValg(type));

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const sakstema = useSelector(fagsakSelectors.SakstemaKodeSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const behandlingstype = useSelector(behandlingerSelectors.BehandlingstypeKodeSelector);

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

  const skalViseUnntaksHandlinger =
    redigerbart &&
    ((behandlingstemaErUnntak && sakstype === TRYGDEAVTALE) ||
      (behandlingstema === A1_ANMODNING_OM_UNNTAK_PAPIR && sakstype === EU_EOS));

  const skalViseSøknadenErInnvilget = () => {
    if (!redigerbart || sakstema !== MEDLEMSKAP_LOVVALG) {
      return false;
    }
    if (
      sakstype === FTRL &&
      [FØRSTEGANG, NY_VURDERING].includes(behandlingstype) &&
      [YRKESAKTIV, IKKE_YRKESAKTIV, PENSJONIST, UNNTAK_MEDLEMSKAP].includes(behandlingstema)
    ) {
      return true;
    }
    if (
      [EU_EOS, TRYGDEAVTALE].includes(sakstype) &&
      [FØRSTEGANG, NY_VURDERING].includes(behandlingstype) &&
      [
        YRKESAKTIV,
        IKKE_YRKESAKTIV,
        PENSJONIST,
        ARBEID_KUN_NORGE,
        UTSENDT_ARBEIDSTAKER,
        UTSENDT_SELVSTENDIG,
        ARBEID_TJENESTEPERSON_ELLER_FLY,
      ].includes(behandlingstema)
    ) {
      return true;
    }

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
        UTSENDT_ARBEIDSTAKER,
        UTSENDT_SELVSTENDIG,
      ].includes(behandlingstema)
    );
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
            <>
              <Handling tekst="Medhold på klage" onClick={() => apneBekreftValgModal(BekreftValgTypes.KLAGE_MEDHOLD)} />
              <Handling
                tekst="Klageinnstilling er oversendt til klageinstansen"
                onClick={() => apneBekreftValgModal(BekreftValgTypes.KLAGE_OVERSENDT_TIL_KLAGEINSTANSER)}
              />
              <Handling tekst="Klage er avvist" onClick={() => apneBekreftValgModal(BekreftValgTypes.KLAGE_AVVIST)} />
            </>
          )}
          {skalViseSøknadenErInnvilget() && (
            <Handling
              tekst="Søknaden er innvilget"
              onClick={() => apneBekreftValgModal(BekreftValgTypes.SOKNADEN_ER_INNVILGET)}
            />
          )}
          {skalViseSøknadenErAvslått() && (
            <Handling
              tekst="Søknaden er avslått"
              onClick={() => apneBekreftValgModal(BekreftValgTypes.SOKNADEN_ER_AVSLATT)}
            />
          )}
          {skalViseAvslåPgaManglendeOpplysninger() && (
            <Handling
              tekst="Avslå søknad pga. manglende opplysninger"
              onClick={() => dispatch(modalerOperations.visAvslagSoknad())}
            />
          )}
          {skalViseVedtakOmgjort && (
            <Handling
              tekst="Vedtaket er omgjort (fvl § 35)"
              onClick={() => apneBekreftValgModal(BekreftValgTypes.VEDTAKET_ER_OMGJORT)}
            />
          )}
          {skalViseUnntaksHandlinger && (
            <>
              <Handling
                tekst="Perioden er godkjent"
                onClick={() => apneBekreftValgModal(BekreftValgTypes.PERIODEN_ER_GODKJENT)}
              />
              <Handling
                tekst="Perioden er delvis godkjent"
                onClick={() => apneBekreftValgModal(BekreftValgTypes.PERIODEN_ER_DELVIS_GODKJENT)}
              />
              <Handling
                tekst="Medlem i folketrygden"
                onClick={() => apneBekreftValgModal(BekreftValgTypes.MEDLEM_I_FOLKETRYGDEN)}
              />
            </>
          )}
        </div>
      )}

      {skalViseFerdigbehandlet() && (
        <Handling tekst="Ferdigbehandlet" onClick={() => apneBekreftValgModal(BekreftValgTypes.FERDIGBEHANDLET)} />
      )}
      {skalViseBehandlingenErHenlagt() && (
        <Handling tekst="Søknaden/klagen er trukket" onClick={() => dispatch(modalerOperations.visHenlegg())} />
      )}
      {skalViseBehandlingenErBortfalt() && (
        <Handling
          tekst="Behandlingen er bortfalt"
          onClick={() => apneBekreftValgModal(BekreftValgTypes.AVSLUTT_SAK_SOM_BORTFALT)}
        />
      )}
    </Nav.Ekspanderbartpanel>
  );
};

export default AvsluttSak;
