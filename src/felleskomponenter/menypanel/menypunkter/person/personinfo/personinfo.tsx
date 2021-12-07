import React from "react";
import * as Nav from "../../../../../navFrontend";

import { Person } from "../../../../../services/api";

import EnkeltDato from "../../../../datoOmrade/enkeltDato";

import "./personinfo.css";
import Sivilstand from "./sivilstand/sivilstand";
import Personstatus from "./personstatus/personstatus";

interface PersonInfoProps {
  person: Person;
  behandlingID: number;
  modalAriaHideApp?: boolean;
}

const PersonInfo = ({ person: { fnr, foedselsdato }, behandlingID, modalAriaHideApp }: PersonInfoProps) => {
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
        <Personstatus behandlingID={behandlingID} />
      </div>
      <div className="personinfo__element" aria-live="polite" aria-atomic>
        <Sivilstand behandlingID={behandlingID} modalAriaHideApp={modalAriaHideApp} />
      </div>
    </div>
  );
};

export default PersonInfo;
