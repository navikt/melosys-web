import React, { useState } from "react";

import * as Nav from "../../../../../../navFrontend";
import * as Mui from "../../../../../ui";

import { useFeatureToggle } from "../../../../../../featuretoggle";
import SivilstandModal from "./sivilstandModal";
import { useHentSivilstandQuery } from "./hentSivilstand.generated";

import "../personinfo.css";

interface SivilstandProps {
  behandlingID: number;
  sivilstandModalAriaHideApp?: boolean;
}

const Sivilstand = ({ behandlingID, sivilstandModalAriaHideApp }: SivilstandProps) => {
  const pdlToggle = useFeatureToggle("melosys.pdl.aktiv");

  const [visSivilstandModal, setVisSivilstandModal] = useState(false);

  const { data: sivilstandData, loading: sivilstandLoading, error: sivilstandError } = useHentSivilstandQuery({
    variables: { behandlingID },
  });

  const sivilstandLoadingContent = (
    <>
      Henter sivilstand...
      <Nav.NavFrontendSpinner />
    </>
  );

  const sivilstandErrorContent = <Nav.AlertStripeFeil>Feil ved henting av sivilstand!</Nav.AlertStripeFeil>;

  const aktiveSivilstander =
    sivilstandData?.hentSaksopplysninger.persondata.sivilstand.filter((sivilstand) => !sivilstand.erHistorisk) || [];
  const historiskeSivilstander =
    sivilstandData?.hentSaksopplysninger.persondata.sivilstand.filter((sivilstand) => sivilstand.erHistorisk) || [];

  return (
    <div className="personinfo__sivilstand">
      <Nav.Typo.EtikettLiten>Sivilstand</Nav.Typo.EtikettLiten>
      {sivilstandLoading && sivilstandLoadingContent}
      {sivilstandError && sivilstandErrorContent}
      {sivilstandData && (
        <Nav.Typo.Element>
          <span className="personinfo__sivilstand">{aktiveSivilstander[0]?.type || "Ingen sivilstand funnet"}</span>
          {pdlToggle === "enabled" && (
            <Mui.Lenkeknapp className="personinfo__vis-detaljer-button" onClick={() => setVisSivilstandModal(true)}>
              Vis detaljer
            </Mui.Lenkeknapp>
          )}
        </Nav.Typo.Element>
      )}
      {visSivilstandModal && (
        <SivilstandModal
          aktiveSivilstander={aktiveSivilstander}
          historiskeSivilstander={historiskeSivilstander}
          onRequestClose={() => setVisSivilstandModal(false)}
          sivilstandModalAriaHideApp={sivilstandModalAriaHideApp}
        />
      )}
    </div>
  );
};

export default Sivilstand;
