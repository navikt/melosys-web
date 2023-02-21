import React from "react";
import PT from "prop-types";
import { connect } from "react-redux";

import * as Nav from "../../../navFrontend";

import Knapperad from "../../knapperad";

import { redigerbartSelectors } from "../../../ducks/redigerbart";

import "./dialogboksBekreftValg.css";

export const DialogboksBekreftValg = ({ handleBekreft, handleAvbryt, tittel, tekst, redigerbart, ariaHideApp }) => (
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
      redigerbart={redigerbart}
    />
  </Nav.Modal>
);

DialogboksBekreftValg.propTypes = {
  handleBekreft: PT.func.isRequired,
  handleAvbryt: PT.func.isRequired,
  tittel: PT.string.isRequired,
  tekst: PT.string.isRequired,
  ariaHideApp: PT.bool,
  redigerbart: PT.bool.isRequired,
};

DialogboksBekreftValg.defaultProps = {
  ariaHideApp: true,
};

const mapStateToProps = (state) => ({
  redigerbart: redigerbartSelectors.BehandlingsmenyRedigerbartSelector(state),
});

export default connect(mapStateToProps)(DialogboksBekreftValg);
