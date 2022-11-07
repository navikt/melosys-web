import React, { ComponentProps } from "react";

import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";

import Person from "./person";

import "./personcontainer.css";

type PersonContainerProps = ComponentProps<typeof Person>;

const PersonContainer = ({
  redigerbart,
  visArbeidsforholdRolleEtiketter,
  visMottatteOpplysningerData,
}: PersonContainerProps) => (
  <Nav.Container fluid className="barnetrygd">
    <Nav.Row className="tittel">
      <Nav.Column xs="12">
        <Nav.Typo.Innholdstittel>{KV.Menypunkter.Person.tittel}</Nav.Typo.Innholdstittel>
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="12">
        <Person
          redigerbart={redigerbart}
          visArbeidsforholdRolleEtiketter={visArbeidsforholdRolleEtiketter}
          visMottatteOpplysningerData={visMottatteOpplysningerData}
        />
      </Nav.Column>
    </Nav.Row>
  </Nav.Container>
);

export default PersonContainer;
