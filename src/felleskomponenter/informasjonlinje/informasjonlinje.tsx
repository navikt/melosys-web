import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";

import MKV from "../../melosyskodeverk";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { fagsakSelectors } from "../../ducks/fagsaker";
import Behandlingsmeny from "./behandlingsmeny";
import Personlinje from "./personlinje";
import Virksomhetlinje from "./virksomhetlinje";

import "./informasjonlinje.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
  hovedpartRolle: fagsakSelectors.HovedpartRolleSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type InformasjonlinjeProps = PropsFromRedux & {
  visBehandlingsmeny?: boolean;
};

const Informasjonlinje = ({
  behandlingID,
  saksnummer,
  hovedpartRolle,
  visBehandlingsmeny = true,
}: InformasjonlinjeProps) => {
  const visPersonLinje = hovedpartRolle === MKV.Koder.aktoersroller.BRUKER;
  const visVirksomhetLinje = hovedpartRolle === MKV.Koder.aktoersroller.VIRKSOMHET;

  if (!visPersonLinje && !visVirksomhetLinje) return null;

  return (
    <div className="informasjonlinje">
      {visPersonLinje && <Personlinje behandlingID={behandlingID} />}
      {visVirksomhetLinje && <Virksomhetlinje saksnummer={saksnummer} />}
      {visBehandlingsmeny && <Behandlingsmeny />}
    </div>
  );
};

export default connector(Informasjonlinje);
