import React, { ComponentProps } from 'react';

import * as Nav from '../../../../utils/navFrontend';
import * as KV from '../../../../kodeverk';

import Person from './person';

import './personcontainer.css';

type PersonContainerProps = ComponentProps<typeof Person>;

const PersonContainer = ({
  redigerbart,
  visArbeidsforholdRolleEtiketter,
}: PersonContainerProps) => (
  <Nav.Container fluid className="barnetrygd">
    <Nav.Row className="tittel">
      <Nav.Column xs="12">
        <Nav.typo.Innholdstittel>{KV.Menypunkter.Person.tittel}</Nav.typo.Innholdstittel>
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="12">
        <Person
          redigerbart={redigerbart}
          visArbeidsforholdRolleEtiketter={visArbeidsforholdRolleEtiketter}
        />
      </Nav.Column>
    </Nav.Row>
  </Nav.Container>
);

export default PersonContainer;
