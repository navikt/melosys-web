import React, { useState } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';

import { erOrgnrGyldig } from '../../../skjema/validering/generisk/organisasjon';

import './sokFullmektigOrg.css';

function SokFullmektigOrg(props) {
  const { lagreNyFullmektigOgOppdaterLokalt, hentOrg } = props;
  const [orgnr, settOrgnr] = useState('');
  const [feilmelding, settFeilmelding] = useState(undefined);

  const sok = async () => {
    if (erOrgnrGyldig(orgnr)) {
      try {
        await hentOrg(orgnr);
        lagreNyFullmektigOgOppdaterLokalt(orgnr);
      } catch (e) {
        if (e.response.status === 404) settFeilmelding({ feilmelding: 'Kunne ikke finne organisasjon' });
        else settFeilmelding({ feilmelding: 'Ukjent feil ved søk på org.nr.' });
      }
    } else {
      settFeilmelding({ feilmelding: 'Ugyldig org.nr.' });
    }
  };

  const vedEndretInput = event => {
    settOrgnr(event.target.value);
    settFeilmelding(undefined);
  };

  return (
    <Nav.Row className="sokFullmektigOrg">
      <Nav.Column xs="9">
        <Nav.Input
          label="Skriv inn organisasjonsnummer"
          placeholder="Skriv inn..."
          onChange={vedEndretInput}
          value={orgnr}
          feil={feilmelding}
        />
      </Nav.Column>
      <Nav.Column xs="3">
        <Nav.Knapp onClick={sok} type="standard" className="sokKnapp">SØK</Nav.Knapp>
      </Nav.Column>
    </Nav.Row>
  );
}

SokFullmektigOrg.propTypes = {
  lagreNyFullmektigOgOppdaterLokalt: PT.func.isRequired,
  hentOrg: PT.func.isRequired,
};

export default SokFullmektigOrg;
