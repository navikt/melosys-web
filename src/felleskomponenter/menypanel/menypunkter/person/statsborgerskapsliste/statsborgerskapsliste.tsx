import React from "react";

import * as Nav from "../../../../../utils/navFrontend";
import * as Utils from "../../../../../utils";

import { useHentStatsborgerskapQuery } from "./hentStatsborgerskap.generated";

import ExpandableList from "../../../../expandablelist";
import GyldigeStatsborgerskapHeader from "./gyldigeStatsborgerskapHeader";
import HistoriskeStatsborgerskapHeader from "./historiskeStatsborgerskapHeader";
import Rad from "./rad";

import "./statsborgerskapsliste.css";

interface StatsborgerkapslisteProps {
  behandlingID: number;
}

const Statsborgerkapsliste = ({ behandlingID }: StatsborgerkapslisteProps) => {
  const { loading, error, data } = useHentStatsborgerskapQuery({ variables: { behandlingID } });

  if (error) return <Nav.AlertStripe type="feil">Kunne ikke hente statsborgerskap!</Nav.AlertStripe>;
  if (loading || !data?.hentSaksopplysninger?.persondata?.statsborgerskap) return <div>Laster statsborgerskap...</div>;

  const gyldigeStatsborgerskap = data.hentSaksopplysninger.persondata.statsborgerskap.filter(
    (statsborgerskap) => !statsborgerskap.erHistorisk
  );
  const historiskeStatsborgerskap = data.hentSaksopplysninger.persondata.statsborgerskap.filter(
    (statsborgerskap) => statsborgerskap.erHistorisk
  );

  return (
    <div className="statsborgerskapsliste">
      <ExpandableList
        elements={gyldigeStatsborgerskap}
        header={<GyldigeStatsborgerskapHeader className="statsborgerskapsliste__header" />}
        idFromElement={() => Utils._uuid()}
        renderElement={(statsborgerskap) => (
          <Rad statsborgerskap={statsborgerskap} gyldigFomFarge="groenn" className="statsborgerskapsliste__rad" />
        )}
        amountOfItemsCollapsed={gyldigeStatsborgerskap.length}
        chevron
        dividers
      />
      <ExpandableList
        elements={historiskeStatsborgerskap}
        header={<HistoriskeStatsborgerskapHeader className="statsborgerskapsliste__header" />}
        showHeader={(collapsed) => !collapsed}
        idFromElement={() => Utils._uuid()}
        renderElement={(statsborgerskap) => (
          <Rad statsborgerskap={statsborgerskap} gyldigFomFarge="roed" className="statsborgerskapsliste__rad" />
        )}
        amountOfItemsCollapsed={0}
        btnTextCollapsed="Åpne historikk"
        btnTextExpanded="Lukk historikk"
        chevron
        dividers
      />
    </div>
  );
};

export default Statsborgerkapsliste;
