import { useState } from "react";

import * as Nav from "../../../../../../navFrontend";
import * as Mui from "../../../../../ui";
import * as Types from "../../../../../../graphql/generated/types";

import { PersonstatusModal } from "./index";
import "../personinfo.css";

interface PersonstatusProps {
  status:
    | Array<
        { __typename?: "Folkeregisterpersonstatus" } & Pick<
          Types.Folkeregisterpersonstatus,
          "kode" | "tekst" | "master" | "kilde" | "fregGyldighetstidspunkt" | "erHistorisk"
        >
      >
    | undefined;
  erLitenSkjerm: boolean;
}

const Personstatus = ({ status, erLitenSkjerm }: PersonstatusProps) => {
  const [visPersonstatusModal, setVisPersonstatusModal] = useState(false);

  const aktivePersonstatuser = status?.filter((s) => !s.erHistorisk) || [];
  const historiskePersonstatuser = status?.filter((s) => s.erHistorisk) || [];

  const PersonstatusVisning = () => {
    if (!status) {
      return null;
    }

    if (erLitenSkjerm) {
      return (
        <Nav.Column xs="8">
          {aktivePersonstatuser[0]?.tekst || "Ingen personstatus funnet"}
          <Mui.Lenkeknapp className="personinfo__vis-detaljer" onClick={() => setVisPersonstatusModal(true)}>
            Vis detaljer
          </Mui.Lenkeknapp>
        </Nav.Column>
      );
    }

    return (
      <div>
        <Nav.Column xs="5">{aktivePersonstatuser[0]?.tekst || "Ingen personstatus funnet"}</Nav.Column>
        <Nav.Column xs="3">
          <Mui.Lenkeknapp onClick={() => setVisPersonstatusModal(true)}>Vis detaljer</Mui.Lenkeknapp>
        </Nav.Column>
      </div>
    );
  };

  return (
    <div className="personstatus">
      <PersonstatusModal
        aktivePersonstatuser={aktivePersonstatuser}
        historiskePersonstatuser={historiskePersonstatuser}
        skalViseModal={visPersonstatusModal}
        lukkModal={() => setVisPersonstatusModal(false)}
      />

      <Nav.Column xs={erLitenSkjerm ? "4" : "3"}>
        <Nav.Typo.Element>Personstatus:</Nav.Typo.Element>
      </Nav.Column>
      <PersonstatusVisning />
    </div>
  );
};

export default Personstatus;
