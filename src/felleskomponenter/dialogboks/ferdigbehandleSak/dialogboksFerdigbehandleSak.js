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
    <Nav.Typo.Systemtittel className="overskrift">Ferdigbehandlet uten nytt vedtak</Nav.Typo.Systemtittel>
    <Knapperad
      bekreft={ferdigbehandleSak}
      bekreftTekst="BEKREFT"
      avbryt={avbryt}
      avbrytTekst="AVBRYT"
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
  redigerbart: redigerbartSelectors.ModalFerdigbehandleSakRedigerbartSelector(state),
});

export default connect(mapStateToProps)(DialogboksFerdigbehandleSak);
