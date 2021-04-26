import React from "react";

import * as Nav from "../../../../../utils/navFrontend";

import "./beskrivelse.css";

interface BeskrivelseProps {
  label: string;
  tekst?: string | null;
}

const Beskrivelse = ({ label, tekst }: BeskrivelseProps) => {
  return (
    <Nav.Row>
      <Nav.Column xs="10">
        <div className="ovrig-om-arbeidstaker__beskrivelse">
          <Nav.typo.Element>{label}</Nav.typo.Element>
          <Nav.typo.Normaltekst className="tekst">{tekst || "-"}</Nav.typo.Normaltekst>
        </div>
      </Nav.Column>
    </Nav.Row>
  );
};

export default Beskrivelse;
