import { useState } from "react";
import { BehandlingsstatusMedSvarfrist } from "../behandlingsstatus";
import { KTObject } from "@navikt/melosys-kodeverk";
import "./behandlingerListe.less";
import { HStack, VStack } from "@navikt/ds-react";
import ChevronKnapp from "../chevronKnapp/chevronKnapp";

interface BehandlingForFagsak {
  behandlingID: number;
  behandlingsstatus: KTObject;
  svarFrist: string | null;
  behandlingstype: KTObject;
  tittel: string;
}

interface BehandlingerListeProps {
  behandlingerForFagsak: BehandlingForFagsak[];
}

function BehandlingerListe({ behandlingerForFagsak }: BehandlingerListeProps) {
  const [showAllBehandlinger, setShowAllBehandlinger] = useState<boolean>(false);

  const pågåendeBehandlinger = behandlingerForFagsak.filter(
    (behandling) => behandling.behandlingsstatus?.kode !== "AVSLUTTET",
  );

  const alleBehandlingerErAvsluttet = pågåendeBehandlinger.length === 0;
  const initialBehandlinger = alleBehandlingerErAvsluttet ? [behandlingerForFagsak[0]] : pågåendeBehandlinger;

  const behandlingerToShow = showAllBehandlinger ? behandlingerForFagsak : initialBehandlinger;

  return (
    <VStack>
      <div className="behandlinger-liste">
        {behandlingerToShow.map((behandling) => (
          <HStack key={behandling.behandlingID} justify="space-between" paddingInline="3 3" paddingBlock="2 1">
            <div className="behandling-tittel">{behandling.tittel}</div>
            <BehandlingsstatusMedSvarfrist
              behandlingsstatus={behandling.behandlingsstatus}
              svarFrist={behandling.svarFrist || null}
            />
          </HStack>
        ))}

        <div className="toggle-button-container">
          <ChevronKnapp
            expanded={showAllBehandlinger}
            onChange={() => setShowAllBehandlinger(!showAllBehandlinger)}
            label={showAllBehandlinger ? "Skjul avsluttede behandlinger" : "Vis avsluttede behandlinger"}
          />
        </div>
      </div>
    </VStack>
  );
}

export default BehandlingerListe;
