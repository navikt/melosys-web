import React from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";

import MKV from "../../melosyskodeverk";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import Behandlingsmeny from "./behandlingsmeny";
import Personlinje from "./personlinje";
import Virksomhetlinje from "./virksomhetlinje";

import "./informasjonlinje.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingGjelder: behandlingerSelectors.BehandlingGjelderSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type InformasjonlinjeProps = PropsFromRedux & {
  visBehandlingsmeny?: boolean;
};

export const Separator = () => <div className="informasjonlinje__separator">/</div>;

const Informasjonlinje = ({ behandlingID, behandlingGjelder, visBehandlingsmeny = true }: InformasjonlinjeProps) => {
  const visPersonLinje = behandlingGjelder === MKV.Koder.aktoersroller.BRUKER;
  const visVirksomhetLinje = behandlingGjelder === MKV.Koder.aktoersroller.VIRKSOMHET;

  if (!visPersonLinje && !visVirksomhetLinje) return null;

  return (
    <div className="informasjonlinje">
      {visPersonLinje && <Personlinje behandlingID={behandlingID} />}
      {visVirksomhetLinje && <Virksomhetlinje behandlingID={behandlingID} />}
      {visBehandlingsmeny && <Behandlingsmeny />}
    </div>
  );
};

export default connector(Informasjonlinje);
