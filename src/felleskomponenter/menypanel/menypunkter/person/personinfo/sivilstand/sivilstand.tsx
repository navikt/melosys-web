import React, { useState } from "react";

import * as Nav from "../../../../../../navFrontend";
import * as Mui from "../../../../../ui";
import SivilstandModal from "./sivilstandModal";

import "../personinfo.css";
import * as Types from "../../../../../../graphql/generated/types";

interface SivilstandProps {
  sivilstand:
    | Array<
        { __typename?: "Sivilstand" } & Pick<
          Types.Sivilstand,
          "type" | "relatertVedSivilstand" | "gyldigFraOgMed" | "bekreftelsesdato" | "master" | "kilde" | "erHistorisk"
        >
      >
    | undefined;
  modalAriaHideApp?: boolean;
}

const Sivilstand = ({ sivilstand, modalAriaHideApp }: SivilstandProps) => {
  const [visSivilstandModal, setVisSivilstandModal] = useState(false);

  const aktiveSivilstander = sivilstand?.filter((s) => !s.erHistorisk) || [];
  const historiskeSivilstander = sivilstand?.filter((s) => s.erHistorisk) || [];

  return (
    <div className="personinfo__sivilstand">
      <SivilstandModal
        aktiveSivilstander={aktiveSivilstander}
        historiskeSivilstander={historiskeSivilstander}
        skalViseModal={visSivilstandModal}
        lukkModal={() => setVisSivilstandModal(false)}
        modalAriaHideApp={modalAriaHideApp}
      />

      <Nav.Typo.EtikettLiten>Sivilstand</Nav.Typo.EtikettLiten>
      {sivilstand && (
        <Nav.Typo.Element>
          <span className="personinfo__sivilstand">{aktiveSivilstander[0]?.type || "Ingen sivilstand funnet"}</span>
          <Mui.Lenkeknapp className="sivilstand__vis-detaljer-button" onClick={() => setVisSivilstandModal(true)}>
            Vis detaljer
          </Mui.Lenkeknapp>
        </Nav.Typo.Element>
      )}
    </div>
  );
};

export default Sivilstand;
