import { useState } from "react";

import * as Nav from "../../../../../../navFrontend";
import * as Mui from "../../../../../ui";
import * as Types from "../../../../../../graphql/generated/types";

import SivilstandModal from "./sivilstandModal";
import "../personinfo.css";

interface SivilstandProps {
  sivilstand:
    | Array<
        { __typename?: "Sivilstand" } & Pick<
          Types.Sivilstand,
          "type" | "relatertVedSivilstand" | "gyldigFraOgMed" | "bekreftelsesdato" | "master" | "kilde" | "erHistorisk"
        >
      >
    | undefined;
  erLitenSkjerm: boolean;
}

function Sivilstand({ sivilstand, erLitenSkjerm }: SivilstandProps) {
  const [visSivilstandModal, setVisSivilstandModal] = useState(false);

  const aktiveSivilstander = sivilstand?.filter((s) => !s.erHistorisk) || [];
  const historiskeSivilstander = sivilstand?.filter((s) => s.erHistorisk) || [];

  function SivilstatusVisning() {
    if (!sivilstand) {
      return null;
    }

    if (erLitenSkjerm) {
      return (
        <Nav.Column xs="8">
          {aktiveSivilstander[0]?.type || "Ingen sivilstand funnet"}
          <Mui.Lenkeknapp className="personinfo__vis-detaljer" onClick={() => setVisSivilstandModal(true)}>
            Vis detaljer
          </Mui.Lenkeknapp>
        </Nav.Column>
      );
    }

    return (
      <div>
        <Nav.Column xs="5">{aktiveSivilstander[0]?.type || "Ingen sivilstand funnet"}</Nav.Column>
        <Nav.Column xs="3">
          <Mui.Lenkeknapp onClick={() => setVisSivilstandModal(true)}>Vis detaljer</Mui.Lenkeknapp>
        </Nav.Column>
      </div>
    );
  }

  return (
    <div className="sivilstand">
      <SivilstandModal
        aktiveSivilstander={aktiveSivilstander}
        historiskeSivilstander={historiskeSivilstander}
        skalViseModal={visSivilstandModal}
        lukkModal={() => setVisSivilstandModal(false)}
      />

      <Nav.Column xs={erLitenSkjerm ? "4" : "3"}>
        <Nav.BodyLong weight="semibold" size="small">
          Sivilstand:
        </Nav.BodyLong>
      </Nav.Column>
      <SivilstatusVisning />
    </div>
  );
}

export default Sivilstand;
