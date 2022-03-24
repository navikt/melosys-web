import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import * as Ikon from "../../resources/images";
import * as Nav from "../../navFrontend";
import * as Routing from "../../routing";

import { behandlingerSelectors } from "../../ducks/behandlinger";
import useHentPersonopplysninger from "../personlinje/useHentpersonopplysninger";
import "./saksoversiktLenke.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const SaksoversiktLenke = ({ behandlingID }: PropsFromRedux) => {
  const personopplysninger = useHentPersonopplysninger(behandlingID, false);

  const hentSaksoversikt = (fnr: string | undefined) => {
    if (!fnr) throw new Error("Mangler personopllysninger mangler fnr");

    sessionStorage.setItem("sokefrase", fnr);
    Routing.nyFane("sok");
  };

  return (
    <div className="saksoversiktLenke">
      <Nav.Panel>
        Vis saksoversikt:
        <Nav.Lenker href="#" onClick={() => hentSaksoversikt(personopplysninger?.fnr)}>
          <Ikon.ExternalLink className="ikon" />
          Åpnes i nytt vindu
        </Nav.Lenker>
      </Nav.Panel>
    </div>
  );
};

export default connector(SaksoversiktLenke);
