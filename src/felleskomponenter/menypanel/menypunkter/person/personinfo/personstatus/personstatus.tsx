import { useState } from "react";

import * as Nav from "../../../../../../navFrontend";
import * as Mui from "../../../../../ui";
import * as Types from "../../../../../../graphql/generated/types";

import { PersonstatusModal } from "./index";
import "../personinfo.less";

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

function Personstatus({ status, erLitenSkjerm }: PersonstatusProps) {
  const [visPersonstatusModal, setVisPersonstatusModal] = useState(false);

  const aktivePersonstatuser = status?.filter((s) => !s.erHistorisk) || [];
  const historiskePersonstatuser = status?.filter((s) => s.erHistorisk) || [];

  function PersonstatusVisning() {
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
  }

  return (
    <div className="personstatus">
      <PersonstatusModal
        aktivePersonstatuser={aktivePersonstatuser}
        historiskePersonstatuser={historiskePersonstatuser}
        skalViseModal={visPersonstatusModal}
        lukkModal={() => setVisPersonstatusModal(false)}
      />

      <Nav.Column xs={erLitenSkjerm ? "4" : "3"}>
        <Nav.BodyLong weight="semibold" size="small">
          Personstatus:
        </Nav.BodyLong>
      </Nav.Column>
      <PersonstatusVisning />
    </div>
  );
}

export default Personstatus;
