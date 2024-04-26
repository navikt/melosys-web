import { MouseEvent } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import MKV from "../../melosyskodeverk";
import * as Api from "../../services/api";
import * as Ikon from "../../resources/images";
import * as Nav from "../../navFrontend";
import * as Routing from "../../url";

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

  const hentSaksoversikt = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
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
      <div className="panel">
        <span>Vis saksoversikt:</span>
        <Nav.Link href="#" onClick={hentSaksoversikt}>
          Åpnes i nytt vindu
          <Ikon.ExternalLink />
        </Nav.Link>
      </div>
    </div>
  );
};

export default connector(SaksoversiktLenke);
