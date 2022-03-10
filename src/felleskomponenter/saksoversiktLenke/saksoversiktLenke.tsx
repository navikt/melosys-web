import React from "react";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import * as Ikon from "../../resources/images";
import * as Nav from "../../navFrontend";

import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { useFeatureToggle } from "../../featuretoggle";
import useHentPersonopplysninger from "../personlinje/useHentpersonopplysninger";
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
  const personopplysninger = useHentPersonopplysninger(behandlingID, false);

  const fnr = pdlToggle === "enabled" ? personopplysninger?.fnr : undefined;

  return (
    <div className="saksoversiktLenke">
      <Nav.Panel>
        Vis saksoversikt:
        <Nav.Lenker href="#" onClick={() => hentSaksoversikt(fnr)}>
          <Ikon.ExternalLink className="ikon" />
          Åpnes i nytt vindu
        </Nav.Lenker>
      </Nav.Panel>
    </div>
  );
};

export default connector(SaksoversiktLenke);
