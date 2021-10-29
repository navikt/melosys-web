import React from "react";
import * as Nav from "../../../../navFrontend";
import Handling from "./handling";

type leggBehandlingTilbakeProps = {
  lagreOgLukkHandle: () => void;
  tilbakeleggHandle: (oppgaveID: string, venterPaaDokumentasjon: boolean) => void;
  behandlingID: string;
  redigerbart: boolean;
};

const LeggBehandlingTilbake = ({
  lagreOgLukkHandle,
  tilbakeleggHandle,
  behandlingID,
  redigerbart,
}: leggBehandlingTilbakeProps) => {
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
      {redigerbart && <Handling tekst="Til min oppgaveliste" onClick={lagreOgLukkHandle} />}
      <Handling tekst="Til felles oppgaveliste" onClick={tilbakeleggOppgave} disabled={!redigerbart} />
    </Nav.EkspanderbartpanelBase>
  );
};

export default LeggBehandlingTilbake;
