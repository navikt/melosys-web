import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import MKV from "../../melosyskodeverk";
import * as Api from "../../services/api";
import * as Ikon from "../../resources/images";
import * as Nav from "../../navFrontend";
import * as Routing from "../../routing";

import { behandlingerSelectors } from "../../ducks/behandlinger";
import { fagsakSelectors } from "../../ducks/fagsaker";
import useHentPersonopplysninger from "../informasjonlinje/useHentpersonopplysninger";

import "./saksoversiktLenke.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
  hovedpartRolle: fagsakSelectors.HovedpartRolleSelector(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const SaksoversiktLenke = ({ behandlingID, saksnummer, hovedpartRolle }: PropsFromRedux) => {
  const hovedpartErVirksomhet = hovedpartRolle === MKV.Koder.aktoersroller.VIRKSOMHET;
  const personopplysninger = useHentPersonopplysninger(behandlingID, hovedpartErVirksomhet);

  const hentSaksoversikt = async () => {
    if (hovedpartErVirksomhet) {
      const org = await Api.Fagsaker.aktoer
        .hent(saksnummer, MKV.Koder.aktoersroller.VIRKSOMHET)
        .then((response: Api.Fagsaker.aktoer.Aktoer[]) => {
          if (response?.length !== 1 || !response[0].orgnr) {
            return undefined;
          }
          return Api.Organisasjoner.hentOrganisasjon(response[0].orgnr);
        });
      if (!org?.orgnr) throw new Error("Organisasjonsopplysninger mangler orgnr");
      sessionStorage.setItem("sokefrase", org.orgnr);
    } else {
      const fnr = personopplysninger?.fnr;
      if (!fnr) throw new Error("Personopplysninger mangler fnr");
      sessionStorage.setItem("sokefrase", fnr);
    }

    Routing.nyFane("sok");
  };

  return (
    <div className="saksoversiktLenke">
      <Nav.Panel>
        Vis saksoversikt:
        <Nav.Lenker href="#" onClick={() => hentSaksoversikt()}>
          <Ikon.ExternalLink className="ikon" />
          Åpnes i nytt vindu
        </Nav.Lenker>
      </Nav.Panel>
    </div>
  );
};

export default connector(SaksoversiktLenke);
