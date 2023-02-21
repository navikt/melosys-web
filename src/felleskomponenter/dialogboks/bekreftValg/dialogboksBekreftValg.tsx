import React from "react";
import { useSelector } from "react-redux";

import * as Nav from "../../../navFrontend";

import Knapperad from "../../knapperad";

import { redigerbartSelectors } from "../../../ducks/redigerbart";

import "./dialogboksBekreftValg.css";

interface DialogboksBekreftValgProps {
  handleBekreft: () => void;
  handleAvbryt: () => void;
  tittel: string;
  tekst: string;
  redigerbart: boolean;
  ariaHideApp?: boolean;
}
export const DialogboksBekreftValg = ({
  handleBekreft,
  handleAvbryt,
  tittel,
  tekst,
  ariaHideApp,
}: DialogboksBekreftValgProps) => {
  const erBehandlingRedigerbart = useSelector(redigerbartSelectors.BehandlingsmenyRedigerbartSelector);

  return (
    <Nav.Modal
      className="dialogboksBekreftValg"
      isOpen
      contentLabel={tittel}
      onRequestClose={handleAvbryt}
      closeButton={false}
      shouldCloseOnOverlayClick
      ariaHideApp={ariaHideApp}
    >
      <Nav.Typo.Systemtittel>{tittel}</Nav.Typo.Systemtittel>
      <Nav.Typo.Normaltekst className="normaltekst">{tekst}</Nav.Typo.Normaltekst>
      <Knapperad
        bekreft={handleBekreft}
        bekreftTekst="Bekreft"
        avbryt={handleAvbryt}
        avbrytTekst="Avbryt"
        redigerbart={erBehandlingRedigerbart}
      />
    </Nav.Modal>
  );
};

DialogboksBekreftValg.defaultProps = {
  ariaHideApp: true,
};

export default DialogboksBekreftValg;
