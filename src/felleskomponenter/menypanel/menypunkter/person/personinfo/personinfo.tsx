import React from "react";
import * as Nav from "../../../../../navFrontend";

import { Person } from "../../../../../services/api";

import EnkeltDato from "../../../../datoOmrade/enkeltDato";

import "./personinfo.css";
import Sivilstand from "./sivilstand/sivilstand";
import Personstatus from "./personstatus/personstatus";
import useHentPersonopplysninger from "../../../../personlinje/useHentpersonopplysninger";

interface PersonInfoProps {
  person: Person;
  behandlingID: number;
  sivilstandModalAriaHideApp?: boolean;
}

const PersonInfo = ({ person: { fnr, foedselsdato }, behandlingID, sivilstandModalAriaHideApp }: PersonInfoProps) => {
  const personopplysninger = useHentPersonopplysninger(behandlingID, false);

  return (
    <div className="personinfo">
      <div className="personinfo__element">
        <Personstatus behandlingID={behandlingID} />
      </div>
      <div className="personinfo__element">
        <Nav.Typo.EtikettLiten>Fødselsnummer</Nav.Typo.EtikettLiten>
        <Nav.Typo.Element>{fnr || personopplysninger?.fnr}</Nav.Typo.Element>
      </div>
      <div className="personinfo__element">
        <Nav.Typo.EtikettLiten>Fødselsdato</Nav.Typo.EtikettLiten>
        <Nav.Typo.Element>
          <EnkeltDato dato={foedselsdato} />
        </Nav.Typo.Element>
      </div>
      <div className="personinfo__element" aria-live="polite" aria-atomic>
        <Sivilstand behandlingID={behandlingID} modalAriaHideApp={sivilstandModalAriaHideApp} />
      </div>
    </div>
  );
};

export default PersonInfo;
