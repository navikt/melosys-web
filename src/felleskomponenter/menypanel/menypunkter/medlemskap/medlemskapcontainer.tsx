import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";

import Medlemskap from "./medlemskap";

function MedlemskapContainer() {
  return (
    <Nav.Container fluid>
      <Nav.Row className="tittel">
        <Nav.Column xs="12">
          <Nav.Heading level="2" style={{ display: "inline", marginRight: "1em" }}>
            {KV.Menypunkter.Medlemskap.tittel}
          </Nav.Heading>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <Medlemskap />
        </Nav.Column>
      </Nav.Row>
    </Nav.Container>
  );
}

export default MedlemskapContainer;
