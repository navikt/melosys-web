import React from 'react';

import * as Nav from '../../../../utils/navFrontend';
import * as KV from '../../../../kodeverk';
import * as Etiketter from '../etiketter';

import Familieforhold from './familieforhold';

const FamilieforholdContainer = () => (
  <Nav.Container fluid>
    <Nav.Row className="tittel">
      <Nav.Column xs="12">
        <Nav.typo.Undertittel style={{ display: 'inline', marginRight: '1em' }}>{KV.Menypunkter.Familieforhold.tittel}</Nav.typo.Undertittel>
        <Etiketter.FraRegister />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="12">
        <Familieforhold />
      </Nav.Column>
    </Nav.Row>
  </Nav.Container>
);

export default FamilieforholdContainer;
