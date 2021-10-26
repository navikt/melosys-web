import React from "react";
import * as Nav from "../../../../../../utils/navFrontend";
import * as Utils from "../../../../../../utils";

interface SpesiellGruppeHjelpetekstProps {
  erVirksomhetNorsk: boolean;
}

const SpesiellGruppeHjelpetekst = ({ erVirksomhetNorsk }: SpesiellGruppeHjelpetekstProps) => {
  const hovedtekst =
    "Du skal velge ja dersom søker tilhører en spesiell gruppe og det har betydning for trygdeavgiften. Dette gjelder følgende grupper:";
  const grupper = [
    erVirksomhetNorsk
      ? "Misjonærer som skal arbeide i utlandet i minst to år"
      : "Ansatte i FN som betaler staff assessment",
    "Arbeidstakere i Malaysia",
  ];
  const tittel = `${hovedtekst} ${Utils.streng.arrayTilKonjunksjon(grupper)}.`;

  return (
    <Nav.Hjelpetekst tittel={tittel} className="hjelpetekst" type={Nav.PopoverOrientering.Under}>
      {hovedtekst}
      <ul>
        {grupper.map((gruppe) => (
          <li key={gruppe}>{gruppe}</li>
        ))}
      </ul>
    </Nav.Hjelpetekst>
  );
};

export default SpesiellGruppeHjelpetekst;
