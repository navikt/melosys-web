import React from "react";

import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../utils/navFrontend";
import { Person } from "../../../../services/api";

import EnkeltDato from "../../../datoOmrade/enkeltDato";

import "./personinfo.css";

interface PersonInfoProps {
  person: Person;
}

const PersonInfo = ({ person: { fnr, statsborgerskap, foedselsdato, sivilstand, personStatus } }: PersonInfoProps) => (
  <div className="personinfo">
    <div className="personinfo__element">
      <Nav.Typo.EtikettLiten>Statsborgerskap</Nav.Typo.EtikettLiten>
      <Nav.Typo.Element>{KV.objektTilTerm(statsborgerskap)}</Nav.Typo.Element>
    </div>
    <div className="personinfo__element">
      <Nav.Typo.EtikettLiten>Fødselsnummer</Nav.Typo.EtikettLiten>
      <Nav.Typo.Element>{fnr}</Nav.Typo.Element>
    </div>
    <div className="personinfo__element">
      <Nav.Typo.EtikettLiten>Fødselsdato</Nav.Typo.EtikettLiten>
      <Nav.Typo.Element>
        <EnkeltDato dato={foedselsdato} />
      </Nav.Typo.Element>
    </div>
    <div className="personinfo__element">
      <Nav.Typo.EtikettLiten>Personstatus</Nav.Typo.EtikettLiten>
      <Nav.Typo.Element>{KV.objektTilTerm(personStatus)}</Nav.Typo.Element>
    </div>
    <div className="personinfo__element">
      <Nav.Typo.EtikettLiten>Sivilstand</Nav.Typo.EtikettLiten>
      <Nav.Typo.Element>{KV.objektTilTerm(sivilstand)}</Nav.Typo.Element>
    </div>
  </div>
);

export default PersonInfo;
