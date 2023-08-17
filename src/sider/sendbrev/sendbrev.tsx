import { useEffect } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { isPristine } from "redux-form";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { FysiskDokument } from "Domene";
import { useBeforeunload } from "react-beforeunload";

import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";
import * as KV from "../../kodeverk";

import Informasjonlinje from "../../felleskomponenter/informasjonlinje";
import { SendBrev } from "../../felleskomponenter/sideDialog";
import { behandlingerOperations } from "../../ducks/behandlinger";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { dokumenterOperations, dokumenterSelectors } from "../../ducks/dokumenter";

import "./sendbrev.css";

const mapStateToProps = (state: RootState) => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  sendBrevFormIsPristine: isPristine(KV.Form.SEND_BREV)(state),
  dokumenter: dokumenterSelectors.AlleFysiskeDokumentSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  hentBehandling: (behandlingID: number) => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentDokumentOversikt: (saksnummer: string) => dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface RouteParams {
  behandlingID: string;
  snr: string;
}

interface Props {
  dokumenter: FysiskDokument[];
}

type SendbrevProps = RouteComponentProps<RouteParams> & PropsFromRedux & Props;

const Sendbrev = ({
  match,
  redigerbart,
  hentBehandling,
  sendBrevFormIsPristine,
  dokumenter,
  hentDokumentOversikt,
}: SendbrevProps) => {
  const behandlingID = Utils._toInteger(match.params.behandlingID);
  const saksnummer = match.params.snr;

  useEffect(() => {
    hentBehandling(behandlingID);
  }, [behandlingID]);

  useEffect(() => {
    hentDokumentOversikt(saksnummer);
  }, []);

  useBeforeunload((event) => {
    const visBekreftelseForLukkingAvFane = () => {
      event.preventDefault();
    };

    if (!sendBrevFormIsPristine) {
      visBekreftelseForLukkingAvFane();
    }
  });

  return (
    <>
      <Informasjonlinje visBehandlingsmeny={false} />
      <div id="main-container" className="main-container">
        <Nav.Container fluid className="sendbrev">
          <Nav.Panel>
            <SendBrev
              behandlingID={behandlingID}
              redigerbart={redigerbart}
              visApneINyttVindu={false}
              brevTypeSelectWidth="5"
              mottakerSelectWidth="5"
              mottakerTabellWidth="5"
              felterWidth="5"
              dokumenter={dokumenter}
              saksnummer={saksnummer}
            />
          </Nav.Panel>
        </Nav.Container>
      </div>
    </>
  );
};

export default withRouter(connector(Sendbrev));
