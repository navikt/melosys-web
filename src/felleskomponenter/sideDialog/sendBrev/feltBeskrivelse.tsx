import React from "react";
import * as Nav from "../../../navFrontend";

interface FeltBeskrivelseProps {
  beskrivelse: string;
  hjelpetekst: string | null;
}
const FeltBeskrivelse = (felt: FeltBeskrivelseProps) => {
  return (
    <Nav.Typo.Element className="fritekst_label" tag="div">
      {felt.beskrivelse}
      {felt.hjelpetekst && (
        <Nav.Hjelpetekst className="hjelpetekst" tittel={felt.hjelpetekst} type={Nav.PopoverOrientering.Venstre}>
          {felt.hjelpetekst}
        </Nav.Hjelpetekst>
      )}
    </Nav.Typo.Element>
  );
};

export default FeltBeskrivelse;
