import React from "react";
import PT from "prop-types";

import * as Nav from "../../../navFrontend";

import Knapperad from "../../knapperad";

import "./dialogboksRevurderFagsak.css";

export const DialogboksRevurderFagsak = ({ bekreft, avbryt, ariaHideApp, spinner }) => (
  <Nav.Modal
    className="dialogboksRevurderFagsak"
    isOpen
    contentLabel="Revurder fagsak"
    onRequestClose={avbryt}
    closeButton={false}
    shouldCloseOnOverlayClick
    ariaHideApp={ariaHideApp}
  >
    <Nav.Typo.Systemtittel className="overskrift">Vurder saken på nytt</Nav.Typo.Systemtittel>
    <Knapperad
      bekreft={bekreft}
      bekreftTekst="BEKREFT"
      avbryt={avbryt}
      avbrytTekst="AVBRYT"
      redigerbart
      spinner={spinner}
    />
  </Nav.Modal>
);

DialogboksRevurderFagsak.propTypes = {
  bekreft: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  ariaHideApp: PT.bool,
  spinner: PT.bool,
};

DialogboksRevurderFagsak.defaultProps = {
  ariaHideApp: true,
  spinner: false,
};

export default DialogboksRevurderFagsak;
