import React from 'react';

import * as Nav from '../../../../utils/navFrontend';
import * as KV from '../../../../kodeverk';

import Familieforhold from './familieforhold';

const FamilieforholdContainer = () => (
  <Nav.Container fluid>
    <Nav.Row>
      <Nav.Column xs="12">
        <Nav.typo.Innholdstittel style={{ display: 'inline', marginRight: '1em' }}>{KV.Menypunkter.Familieforhold.tittel}</Nav.typo.Innholdstittel>
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
