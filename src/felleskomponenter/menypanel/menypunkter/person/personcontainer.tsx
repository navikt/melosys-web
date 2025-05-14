import { ComponentProps } from "react";

import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";

import Person from "./person";

import "./personcontainer.css";

type PersonContainerProps = ComponentProps<typeof Person>;

function PersonContainer({
  visArbeidsforholdRolleEtiketter,
  visMottatteOpplysningerData,
  endreFokus,
}: PersonContainerProps) {
  return (
    <Nav.Container fluid className="person">
      <Nav.Row className="tittel">
        <Nav.Column xs="12">
          <Nav.Heading level="2">{KV.Menypunkter.Person.tittel}</Nav.Heading>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <Person
            visArbeidsforholdRolleEtiketter={visArbeidsforholdRolleEtiketter}
            visMottatteOpplysningerData={visMottatteOpplysningerData}
            endreFokus={endreFokus}
          />
        </Nav.Column>
      </Nav.Row>
    </Nav.Container>
  );
}

export default PersonContainer;
