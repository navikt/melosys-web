import React from "react";

import * as Nav from "../../../../../utils/navFrontend";
import * as Skjema from "../../../../skjema";
import * as Sporsmal from "./sporsmal";

import "./editerbareUtenlandsoppdragetSporsmal.css";

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
        sporsmal={Sporsmal.erErstatningTidligereUtsendte}
        feltNavn="utenlandsoppdraget.erErstatningTidligereUtsendte"
        redigerbart={redigerbart}
      />
      <SporsmalOgSvar
        sporsmal={Sporsmal.erUtsendelseForOppdragIUtlandet}
        feltNavn="utenlandsoppdraget.erUtsendelseForOppdragIUtlandet"
        redigerbart={redigerbart}
      />
      <SporsmalOgSvar
        sporsmal={Sporsmal.erDrattPaaEgetInitiativ}
        feltNavn="utenlandsoppdraget.erDrattPaaEgetInitiativ"
        redigerbart={redigerbart}
      />
      <SporsmalOgSvar
        sporsmal={Sporsmal.erFortsattAnsattEtterOppdraget}
        feltNavn="utenlandsoppdraget.erFortsattAnsattEtterOppdraget"
        redigerbart={redigerbart}
      />
      <SporsmalOgSvar
        sporsmal={Sporsmal.erAnsattForOppdragIUtlandet}
        feltNavn="utenlandsoppdraget.erAnsattForOppdragIUtlandet"
        redigerbart={redigerbart}
      />
    </div>
  );
};

export default EditerbareUtenlandsoppdragetSporsmal;
