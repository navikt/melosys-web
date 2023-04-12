import React from "react";

import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";

import Medlemskap from "./medlemskap";

const MedlemskapContainer = () => (
  <Nav.Container fluid>
    <Nav.Row className="tittel">
      <Nav.Column xs="12">
        <Nav.Typo.Systemtittel style={{ display: "inline", marginRight: "1em" }}>
          {KV.Menypunkter.Medlemskap.tittel}
        </Nav.Typo.Systemtittel>
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="12">
        <Medlemskap />
      </Nav.Column>
    </Nav.Row>
  </Nav.Container>
);

export default MedlemskapContainer;
