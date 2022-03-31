import React, { useState } from "react";

import * as Nav from "../../../../../../navFrontend";
import * as Mui from "../../../../../ui";

import "../personinfo.css";
import { PersonstatusModal } from "./index";
import * as Types from "../../../../../../graphql/generated/types";

interface PersonstatusProps {
  status:
    | Array<
        { __typename?: "Folkeregisterpersonstatus" } & Pick<
          Types.Folkeregisterpersonstatus,
          "kode" | "tekst" | "master" | "kilde" | "fregGyldighetstidspunkt" | "erHistorisk"
        >
      >
    | undefined;
}

const Personstatus = ({ status }: PersonstatusProps) => {
  const [visPersonstatusModal, setVisPersonstatusModal] = useState(false);

  const aktivePersonstatuser = status?.filter((s) => !s.erHistorisk) || [];
  const historiskePersonstatuser = status?.filter((s) => s.erHistorisk) || [];

  return (
    <div className="personinfo__personstatus">
      <PersonstatusModal
        aktivePersonstatuser={aktivePersonstatuser}
        historiskePersonstatuser={historiskePersonstatuser}
        skalViseModal={visPersonstatusModal}
        lukkModal={() => setVisPersonstatusModal(false)}
      />

      <Nav.Typo.EtikettLiten>Personstatus</Nav.Typo.EtikettLiten>
      {status && (
        <Nav.Typo.Element>
          <span className="personinfo__personstatus">
            {aktivePersonstatuser[0]?.tekst || "Ingen personstatus funnet"}
          </span>
          <Mui.Lenkeknapp className="personinfo__vis-detaljer-button" onClick={() => setVisPersonstatusModal(true)}>
            Vis detaljer
          </Mui.Lenkeknapp>
        </Nav.Typo.Element>
      )}
    </div>
  );
};

export default Personstatus;
