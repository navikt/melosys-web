import React from "react";

import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";

import ArbeidsgivereNorge from "./arbeidsgivereNorge";

const ArbeidsforholdOgInntekt = () => (
  <Nav.Container fluid className="arbeidsforholdOgInntekt">
    <Nav.Row className="tittel">
      <Nav.Column xs="12">
        <Nav.Typo.Innholdstittel style={{ display: "inline", marginRight: "1em" }}>
          {KV.Menypunkter.ArbeidsforholdOgInntekt.tittel}
        </Nav.Typo.Innholdstittel>
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="12">
        <ArbeidsgivereNorge />
      </Nav.Column>
    </Nav.Row>
  </Nav.Container>
);

export default ArbeidsforholdOgInntekt;
