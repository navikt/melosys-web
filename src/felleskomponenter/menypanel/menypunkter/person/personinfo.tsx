import React, { useState } from "react";

import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../ui";

import { Person } from "../../../../services/api";
import { useFeatureToggle } from "../../../../featuretoggle";
import { PersonstatusModal } from "./personstatusDetaljer";

import EnkeltDato from "../../../datoOmrade/enkeltDato";

import "./personinfo.css";

interface PersonInfoProps {
  behandlingID: number;
  person: Person;
}

const PersonInfo = ({ behandlingID, person: { fnr, foedselsdato, sivilstand, personStatus } }: PersonInfoProps) => {
  const [skalVisePersonstatusModal, setSkalVisePersonstatusModal] = useState(false);

  const pdlToggle = useFeatureToggle("melosys.pdl.aktiv");

  return (
    <div className="personinfo">
      <PersonstatusModal
        behandlingID={behandlingID}
        skalViseModal={skalVisePersonstatusModal}
        lukkModal={() => setSkalVisePersonstatusModal(false)}
      />

      <div className="personinfo__element">
        <Nav.Typo.EtikettLiten>Personstatus</Nav.Typo.EtikettLiten>
        <Nav.Typo.Element>{KV.objektTilTerm(personStatus)}</Nav.Typo.Element>
        {pdlToggle === "enabled" && (
          <Mui.Lenkeknapp onClick={() => setSkalVisePersonstatusModal(true)}>Vis detaljer</Mui.Lenkeknapp>
        )}
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
        <Nav.Typo.EtikettLiten>Sivilstand</Nav.Typo.EtikettLiten>
        <Nav.Typo.Element>{KV.objektTilTerm(sivilstand)}</Nav.Typo.Element>
      </div>
    </div>
  );
};

export default PersonInfo;
