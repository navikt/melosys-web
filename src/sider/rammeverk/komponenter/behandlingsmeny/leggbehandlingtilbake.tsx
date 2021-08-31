import React from "react";
import * as Nav from "../../../../utils/navFrontend";
import Handling from "./handling";

const LeggBehandlingTilbake = () => {
  const tilMinOppgaveListe = () => {
    console.log("min");
  };
  const tilFellesOppgaveListe = () => {
    console.log("felles");
  };

  return (
    <Nav.EkspanderbartpanelBase
      ariaTittel="leggbehandlingtilbake"
      className="behandlingsmeny__meny__legg-behandling-tilbake"
      heading={<div className="title">Legg behandling tilbake</div>}
    >
      <Handling tekst="Til min oppgaveliste" onClick={tilMinOppgaveListe} />
      <Handling tekst="Til felles oppgaveliste" onClick={tilFellesOppgaveListe} />
    </Nav.EkspanderbartpanelBase>
  );
};

export default LeggBehandlingTilbake;
