import React from 'react';

import * as Nav from '../../../../utils/navFrontend';
import * as KV from '../../../../kodeverk';
import * as Etiketter from '../../etiketter';

import Medlemskap from './medlemskap';

const MedlemskapContainer = () => (
  <Nav.Container fluid>
    <Nav.Row className="tittel">
      <Nav.Column xs="12">
        <Nav.typo.Innholdstittel style={{ display: 'inline', marginRight: '1em' }}>{KV.Menypunkter.Medlemskap.tittel}</Nav.typo.Innholdstittel>
        <Etiketter.FraRegister />
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
