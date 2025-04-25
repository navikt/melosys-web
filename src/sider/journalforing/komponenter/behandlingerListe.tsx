import { useState } from "react";
import * as Nav from "../../../navFrontend";
import * as Ikon from "../../../resources/images";
import { BehandlingsstatusMedSvarfrist } from "../../../felleskomponenter/behandlingsstatus";
import { KTObject } from "@navikt/melosys-kodeverk";
import "./behandlingerListe.less";

interface BehandlingOversikt {
  behandlingID: string;
  tittel: string;
  behandlingsstatus: KTObject;
  svarFrist: string | null;
}

interface BehandlingerListeProps {
  behandlingOversikter: BehandlingOversikt[];
}

interface BehandlingRadProps {
  behandling: BehandlingOversikt;
}

function BehandlingRad({ behandling }: BehandlingRadProps) {
  return (
    <Nav.Row key={behandling.behandlingID} className="behandling-rad">
      <Nav.Column lg="6" className="behandling-tittel">
        {behandling.tittel}
      </Nav.Column>
      <Nav.Column lg="6">
        <BehandlingsstatusMedSvarfrist
          behandlingsstatus={behandling.behandlingsstatus}
          svarFrist={behandling.svarFrist || null}
        />
      </Nav.Column>
    </Nav.Row>
  );
}

interface ToggleButtonProps {
  onClick: () => void;
  showAll: boolean;
  disabled?: boolean;
}

function ToggleButton({ onClick, showAll, disabled }: ToggleButtonProps) {
  return (
    <div className="toggle-button-container">
      <Nav.Button
        onClick={onClick}
        variant="tertiary"
        icon={showAll ? <Ikon.ChevronUp /> : <Ikon.ChevronDown />}
        disabled={disabled}
      >
        {showAll ? "Skjul avsluttede behandlinger" : "Vis avsluttede behandlinger"}
      </Nav.Button>
    </div>
  );
}

function BehandlingerListe({ behandlingOversikter }: BehandlingerListeProps) {
  const [showAllBehandlinger, setShowAllBehandlinger] = useState<boolean>(false);

  const pågåendeBehandlinger = behandlingOversikter.filter(
    (behandling) => behandling.behandlingsstatus?.kode !== "AVSLUTTET",
  );

  const alleBehandlingerErAvsluttet = pågåendeBehandlinger.length === 0;
  const initialBehandlinger = alleBehandlingerErAvsluttet
    ? [behandlingOversikter[behandlingOversikter.length - 1]]
    : pågåendeBehandlinger;
  const harFlereBehandlinger = behandlingOversikter.length > initialBehandlinger.length;

  const behandlingerToShow = showAllBehandlinger ? behandlingOversikter : initialBehandlinger;

  return (
    <Nav.Column>
      <Nav.Row className="behandlinger-liste">
        {behandlingerToShow.map((behandling) => (
          <BehandlingRad key={behandling.behandlingID} behandling={behandling} />
        ))}
        <ToggleButton
          onClick={() => setShowAllBehandlinger(!showAllBehandlinger)}
          showAll={showAllBehandlinger}
          disabled={!showAllBehandlinger && !harFlereBehandlinger}
        />
      </Nav.Row>
    </Nav.Column>
  );
}

export default BehandlingerListe;
