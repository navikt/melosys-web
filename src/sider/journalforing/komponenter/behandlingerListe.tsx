import { useState } from "react";
import * as Nav from "../../../navFrontend";
import * as Ikon from "../../../resources/images";
import { BehandlingsstatusMedSvarfrist } from "../../../felleskomponenter/behandlingsstatus";
import { KTObject } from "@navikt/melosys-kodeverk";
import "./behandlingerListe.less";
import { HStack, VStack } from "@navikt/ds-react";

interface BehandlingOversikt {
  behandlingID: string;
  behandlingsstatus: KTObject;
  svarFrist: string | null;
  behandlingstype: KTObject;
}

interface BehandlingerListeProps {
  behandlingOversikter: BehandlingOversikt[];
}

interface BehandlingRadProps {
  behandling: BehandlingOversikt;
}

function BehandlingRad({ behandling }: BehandlingRadProps) {
  return (
    <HStack justify="space-between" paddingInline="3 3" paddingBlock="1 1">
      <div className="behandling-tittel">{behandling.behandlingstype.term}</div>
      <BehandlingsstatusMedSvarfrist
        behandlingsstatus={behandling.behandlingsstatus}
        svarFrist={behandling.svarFrist || null}
      />
    </HStack>
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
        type="button"
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
    <VStack>
      <div className="behandlinger-liste">
        {behandlingerToShow.map((behandling) => (
          <BehandlingRad key={behandling.behandlingID} behandling={behandling} />
        ))}
        <ToggleButton
          onClick={() => setShowAllBehandlinger(!showAllBehandlinger)}
          showAll={showAllBehandlinger}
          disabled={!showAllBehandlinger && !harFlereBehandlinger}
        />
      </div>
    </VStack>
  );
}

export default BehandlingerListe;
