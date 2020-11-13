import React, { ChangeEventHandler, useState } from 'react';

import * as Nav from '../../../../utils/navFrontend';
import * as Api from '../../../../services/api';

import { erOrgnrGyldig } from '../../../skjema/validering/generisk/organisasjon';

import './sokFullmektigOrg.css';

interface Feilmelding {
  feilmelding: string,
}

interface SokFullmektigOrgProps {
  onOrgFunnet: (orgnr: string) => void,
}

function SokFullmektigOrg(props: SokFullmektigOrgProps) {
  const { onOrgFunnet } = props;

  const [orgnr, settOrgnr] = useState('');
  const [feilmelding, settFeilmelding] = useState<Feilmelding | undefined>(undefined);

  const sok = async () => {
    if (erOrgnrGyldig(orgnr)) {
      try {
        await Api.Organisasjoner.hentOrganisasjon(orgnr);
        onOrgFunnet(orgnr);
      } catch (e) {
        if (e.response.status === 404) settFeilmelding({ feilmelding: 'Kunne ikke finne organisasjon' });
        else settFeilmelding({ feilmelding: 'Ukjent feil ved søk på org.nr.' });
      }
    } else {
      settFeilmelding({ feilmelding: 'Ugyldig org.nr.' });
    }
  };

  const vedEndretInput: ChangeEventHandler<HTMLInputElement> = event => {
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

export default SokFullmektigOrg;
