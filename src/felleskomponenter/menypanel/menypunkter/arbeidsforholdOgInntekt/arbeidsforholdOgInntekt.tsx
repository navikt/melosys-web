import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";

import ArbeidsgivereNorge from "./arbeidsgivereNorge";

function ArbeidsforholdOgInntekt() {
  return (
    <Nav.Container fluid className="arbeidsforholdOgInntekt">
      <Nav.Row className="tittel">
        <Nav.Column xs="12">
          <Nav.Heading size="small" style={{ display: "inline", marginRight: "1em" }}>
            {KV.Menypunkter.ArbeidsforholdOgInntekt.tittel}
          </Nav.Heading>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <ArbeidsgivereNorge />
        </Nav.Column>
      </Nav.Row>
    </Nav.Container>
  );
}

export default ArbeidsforholdOgInntekt;
