import { useSelector } from "react-redux";
import { useDispatch } from "../../../hooks";
import MKV from "../../../melosyskodeverk";
import { BekreftValgTypes } from "../../../modals/bekreftValgTypes";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { modalerOperations } from "../../../ducks/modaler";
import Handling from "./handling";
import { useFeatureToggle } from "../../../featuretoggle";
import { MELOSYS_FAKTURERINGSKOMPONENTEN_IKKE_TIDLIGERE_PERIODER } from "../../../featuretoggle/toggleNavn";

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
const { NY_VURDERING, FØRSTEGANG, KLAGE, HENVENDELSE, MANGLENDE_INNBETALING_TRYGDEAVGIFT, ÅRSAVREGNING } =
  MKV.Koder.behandlinger.behandlingstyper;
const { EU_EOS, FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;
const { MEDLEMSKAP_LOVVALG, UNNTAK, TRYGDEAVGIFT } = MKV.Koder.sakstemaer;

function AvsluttSak() {
  const dispatch = useDispatch();
  const apneBekreftValgModal = (type: BekreftValgTypes) => dispatch(modalerOperations.visBekreftValg(type));

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const sakstema = useSelector(fagsakSelectors.SakstemaKodeSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const behandlingstype = useSelector(behandlingerSelectors.BehandlingstypeKodeSelector);
  const erIkkeTidligerePerioderToggleEnabled = useFeatureToggle(
    MELOSYS_FAKTURERINGSKOMPONENTEN_IKKE_TIDLIGERE_PERIODER,
  );

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
        [FØRSTEGANG, NY_VURDERING].includes(behandlingstype) &&
        [YRKESAKTIV, IKKE_YRKESAKTIV, PENSJONIST].includes(behandlingstema)
      );
    }

    return false;
  };

  const skalViseSøknadKlagenErTrukket = () => {
    if (!redigerbart || sakstema !== MEDLEMSKAP_LOVVALG) return false;

    if (sakstype === EU_EOS) {
      return (
        [FØRSTEGANG, NY_VURDERING, MANGLENDE_INNBETALING_TRYGDEAVGIFT].includes(behandlingstype) &&
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
        [FØRSTEGANG, NY_VURDERING, MANGLENDE_INNBETALING_TRYGDEAVGIFT].includes(behandlingstype) &&
        [YRKESAKTIV, IKKE_YRKESAKTIV, PENSJONIST, UNNTAK_MEDLEMSKAP].includes(behandlingstema)
      );
    }
    if (sakstype === TRYGDEAVTALE) {
      return (
        [FØRSTEGANG, NY_VURDERING, MANGLENDE_INNBETALING_TRYGDEAVGIFT].includes(behandlingstype) &&
        [YRKESAKTIV, IKKE_YRKESAKTIV, PENSJONIST].includes(behandlingstema)
      );
    }

    return false;
  };

  const skalViseBehandlingenErBortfalt = () => redigerbart && behandlingstype !== HENVENDELSE;

  const skalViseFerdigbehandlet = () => {
    switch (behandlingstema) {
      case BESLUTNING_LOVVALG_NORGE:
      case UTSENDT_ARBEIDSTAKER:
      case UTSENDT_SELVSTENDIG:
      case ARBEID_TJENESTEPERSON_ELLER_FLY:
        return (
          redigerbart &&
          sakstype === EU_EOS &&
          [NY_VURDERING, HENVENDELSE, MANGLENDE_INNBETALING_TRYGDEAVGIFT, ÅRSAVREGNING].includes(behandlingstype)
        );
      case ARBEID_FLERE_LAND:
        return redigerbart && sakstype === EU_EOS;
      default:
        return redigerbart;
    }
  };

  const skalViseKlageHandlinger = redigerbart && behandlingstype === KLAGE;

  const skalViseVedtakOmgjort = () => {
    if (!redigerbart) return false;

    if (sakstype === EU_EOS) {
      return (
        behandlingstype === NY_VURDERING &&
        [
          BESLUTNING_LOVVALG_NORGE,
          UTSENDT_ARBEIDSTAKER,
          UTSENDT_SELVSTENDIG,
          ARBEID_TJENESTEPERSON_ELLER_FLY,
          ARBEID_FLERE_LAND,
          IKKE_YRKESAKTIV,
          ARBEID_KUN_NORGE,
          YRKESAKTIV,
        ].includes(behandlingstema)
      );
    }
    if (sakstype === FTRL) {
      return behandlingstype === NY_VURDERING;
    }
    if (sakstype === TRYGDEAVTALE) {
      return behandlingstype === NY_VURDERING && [YRKESAKTIV, IKKE_YRKESAKTIV, PENSJONIST].includes(behandlingstema);
    }

    return false;
  };

  const skalViseUnntaksHandlinger = () => {
    if (!redigerbart || sakstema !== UNNTAK) return false;

    if (sakstype === EU_EOS) {
      return [FØRSTEGANG, NY_VURDERING].includes(behandlingstype) && behandlingstema === A1_ANMODNING_OM_UNNTAK_PAPIR;
    }
    if (sakstype === TRYGDEAVTALE) {
      return (
        [FØRSTEGANG, NY_VURDERING].includes(behandlingstype) &&
        [ANMODNING_OM_UNNTAK_HOVEDREGEL, REGISTRERING_UNNTAK].includes(behandlingstema)
      );
    }

    return false;
  };

  const skalViseSøknadenErInnvilget = () => {
    if (!redigerbart || sakstema !== MEDLEMSKAP_LOVVALG) {
      return false;
    }

    if (sakstype === EU_EOS) {
      return (
        [FØRSTEGANG, NY_VURDERING].includes(behandlingstype) &&
        [
          UTSENDT_ARBEIDSTAKER,
          UTSENDT_SELVSTENDIG,
          ARBEID_TJENESTEPERSON_ELLER_FLY,
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
        [FØRSTEGANG, NY_VURDERING].includes(behandlingstype) &&
        [YRKESAKTIV, IKKE_YRKESAKTIV, PENSJONIST].includes(behandlingstema)
      );
    }

    return false;
  };

  const skalViseSøknadenErAvslått = () => skalViseSøknadenErInnvilget();

  const skalViseAnnullerSak = () => {
    return (
      !erIkkeTidligerePerioderToggleEnabled &&
      Boolean(
        redigerbart &&
          [FTRL, EU_EOS].includes(sakstype) &&
          [MEDLEMSKAP_LOVVALG, TRYGDEAVGIFT].includes(sakstema) &&
          [NY_VURDERING, MANGLENDE_INNBETALING_TRYGDEAVGIFT].includes(behandlingstype),
      )
    );
  };

  if (
    !skalViseSøknadenErInnvilget() &&
    !skalViseSøknadenErAvslått() &&
    !skalViseAvslåPgaManglendeOpplysninger() &&
    !skalViseVedtakOmgjort() &&
    !skalViseKlageHandlinger &&
    !skalViseUnntaksHandlinger() &&
    !skalViseAnnullerSak() &&
    !skalViseSøknadKlagenErTrukket() &&
    !skalViseBehandlingenErBortfalt() &&
    !skalViseFerdigbehandlet()
  )
    return null;

  return (
    <>
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
      {skalViseVedtakOmgjort() && (
        <Handling
          tekst="Vedtaket er omgjort (fvl § 35)"
          onClick={() => apneBekreftValgModal(BekreftValgTypes.VEDTAKET_ER_OMGJORT)}
        />
      )}
      {skalViseUnntaksHandlinger() && (
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
      {skalViseAnnullerSak() && (
        <Handling
          tekst="Saken er annullert"
          onClick={() => apneBekreftValgModal(BekreftValgTypes.SAKEN_ER_ANNULLERT)}
        />
      )}
      <div className="divider" />
      {skalViseFerdigbehandlet() && (
        <Handling tekst="Ferdigbehandlet" onClick={() => apneBekreftValgModal(BekreftValgTypes.FERDIGBEHANDLET)} />
      )}
      {skalViseSøknadKlagenErTrukket() && (
        <Handling tekst="Søknaden/klagen er trukket" onClick={() => dispatch(modalerOperations.visHenlegg())} />
      )}
      {skalViseBehandlingenErBortfalt() && (
        <Handling
          tekst="Behandlingen er bortfalt"
          onClick={() => apneBekreftValgModal(BekreftValgTypes.AVSLUTT_SAK_SOM_BORTFALT)}
        />
      )}
    </>
  );
}

export default AvsluttSak;
