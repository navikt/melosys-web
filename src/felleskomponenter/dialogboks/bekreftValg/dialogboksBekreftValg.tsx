import React from "react";
import { useDispatch, useSelector } from "react-redux";

import * as Nav from "../../../navFrontend";

import Knapperad from "../../knapperad";

import "./dialogboksBekreftValg.css";
import MKV from "../../../melosyskodeverk";
import * as Api from "../../../services/api";
import { BekreftValgTypes } from "../../../modals/bekreftValgTypes";
import { navigeringOperations } from "../../../ducks/navigering";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { modalerSelectors } from "../../../ducks/modaler";

interface DialogboksBekreftValgProps {
  handleAvbryt: () => void;
  ferdigbehandleSak: () => void;
  avsluttSakSomBortfalt: () => void;
  ariaHideApp?: boolean;
}
export const DialogboksBekreftValg = ({
  handleAvbryt,
  ariaHideApp = true,
  ferdigbehandleSak,
  avsluttSakSomBortfalt,
}: DialogboksBekreftValgProps) => {
  const dispatch = useDispatch();
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const sakstype = useSelector(fagsakSelectors.SaksnummerSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const bekreftValgType = useSelector(modalerSelectors.BekreftValgTypeSelector);
  const tilForsiden = () => dispatch(navigeringOperations.tilForsiden());

  const {
    MEDHOLD,
    KLAGEINNSTILLING,
    AVVIST_KLAGE,
    AVSLAG_SØKNAD,
    OMGJORT,
    REGISTRERT_UNNTAK,
    DELVIS_GODKJENT_UNNTAK,
    MEDLEM_I_FOLKETRYGDEN,
    FASTSATT_LOVVALGSLAND,
    UNNTATT_MEDLEMSKAP,
  } = MKV.Koder.behandlinger.behandlingsresultattyper;

  const { UNNTAK_MEDLEMSKAP } = MKV.Koder.behandlinger.behandlingstema;

  const { EU_EOS, FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;

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

  const hentBekreftValgDialogDataFraType = () => {
    switch (bekreftValgType) {
      case BekreftValgTypes.FERDIGBEHANDLET:
        return {
          tittel: "Ferdigbehandlet",
          tekst: "Er du sikker på at saken er ferdigbehandlet? Vurder om du bør skrive et notat og/eller brev.",
          handleBekreft: ferdigbehandleSak,
        };
      case BekreftValgTypes.VEDTAKET_ER_OMGJORT:
        return {
          tittel: "Vedtaket er omgjort (fvl §35)",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende vedtak før du bekrefter.",
          handleBekreft: () => angiBehandlingsresultattype(OMGJORT),
        };

      case BekreftValgTypes.SOKNADEN_ER_INNVILGET:
        return {
          tittel: "Søknaden er innvilget",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende vedtak før du bekrefter.",
          handleBekreft: () => angiBehandlingsresultattype(mapType()),
        };
      case BekreftValgTypes.SOKNADEN_ER_AVSLATT:
        return {
          tittel: "Søknaden er avslått",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende vedtak før du bekrefter.",
          handleBekreft: () => angiBehandlingsresultattype(AVSLAG_SØKNAD),
        };
      case BekreftValgTypes.PERIODEN_ER_GODKJENT:
        return {
          tittel: "Perioden er godkjent",
          tekst:
            "Er du sikker på at du vil avslutte saken? Vurder om du skal registrere periode i MEDL/skrive notat/etc.",
          handleBekreft: () => angiBehandlingsresultattype(REGISTRERT_UNNTAK),
        };
      case BekreftValgTypes.PERIODEN_ER_DELVIS_GODKJENT:
        return {
          tittel: "Perioden er delvis godkjent",
          tekst:
            "Er du sikker på at du vil avslutte saken? Vurder om du skal registrere periode i MEDL/skrive notat/etc.",
          handleBekreft: () => angiBehandlingsresultattype(DELVIS_GODKJENT_UNNTAK),
        };
      case BekreftValgTypes.MEDLEM_I_FOLKETRYGDEN:
        return {
          tittel: "Medlem i folketrygden",
          tekst:
            "Er du sikker på at du vil avslutte saken? Vurder om du skal registrere periode i MEDL/skrive notat/etc.",
          handleBekreft: () => angiBehandlingsresultattype(MEDLEM_I_FOLKETRYGDEN),
        };

      case BekreftValgTypes.KLAGE_MEDHOLD:
        return {
          tittel: "Medhold på klage",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende vedtak før du bekrefter.",
          handleBekreft: () => angiBehandlingsresultattype(MEDHOLD),
        };

      case BekreftValgTypes.KLAGE_AVVIST:
        return {
          tittel: "Klage er avvist",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende vedtak før du bekrefter.",
          handleBekreft: () => angiBehandlingsresultattype(AVVIST_KLAGE),
        };

      case BekreftValgTypes.KLAGE_OVERSENDT_TIL_KLAGEINSTANSER:
        return {
          tittel: "Klageinnstilling er oversendt til klageinstansen",
          tekst: "Er du sikker på at du vil avslutte saken? Husk å sende innstillingen før du bekrefter.",
          handleBekreft: () => angiBehandlingsresultattype(KLAGEINNSTILLING),
        };

      case BekreftValgTypes.AVSLUTT_SAK_SOM_BORTFALT:
        return {
          tittel: "Avslutt sak som bortfalt",
          tekst: "Er du sikker på at saken ikke kan behandles i Melosys? Vurder om du må opprette sak i annet system.",
          handleBekreft: avsluttSakSomBortfalt,
        };

      default:
        return {};
    }
  };

  const bekreftValgTypeData = hentBekreftValgDialogDataFraType();

  return (
    <Nav.Modal
      className="dialogboksBekreftValg"
      isOpen
      contentLabel={bekreftValgTypeData.tittel || ""}
      onRequestClose={handleAvbryt}
      closeButton={false}
      shouldCloseOnOverlayClick
      ariaHideApp={ariaHideApp}
    >
      <Nav.Typo.Systemtittel>{bekreftValgTypeData.tittel}</Nav.Typo.Systemtittel>
      <Nav.Typo.Normaltekst className="normaltekst">{bekreftValgTypeData.tekst}</Nav.Typo.Normaltekst>
      <Knapperad
        bekreft={bekreftValgTypeData.handleBekreft}
        bekreftTekst="Bekreft"
        avbryt={handleAvbryt}
        avbrytTekst="Avbryt"
        redigerbart
      />
    </Nav.Modal>
  );
};

export default DialogboksBekreftValg;
