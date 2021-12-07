import React, { useState } from "react";

import * as Nav from "../../../../../../navFrontend";
import * as Mui from "../../../../../ui";

import { useFeatureToggle } from "../../../../../../featuretoggle";

import "../personinfo.css";
import { useHentPersonstatusQuery } from "./hentPersonstatus.generated";
import { PersonstatusModal } from "./index";

interface PersonstatusProps {
  behandlingID: number;
}

const Personstatus = ({ behandlingID }: PersonstatusProps) => {
  const pdlToggle = useFeatureToggle("melosys.pdl.aktiv");

  const [visPersonstatusModal, setVisPersonstatusModal] = useState(false);

  const { data: personstatusData, loading: personstatusLoading, error: personstatusError } = useHentPersonstatusQuery({
    variables: { behandlingID },
  });

  const personstatusLoadingContent = (
    <>
      Henter personstatus...
      <Nav.NavFrontendSpinner />
    </>
  );

  const personstatusErrorContent = <Nav.AlertStripeFeil>Feil ved henting av personstatus!</Nav.AlertStripeFeil>;

  const aktivePersonstatuser =
    personstatusData?.hentSaksopplysninger.persondata.folkeregisterpersonstatuser.filter(
      (status) => !status.erHistorisk
    ) || [];
  const historiskePersonstatuser =
    personstatusData?.hentSaksopplysninger.persondata.folkeregisterpersonstatuser.filter(
      (status) => status.erHistorisk
    ) || [];

  return (
    <div className="personinfo__personstatus">
      <PersonstatusModal
        aktivePersonstatuser={aktivePersonstatuser}
        historiskePersonstatuser={historiskePersonstatuser}
        skalViseModal={visPersonstatusModal}
        lukkModal={() => setVisPersonstatusModal(false)}
      />

      <Nav.Typo.EtikettLiten>Personstatus</Nav.Typo.EtikettLiten>
      {personstatusLoading && personstatusLoadingContent}
      {personstatusError && personstatusErrorContent}
      {personstatusData && (
        <Nav.Typo.Element>
          <span className="personinfo__personstatus">
            {aktivePersonstatuser[0]?.tekst || "Ingen personstatus funnet"}
          </span>
          {pdlToggle === "enabled" && (
            <Mui.Lenkeknapp className="personinfo__vis-detaljer-button" onClick={() => setVisPersonstatusModal(true)}>
              Vis detaljer
            </Mui.Lenkeknapp>
          )}
        </Nav.Typo.Element>
      )}
    </div>
  );
};

export default Personstatus;
