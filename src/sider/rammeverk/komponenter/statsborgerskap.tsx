import React from "react";
import "./personlinje.css";
import * as StringUtils from "../../../utils/streng";
import { useHentStatsborgerskapQuery } from "../../../felleskomponenter/menypanel/menypunkter/person/statsborgerskapsliste/hentStatsborgerskap.generated";

type StatsborgerskapProps = {
  behandlingID: number;
};

const Statsborgerskap = ({ behandlingID }: StatsborgerskapProps) => {
  const { data, error } = useHentStatsborgerskapQuery({ variables: { behandlingID } });

  const gyldigeStatsborgerskap = error
    ? ["Kunne ikke hente statsborgerskap!"]
    : data?.hentSaksopplysninger.persondata.statsborgerskap
        .filter((s) => !s.erHistorisk)
        .map((s) => StringUtils.storeForbokstaverForLand(s.land)) || [];

  return (
    <div className="personlinje__statsborgerskap">{StringUtils.separerListeMedBindestrek(gyldigeStatsborgerskap)}</div>
  );
};

export default Statsborgerskap;
