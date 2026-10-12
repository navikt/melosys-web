import * as Nav from "../../../../../navFrontend";

import { useQuery } from "@apollo/client/react";
import { HentStatsborgerskapDocument } from "./hentStatsborgerskap.generated";

import StatsborgerskapTable from "./statsborgerskapTable";

interface StatsborgerskapTableContainerProps {
  behandlingID: number;
}

function StatsborgerskapTableContainer({ behandlingID }: StatsborgerskapTableContainerProps) {
  const { loading, error, data } = useQuery(HentStatsborgerskapDocument, { variables: { behandlingID } });

  if (error) return <Nav.Alert variant="error">Kunne ikke hente statsborgerskap!</Nav.Alert>;
  if (loading) return <div>Laster statsborgerskap...</div>;

  const gyldigeStatsborgerskap =
    data?.hentSaksopplysninger.persondata.statsborgerskap.filter((statsborgerskap) => !statsborgerskap.erHistorisk) ||
    [];
  const historiskeStatsborgerskap =
    data?.hentSaksopplysninger.persondata.statsborgerskap.filter((statsborgerskap) => statsborgerskap.erHistorisk) ||
    [];

  return (
    <>
      <StatsborgerskapTable statsborgerskapList={gyldigeStatsborgerskap} />
      {historiskeStatsborgerskap.length > 0 ? (
        <StatsborgerskapTable statsborgerskapList={historiskeStatsborgerskap} historisk />
      ) : null}
    </>
  );
}

export default StatsborgerskapTableContainer;
