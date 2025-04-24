import { useState } from "react";
import * as Nav from "../../../navFrontend";
import * as Ikon from "../../../resources/images";
import { BehandlingsstatusMedSvarfrist } from "../../../felleskomponenter/behandlingsstatus";
import { KTObject } from "@navikt/melosys-kodeverk";

interface BehandlingOversikt {
  behandlingID: string;
  tittel: string;
  behandlingsstatus: KTObject;
  svarFrist: string | null;
}

interface BehandlingerListeProps {
  behandlingOversikter: BehandlingOversikt[];
}

function BehandlingerListe({ behandlingOversikter }: BehandlingerListeProps) {
  const [showAllBehandlinger, setShowAllBehandlinger] = useState<boolean>(false);

  const pågåendeBehandlinger = behandlingOversikter.filter(
    (behandling) => behandling.behandlingsstatus?.kode !== "AVSLUTTET",
  );

  const alleBehandlingerErAvsluttet = pågåendeBehandlinger.length === 0;

  const initialBehandlinger = alleBehandlingerErAvsluttet
    ? [behandlingOversikter[behandlingOversikter.length - 1]] // Last one if all are AVSLUTTET
    : pågåendeBehandlinger;

  const hasMoreBehandlinger = behandlingOversikter.length > initialBehandlinger.length;

  return (
    <div className="behandlingsstatusSvarfrist-wrapper">
      {!showAllBehandlinger && (
        <div className="behandlinger-liste">
          {initialBehandlinger.map((behandling) => (
            <Nav.Row key={behandling.behandlingID} className="behandling-rad">
              <Nav.Column className="behandling-tittel">{behandling.tittel}</Nav.Column>
              <Nav.Column>
                <BehandlingsstatusMedSvarfrist
                  behandlingsstatus={behandling.behandlingsstatus}
                  svarFrist={behandling.svarFrist || null}
                />
              </Nav.Column>
            </Nav.Row>
          ))}
          {hasMoreBehandlinger && (
            <Nav.Button onClick={() => setShowAllBehandlinger(true)} variant="tertiary" icon={<Ikon.ChevronDown />}>
              Vis mer
            </Nav.Button>
          )}
        </div>
      )}

      {showAllBehandlinger && (
        <div className="behandlinger-liste">
          {behandlingOversikter.map((behandling) => (
            <Nav.Row key={behandling.behandlingID} className="behandling-rad">
              <Nav.Column className="behandling-tittel">{behandling.tittel}</Nav.Column>
              <Nav.Column>
                <BehandlingsstatusMedSvarfrist
                  behandlingsstatus={behandling.behandlingsstatus}
                  svarFrist={behandling.svarFrist || null}
                />
              </Nav.Column>
            </Nav.Row>
          ))}
          <Nav.Button onClick={() => setShowAllBehandlinger(false)} variant="tertiary" icon={<Ikon.ChevronUp />}>
            Vis mindre
          </Nav.Button>
        </div>
      )}
    </div>
  );
}

export default BehandlingerListe;
