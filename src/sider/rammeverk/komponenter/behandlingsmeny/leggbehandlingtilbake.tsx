import React from "react";
import * as Nav from "../../../../utils/navFrontend";
import Handling from "./handling";

type leggBehandlingTilbakeProps = {
  lagreOgLukkHandle: () => void;
  tilbakeleggHandle: (oppgaveID: string, venterPaaDokumentasjon: boolean) => void;
  behandlingID: string;
};

const LeggBehandlingTilbake = ({ lagreOgLukkHandle, tilbakeleggHandle, behandlingID }: leggBehandlingTilbakeProps) => {
  const tilbakeleggOppgave = async () => {
    const venterPaaDokumentasjon = true;
    await tilbakeleggHandle(behandlingID, venterPaaDokumentasjon);
    lagreOgLukkHandle();
  };

  return (
    <Nav.EkspanderbartpanelBase
      ariaTittel="leggbehandlingtilbake"
      className="behandlingsmeny__meny__legg-behandling-tilbake"
      heading={<div className="title">Legg behandling tilbake</div>}
    >
      <Handling tekst="Til min oppgaveliste" onClick={lagreOgLukkHandle} />
      <Handling tekst="Til felles oppgaveliste" onClick={tilbakeleggOppgave} />
    </Nav.EkspanderbartpanelBase>
  );
};

export default LeggBehandlingTilbake;
