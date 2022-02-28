import React from "react";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import * as Ikon from "../../resources/images";
import * as Nav from "../../navFrontend";

import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { useFeatureToggle } from "../../featuretoggle";
import hentPersonopplysninger from "../personlinje/hentpersonopplysninger";
import "./saksoversiktLenke.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  hentSaksoversikt: (fnr: string | undefined) => dispatch(behandlingerOperations.apneTidligereBehandlinger(fnr)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const SaksoversiktLenke = ({ behandlingID, hentSaksoversikt }: PropsFromRedux) => {
  const pdlToggle = useFeatureToggle("melosys.pdl.aktiv");
  const personopplysninger = hentPersonopplysninger(behandlingID);

  const fnr = pdlToggle === "enabled" ? personopplysninger?.fnr : undefined;

  return (
    <div className="saksoversiktLenke">
      <Nav.Panel>
        <div
          role="button"
          tabIndex={0}
          onClick={() => hentSaksoversikt(fnr)}
          onKeyPress={(event) => event.key === "Enter" && hentSaksoversikt(fnr)}
        >
          <Ikon.Copy className="ikon" />
          Vis saksoversikt
        </div>
      </Nav.Panel>
    </div>
  );
};

export default connector(SaksoversiktLenke);
