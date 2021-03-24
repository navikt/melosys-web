import React from "react";

import * as Nav from "../../../../utils/navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";

import "./editerbareUtenlandsoppdragSporsmal.css";

interface SporsmalOgSvarProps {
  redigerbart: boolean;
  sporsmal: string;
  feltNavn: string;
}

const SporsmalOgSvar = ({ sporsmal, feltNavn, redigerbart }: SporsmalOgSvarProps) => {
  return (
    <Nav.Row className="sporsmal-og-svar">
      <fieldset>
        <Nav.Column xs="8">
          <legend>
            <Nav.typo.Normaltekst>{sporsmal}</Nav.typo.Normaltekst>
          </legend>
        </Nav.Column>
        <Nav.Column xs="4" className="col">
          <Skjema.Radio disabled={!redigerbart} label="Ja" feltNavn={feltNavn} value />
          <Skjema.Radio disabled={!redigerbart} label="Nei" feltNavn={feltNavn} value={false} />
        </Nav.Column>
      </fieldset>
    </Nav.Row>
  );
};

interface EditerbareUtenlandsoppdragetSporsmalProps {
  redigerbart: boolean;
}

const EditerbareUtenlandsoppdragetSporsmal = ({ redigerbart }: EditerbareUtenlandsoppdragetSporsmalProps) => {
  return (
    <div className="editerbare-utenlandsoppdrag-sporsmal">
      <SporsmalOgSvar
        sporsmal="Erstatter arbeidstakeren en eller flere utsendte personer?"
        feltNavn="utenlandsoppdraget.erErstatningTidligereUtsendte"
        redigerbart={redigerbart}
      />
      <SporsmalOgSvar
        sporsmal="Sendes arbeidstakeren ut for å utføre et oppdrag/arbeid som må gjøres i utlandet?"
        feltNavn="utenlandsoppdraget.erUtsendelseForOppdragIUtlandet"
        redigerbart={redigerbart}
      />
      <SporsmalOgSvar
        sporsmal="Er det arbeidstakeren selv som har tatt intiativ til å reise til utlandet?"
        feltNavn="utenlandsoppdraget.erDrattPaaEgetInitiativ"
        redigerbart={redigerbart}
      />
      <SporsmalOgSvar
        sporsmal="Vil arbeidstaker fortsatt være ansatt hos arbeidsgiver i hele utsendingsperioden?"
        feltNavn="utenlandsoppdraget.erFortsattAnsattEtterOppdraget"
        redigerbart={redigerbart}
      />
      <SporsmalOgSvar
        sporsmal="Er arbeidstakeren ansatt med tanke på dette utelandsoppdraget?"
        feltNavn="utenlandsoppdraget.erAnsattForOppdragIUtlandet"
        redigerbart={redigerbart}
      />
    </div>
  );
};

export default EditerbareUtenlandsoppdragetSporsmal;
