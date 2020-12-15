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
    <div className="personinfo__element">
      <Nav.typo.EtikettLiten>Statsborgerskap</Nav.typo.EtikettLiten>
      <Nav.typo.Element>{KV.objektTilTerm(statsborgerskap)}</Nav.typo.Element>
    </div>
    <div className="personinfo__element">
      <Nav.typo.EtikettLiten>Fødselsnummer</Nav.typo.EtikettLiten>
      <Nav.typo.Element>{fnr}</Nav.typo.Element>
    </div>
    <div className="personinfo__element">
      <Nav.typo.EtikettLiten>Fødselsdato</Nav.typo.EtikettLiten>
      <Nav.typo.Element>
        <EnkeltDato dato={foedselsdato} />
      </Nav.typo.Element>
    </div>
    <div className="personinfo__element">
      <Nav.typo.EtikettLiten>Personstatus</Nav.typo.EtikettLiten>
      <Nav.typo.Element>{KV.objektTilTerm(personStatus)}</Nav.typo.Element>
    </div>
    <div className="personinfo__element">
      <Nav.typo.EtikettLiten>Sivilstand</Nav.typo.EtikettLiten>
      <Nav.typo.Element>{KV.objektTilTerm(sivilstand)}</Nav.typo.Element>
    </div>
  </div>
);

export default PersonInfo;
