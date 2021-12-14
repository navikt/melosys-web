import React from "react";
import * as Nav from "../../../navFrontend";

interface FeltBeskrivelseProps {
  beskrivelse: string;
  hjelpetekst: string | null;
}
const FeltBeskrivelse = ({ beskrivelse, hjelpetekst }: FeltBeskrivelseProps) => {
  return (
    <Nav.Typo.Element className="fritekst_label" tag={hjelpetekst ? "div" : "p"}>
      {beskrivelse}
      {hjelpetekst && (
        <Nav.Hjelpetekst className="hjelpetekst" tittel={hjelpetekst} type={Nav.PopoverOrientering.Venstre}>
          {hjelpetekst}
        </Nav.Hjelpetekst>
      )}
    </Nav.Typo.Element>
  );
};

export default FeltBeskrivelse;
