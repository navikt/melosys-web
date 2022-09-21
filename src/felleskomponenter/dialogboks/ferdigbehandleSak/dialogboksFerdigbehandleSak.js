import React from "react";
import PT from "prop-types";
import { connect } from "react-redux";

import * as Nav from "../../../navFrontend";

import Knapperad from "../../knapperad";

import { redigerbartSelectors } from "../../../ducks/redigerbart";

import "./dialogboksFerdigbehandleSak.css";

export const DialogboksFerdigbehandleSak = ({ ferdigbehandleSak, avbryt, redigerbart, ariaHideApp }) => (
  <Nav.Modal
    className="dialogboksFerdigbehandleSak"
    isOpen
    contentLabel="Ferdigbehandlet"
    onRequestClose={avbryt}
    closeButton={false}
    shouldCloseOnOverlayClick
    ariaHideApp={ariaHideApp}
  >
    <Nav.Typo.Systemtittel>Ferdigbehandlet</Nav.Typo.Systemtittel>
    <Nav.Typo.Normaltekst className="normaltekst">
      Er du sikker på at saken er ferdigbehandlet? Vurder om du bør skrive et notat og/eller brev.
    </Nav.Typo.Normaltekst>
    <Knapperad
      bekreft={ferdigbehandleSak}
      bekreftTekst="Bekreft"
      avbryt={avbryt}
      avbrytTekst="Avbryt"
      redigerbart={redigerbart}
    />
  </Nav.Modal>
);

DialogboksFerdigbehandleSak.propTypes = {
  ferdigbehandleSak: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  ariaHideApp: PT.bool,
  redigerbart: PT.bool.isRequired,
};

DialogboksFerdigbehandleSak.defaultProps = {
  ariaHideApp: true,
};

const mapStateToProps = (state) => ({
  redigerbart: redigerbartSelectors.BehandlingsmenyRedigerbartSelector(state),
});

export default connect(mapStateToProps)(DialogboksFerdigbehandleSak);
