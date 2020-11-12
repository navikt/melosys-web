import React from 'react';
import { Person } from 'Domene';

import * as KV from '../../../../kodeverk';
import * as Nav from '../../../../utils/navFrontend';

import EnkeltDato from '../../../datoOmrade/enkeltDato';

import './personinfo.css';

interface PersonInfoProps {
  person: Person,
}

const PersonInfo = ({
  person: {
    fnr,
    statsborgerskap,
    foedselsdato,
    sivilstand,
    personStatus,
  },
}: PersonInfoProps) => (
  <div className="personinfo">
    <Nav.Row>
      <Nav.Column xs="3">
        <Nav.typo.EtikettLiten>Statsborgerskap</Nav.typo.EtikettLiten>
        <Nav.typo.Element>{KV.objektTilTerm(statsborgerskap)}</Nav.typo.Element>
      </Nav.Column>
      <Nav.Column xs="3">
        <Nav.typo.EtikettLiten>Fødselsnummer</Nav.typo.EtikettLiten>
        <Nav.typo.Element>{fnr}</Nav.typo.Element>
      </Nav.Column>
      <Nav.Column xs="3">
        <Nav.typo.EtikettLiten>Fødselsdato</Nav.typo.EtikettLiten>
        <EnkeltDato dato={foedselsdato} />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="3">
        <Nav.typo.EtikettLiten>Personstatus</Nav.typo.EtikettLiten>
        <Nav.typo.Element>{KV.objektTilTerm(personStatus)}</Nav.typo.Element>
      </Nav.Column>
      <Nav.Column xs="3">
        <Nav.typo.EtikettLiten>Sivilstand</Nav.typo.EtikettLiten>
        <Nav.typo.Element>{KV.objektTilTerm(sivilstand)}</Nav.typo.Element>
      </Nav.Column>
    </Nav.Row>
  </div>
);

export default PersonInfo;
