import React from "react";
import PT from "prop-types";
import { connect } from "react-redux";

import * as Nav from "../../../navFrontend";

import Knapperad from "../../knapperad";

import { redigerbartSelectors } from "../../../ducks/redigerbart";

import "./dialogboksBekreftValg.css";

export const DialogboksBekreftValg = ({ bekreftCallback, avbrytCallback, tittel, tekst, redigerbart, ariaHideApp }) => (
  <Nav.Modal
    className="dialogboksBekreftValg"
    isOpen
    contentLabel={tittel}
    onRequestClose={avbrytCallback}
    closeButton={false}
    shouldCloseOnOverlayClick
    ariaHideApp={ariaHideApp}
  >
    <Nav.Typo.Systemtittel>{tittel}</Nav.Typo.Systemtittel>
    <Nav.Typo.Normaltekst className="normaltekst">{tekst}</Nav.Typo.Normaltekst>
    <Knapperad
      bekreft={bekreftCallback}
      bekreftTekst="Bekreft"
      avbryt={avbrytCallback}
      avbrytTekst="Avbryt"
      redigerbart={redigerbart}
    />
  </Nav.Modal>
);

DialogboksBekreftValg.propTypes = {
  bekreftCallback: PT.func.isRequired,
  avbrytCallback: PT.func.isRequired,
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
