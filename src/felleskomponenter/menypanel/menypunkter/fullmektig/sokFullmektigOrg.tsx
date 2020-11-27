import React, { ChangeEventHandler, useState } from 'react';

import * as Utils from '../../../../utils';
import * as Nav from '../../../../utils/navFrontend';
import * as Api from '../../../../services/api';

interface Feilmelding {
  feilmelding: string,
}

interface SokFullmektigOrgProps {
  onOrgFunnet: (orgnr: string) => void,
  defaultOrgnr: string | null,
}

function SokFullmektigOrg(props: SokFullmektigOrgProps) {
  const { onOrgFunnet, defaultOrgnr } = props;

  const [orgnr, setOrgnr] = useState(defaultOrgnr || '');
  const [feilmelding, setFeilmelding] = useState<Feilmelding | undefined>(undefined);
  const [korrekteLengdeOrgnrOppgittMinstEnGang, setKorrekteLengdeOrgnrOppgittMinstEnGang] = useState(false);

  const sok = async (sokOrgnr: string) => {
    if (!Utils.organisasjon.erOrgnrLengde(sokOrgnr)) {
      if (korrekteLengdeOrgnrOppgittMinstEnGang) {
        setFeilmelding({ feilmelding: 'Org.nr. er 9 siffer' });
      }
      return;
    }

    setKorrekteLengdeOrgnrOppgittMinstEnGang(true);

    if (Utils.organisasjon.erOrgnrGyldig(sokOrgnr)) {
      try {
        await Api.Organisasjoner.hentOrganisasjon(sokOrgnr);
        onOrgFunnet(sokOrgnr);
      } catch (e) {
        if (e.response.status === 404) setFeilmelding({ feilmelding: 'Kunne ikke finne organisasjon' });
        else setFeilmelding({ feilmelding: 'Ukjent feil ved søk på org.nr.' });
      }
    } else {
      setFeilmelding({ feilmelding: 'Ugyldig org.nr.' });
    }
  };

  const vedEndretInput: ChangeEventHandler<HTMLInputElement> = event => {
    setOrgnr(event.target.value);
    setFeilmelding(undefined);
    sok(event.target.value);
  };

  return (
    <Nav.Row>
      <Nav.Column xs="9">
        <Nav.Input
          label="Skriv inn organisasjonsnummer"
          placeholder="Skriv inn..."
          onChange={vedEndretInput}
          value={orgnr}
          feil={feilmelding}
        />
      </Nav.Column>
    </Nav.Row>
  );
}

export default SokFullmektigOrg;
