import React from "react";
import * as Nav from "../../../navFrontend";
import Handling from "./handling";

type leggBehandlingTilbakeProps = {
  tilForsidenOgVisTilbakemelding: () => void;
  tilbakeleggHandle: (oppgaveID: string, venterPaaDokumentasjon: boolean) => Promise<void>;
  behandlingID: string;
  redigerbart: boolean;
};

const LeggBehandlingTilbake = ({
  tilForsidenOgVisTilbakemelding,
  tilbakeleggHandle,
  behandlingID,
  redigerbart,
}: leggBehandlingTilbakeProps) => {
  const tilbakeleggOppgave = async () => {
    const venterPaaDokumentasjon = true;
    await tilbakeleggHandle(behandlingID, venterPaaDokumentasjon);
    tilForsidenOgVisTilbakemelding();
  };

  return (
    <Nav.Ekspanderbartpanel
      className="behandlingsmeny__meny__legg-behandling-tilbake"
      tittel={<div className="title">Legg behandling tilbake</div>}
    >
      {redigerbart && <Handling tekst="Til min oppgaveliste" onClick={tilForsidenOgVisTilbakemelding} />}
      <Handling tekst="Til felles oppgaveliste" onClick={tilbakeleggOppgave} disabled={!redigerbart} />
    </Nav.Ekspanderbartpanel>
  );
};

export default LeggBehandlingTilbake;
