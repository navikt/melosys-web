import React, { useState } from "react";

import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import { Person } from "../../../../services/api";

import EnkeltDato from "../../../datoOmrade/enkeltDato";
import * as Detaljer from "./detaljerModaler";

import "./personinfo.css";
import * as Mui from "../../../ui";

interface PersonInfoProps {
  person: Person;
}

const PersonInfo = ({ person: { fnr, foedselsdato, sivilstand, personStatus } }: PersonInfoProps) => {
  const [skalVisePersonstatusModal, setSkalVisePersonstatusModal] = useState(true); // TODO endre til false

  return (
    <div className="personinfo">
      <Detaljer.PersonstatusModal
        skalViseModal={skalVisePersonstatusModal}
        lukkModal={() => setSkalVisePersonstatusModal(false)}
      />
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
        <Mui.Lenkeknapp onClick={() => setSkalVisePersonstatusModal(true)}>Vis detaljer</Mui.Lenkeknapp>
      </div>
      <div className="personinfo__element">
        <Nav.Typo.EtikettLiten>Sivilstand</Nav.Typo.EtikettLiten>
        <Nav.Typo.Element>{KV.objektTilTerm(sivilstand)}</Nav.Typo.Element>
      </div>
    </div>
  );
};

export default PersonInfo;
