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
  erLitenSkjerm: boolean;
}

const Sivilstand = ({ sivilstand, modalAriaHideApp, erLitenSkjerm }: SivilstandProps) => {
  const [visSivilstandModal, setVisSivilstandModal] = useState(false);

  const aktiveSivilstander = sivilstand?.filter((s) => !s.erHistorisk) || [];
  const historiskeSivilstander = sivilstand?.filter((s) => s.erHistorisk) || [];

  return (
    <>
      <SivilstandModal
        aktiveSivilstander={aktiveSivilstander}
        historiskeSivilstander={historiskeSivilstander}
        skalViseModal={visSivilstandModal}
        lukkModal={() => setVisSivilstandModal(false)}
        modalAriaHideApp={modalAriaHideApp}
      />

      <Nav.Column xs={erLitenSkjerm ? "4" : "3"}>
        <Nav.Typo.Element>Sivilstand:</Nav.Typo.Element>
      </Nav.Column>
      {sivilstand && (
        <Nav.Column xs={erLitenSkjerm ? "8" : "9"}>
          {aktiveSivilstander[0]?.type || "Ingen sivilstand funnet"}
          <Mui.Lenkeknapp className="personinfo__vis-detaljer" onClick={() => setVisSivilstandModal(true)}>
            Vis detaljer
          </Mui.Lenkeknapp>
        </Nav.Column>
      )}
    </>
  );
};

export default Sivilstand;
