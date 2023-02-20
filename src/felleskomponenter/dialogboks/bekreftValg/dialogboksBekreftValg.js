import React from "react";
import PT from "prop-types";
import { connect } from "react-redux";

import * as Nav from "../../../navFrontend";

import Knapperad from "../../knapperad";

import { redigerbartSelectors } from "../../../ducks/redigerbart";

import "./dialogboksBekreftValg.css";

export const DialogboksBekreftValg = ({ bekreftCallback, avbrytCallback, redigerbart, ariaHideApp }) => (
  <Nav.Modal
    className="dialogboksFerdigbehandleSak"
    isOpen
    contentLabel="Ferdigbehandlet"
    onRequestClose={avbrytCallback}
    closeButton={false}
    shouldCloseOnOverlayClick
    ariaHideApp={ariaHideApp}
  >
    <Nav.Typo.Systemtittel>Ferdigbehandlet</Nav.Typo.Systemtittel>
    <Nav.Typo.Normaltekst className="normaltekst">
      Er du sikker på at saken er ferdigbehandlet? Vurder om du bør skrive et notat og/eller brev.
    </Nav.Typo.Normaltekst>
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
