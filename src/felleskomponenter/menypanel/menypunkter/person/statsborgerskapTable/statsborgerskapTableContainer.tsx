import * as Nav from "../../../../../navFrontend";

import { useHentStatsborgerskapQuery } from "./hentStatsborgerskap.generated";

import StatsborgerskapTable from "./statsborgerskapTable";

interface StatsborgerskapTableContainerProps {
  behandlingID: number;
}

const StatsborgerskapTableContainer = ({ behandlingID }: StatsborgerskapTableContainerProps) => {
  const { loading, error, data } = useHentStatsborgerskapQuery({ variables: { behandlingID } });

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
};

export default StatsborgerskapTableContainer;
