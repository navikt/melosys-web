import React, { useState } from "react";

import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../ui";

import { Person } from "../../../../../services/api";

import EnkeltDato from "../../../../datoOmrade/enkeltDato";
import SivilstandModal from "./sivilstandModal";

import "./personinfo.css";

interface PersonInfoProps {
  person: Person;
  behandlingID: number;
}

const PersonInfo = ({ person: { fnr, foedselsdato, sivilstand, personStatus }, behandlingID }: PersonInfoProps) => {
  const [visSivilstandModal, setVisSivilstandModal] = useState(false);

  return (
    <div className="personinfo">
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
        <Nav.Typo.Element>
          {KV.objektTilTerm(sivilstand)}
          <Mui.Lenkeknapp onClick={() => setVisSivilstandModal(true)} className="personinfo__vis-detaljer-button">
            Vis detaljer
          </Mui.Lenkeknapp>
        </Nav.Typo.Element>
      </div>
      {visSivilstandModal && (
        <SivilstandModal behandlingID={behandlingID} onRequestClose={() => setVisSivilstandModal(false)} />
      )}
    </div>
  );
};

export default PersonInfo;
