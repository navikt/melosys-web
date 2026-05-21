import { useEffect } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { isPristine } from "redux-form";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";

import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";
import * as KV from "../../kodeverk";
import * as DokumenterV2 from "../../services/modules/dokumenter-v2";

import Informasjonlinje from "../../felleskomponenter/informasjonlinje";
import { SendBrev } from "../../felleskomponenter/sideDialog";
import { behandlingerOperations } from "../../ducks/behandlinger";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { dokumenterOperations, dokumenterSelectors } from "../../ducks/dokumenter";

import "./sendbrev.less";

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
  dokumenter: DokumenterV2.FysiskDokument[];
}

type SendbrevProps = RouteComponentProps<RouteParams> & PropsFromRedux & Props;

function Sendbrev({
  match,
  redigerbart,
  hentBehandling,
  sendBrevFormIsPristine,
  dokumenter,
  hentDokumentOversikt,
}: SendbrevProps) {
  const behandlingID = Utils._toInteger(match.params.behandlingID);
  const saksnummer = match.params.snr;

  useEffect(() => {
    hentBehandling(behandlingID);
  }, [behandlingID]);

  useEffect(() => {
    hentDokumentOversikt(saksnummer);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!sendBrevFormIsPristine) {
        event.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [sendBrevFormIsPristine]);

  return (
    <>
      <Informasjonlinje visBehandlingsmeny={false} />
      <div id="main-container" className="main-container">
        <Nav.Container fluid className="sendbrev">
          <div className="panel">
            <SendBrev
              behandlingID={behandlingID}
              redigerbart={redigerbart}
              brevTypeSelectWidth="12"
              mottakerSelectWidth="12"
              mottakerTabellWidth="12"
              felterWidth="12"
              dokumenter={dokumenter}
            />
          </div>
        </Nav.Container>
      </div>
    </>
  );
}

export default withRouter(connector(Sendbrev));
