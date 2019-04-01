import React, { useState } from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import { erOrgnrGyldig } from '../skjema/validering/generisk/organisasjon';


import './fullmektig.css';

function SokFullmektigOrg(props) {
  const { lagreNyFullmektigOgOppdaterLokalt } = props;
  const [orgnr, settOrgnr] = useState('');
  const [feilmelding, settFeilmelding] = useState(undefined);

  const sok = () => {
    if (erOrgnrGyldig(orgnr)) {
      lagreNyFullmektigOgOppdaterLokalt(orgnr);
    } else {
      settFeilmelding({ feilmelding: 'Ugyldig orgnr' });
    }
  };

  const vedEndretInput = event => {
    settOrgnr(event.target.value);
    settFeilmelding(undefined);
  };

  return (
    <Nav.Row>
      <Nav.Column xs="9">
        <Nav.Input
          label="Organisasjonsnummer"
          placeholder="Skriv inn..."
          onChange={vedEndretInput}
          value={orgnr}
          feil={feilmelding}
        />
      </Nav.Column>
      <Nav.Column xs="3">
        <Nav.Knapp onClick={sok} type="mini" className="sokKnapp">SØK</Nav.Knapp>
      </Nav.Column>
    </Nav.Row>
  );
}

SokFullmektigOrg.propTypes = {
  lagreNyFullmektigOgOppdaterLokalt: PT.func.isRequired,
};

export default SokFullmektigOrg;
