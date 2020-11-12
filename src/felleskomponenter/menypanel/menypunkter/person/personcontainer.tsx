import React from 'react';

import * as Nav from '../../../../utils/navFrontend';
import * as KV from '../../../../kodeverk';

import Person from './person';

import './personcontainer.css';

const PersonContainer = () => (
  <Nav.Container fluid className="barnetrygd">
    <Nav.Row className="tittel">
      <Nav.Column xs="12">
        <Nav.typo.Undertittel>{KV.Menypunkter.Person.tittel}</Nav.typo.Undertittel>
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="12">
        <Person />
      </Nav.Column>
    </Nav.Row>
  </Nav.Container>
);

export default PersonContainer;
