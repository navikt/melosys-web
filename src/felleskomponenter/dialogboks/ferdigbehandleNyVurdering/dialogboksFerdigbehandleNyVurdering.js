import React from "react";
import PT from "prop-types";
import { connect } from "react-redux";

import * as Nav from "../../../navFrontend";

import Knapperad from "../../knapperad";

import { redigerbartSelectors } from "../../../ducks/redigerbart";

import "./dialogboksFerdigbehandleNyVurdering.css";

export const DialogboksFerdigbehandleNyVurdering = ({
  ferdigbehandleNyVurdering,
  avbryt,
  redigerbart,
  ariaHideApp,
}) => (
  <Nav.Modal
    className="dialogboksFerdigbehandleNyVurdering"
    isOpen
    contentLabel="Avslutt behandling"
    onRequestClose={avbryt}
    closeButton={false}
    shouldCloseOnOverlayClick
    ariaHideApp={ariaHideApp}
  >
    <Nav.Typo.Systemtittel>Ferdigbehandlet</Nav.Typo.Systemtittel>
    <Nav.Typo.Normaltekst className="normaltekst">
      Er du sikker på at saken er ferdigbehandlet? Vurder om du bør skrive et notat/og eller brev.
    </Nav.Typo.Normaltekst>
    <Knapperad
      bekreft={ferdigbehandleNyVurdering}
      bekreftTekst="BEKREFT"
      avbryt={avbryt}
      avbrytTekst="AVBRYT"
      redigerbart={redigerbart}
    />
  </Nav.Modal>
);

DialogboksFerdigbehandleNyVurdering.propTypes = {
  ferdigbehandleNyVurdering: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  ariaHideApp: PT.bool,
  redigerbart: PT.bool.isRequired,
};

DialogboksFerdigbehandleNyVurdering.defaultProps = {
  ariaHideApp: true,
};

const mapStateToProps = (state) => ({
  redigerbart: redigerbartSelectors.BehandlingsmenyRedigerbartSelector(state),
});

export default connect(mapStateToProps)(DialogboksFerdigbehandleNyVurdering);
