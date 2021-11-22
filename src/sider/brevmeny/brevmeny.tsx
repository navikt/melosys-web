import React, { useEffect } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { isPristine } from "redux-form";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { useBeforeunload } from "react-beforeunload";

import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";
import * as KV from "../../kodeverk";

import { SendBrev } from "../../felleskomponenter/sideDialog";
import { behandlingerOperations } from "../../ducks/behandlinger";
import { redigerbartSelectors } from "../../ducks/redigerbart";

import "./brevmeny.css";

const mapStateToProps = (state: RootState) => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  sendBrevFormIsPristine: isPristine(KV.Form.SEND_BREV)(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  hentBehandling: (behandlingID: number) => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface RouteParams {
  behandlingID: string;
}

type BrevmenyProps = RouteComponentProps<RouteParams> & PropsFromRedux;

const Brevmeny = ({ match, redigerbart, hentBehandling, sendBrevFormIsPristine }: BrevmenyProps) => {
  const behandlingID = Utils._toInteger(match.params.behandlingID);

  useEffect(() => {
    hentBehandling(behandlingID);
  }, [behandlingID]);

  useBeforeunload((event) => {
    const visBekreftelseForLukkingAvFane = () => {
      event.preventDefault();
    };

    if (!sendBrevFormIsPristine) {
      visBekreftelseForLukkingAvFane();
    }
  });

  return (
    <Nav.Container fluid className="brevmeny">
      <Nav.Panel>
        <SendBrev
          behandlingID={behandlingID}
          redigerbart={redigerbart}
          visApneINyttVindu={false}
          brevTypeSelectWidth="5"
          mottakerSelectWidth="5"
          mottakerTabellWidth="5"
          orgnrInputWidth="2"
          kontaktpersonInputWidth="3"
        />
      </Nav.Panel>
    </Nav.Container>
  );
};

export default withRouter(connector(Brevmeny));
