import React, { ChangeEventHandler, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import PT from "prop-types";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { behandlingerOperations, behandlingerSelectors } from "../../../ducks/behandlinger";
import { behandlingsstatusSelectors } from "../../../ducks/behandlingsstatus";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { navigeringOperations } from "../../../ducks/navigering";
import Knapperad from "../../knapperad";

import * as Mui from "../../ui";
import * as Api from "../../../services/api";
import * as Nav from "../../../utils/navFrontend";
import * as Routing from "../../../routing";

import "./dialogboksEndreBehandlingsstatus.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingsstatus: behandlingerSelectors.BehandlingsstatusKodeSelector(state),
  muligeBehandlingsstatuser: behandlingsstatusSelectors.MuligeBehandlingsstatusSelector(state),
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  hentBehandling: (behandlingID: number) => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  tilAnnenSide: (link: string) => dispatch(navigeringOperations.tilAnnenSide(link)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  avbryt: () => void;
}

export function DialogboksEndreBehandlingsstatus({
  avbryt,
  behandlingID,
  hentBehandling,
  muligeBehandlingsstatuser,
  saksnummer,
  tilAnnenSide,
  ...props
}: Props & PropsFromRedux) {
  const [behandlingsstatus, setBehandlingsstatus] = useState("");
  const [generellFeil, setGenerellFeil] = useState("");
  const [behandlingsstatusEndret, setBehandlingsstatusEndret] = useState(false);
  const link = Routing.lagUrl(saksnummer, behandlingID, props.behandlingsstatus);

  const velgBehandlingsstatuserHandle: ChangeEventHandler<HTMLInputElement> = (event) => {
    setBehandlingsstatus(event.target.value);
  };

  const endreBehandlingsstatuserHandle = () => {
    Api.Behandlinger.status
      .oppdaterStatus(behandlingID, behandlingsstatus)
      .then(() => {
        setBehandlingsstatusEndret(true);
        hentBehandling(behandlingID);
        const nyLink = Routing.lagUrl(saksnummer, behandlingID, behandlingsstatus);
        if (nyLink && nyLink !== link) tilAnnenSide(nyLink);
      })
      .catch(() => {
        setGenerellFeil(
          "Behandlingsstatus ble ikke endret og oppdatert. Prøv igjen, eller se driftsmeldinger for mer informasjon"
        );
      });
  };

  const renderBehandlingsstatuserEndret = () => (
    <div className="dialogboks">
      <div className="innhold">
        <Nav.AlertStripe type="suksess">Behandlingsstatusen har blitt endret og oppdatert.</Nav.AlertStripe>
      </div>
      <div style={{ float: "right" }}>
        <Mui.Knapp onClick={avbryt}>LUKK</Mui.Knapp>
      </div>
    </div>
  );

  const renderEndreBehandlingsstatuser = () => (
    <div className="dialogboks">
      {!generellFeil ? (
        <div>
          <Nav.typo.Systemtittel className="overskrift">Velg ny behandlingsstatus</Nav.typo.Systemtittel>
          <div className="innhold">
            <Mui.KodeTermSelect
              onChange={velgBehandlingsstatuserHandle}
              label=""
              disableForsteValg={!!behandlingsstatus}
              value={behandlingsstatus}
              koder={muligeBehandlingsstatuser}
            />
          </div>
          <div>
            <Knapperad
              avbryt={avbryt}
              avbrytTekst="AVBRYT"
              bekreft={endreBehandlingsstatuserHandle}
              bekreftTekst="ENDRE BEHANDLINGSSTATUS"
              redigerbart
              bekreftRedigerbart={!!behandlingsstatus}
            />
          </div>
        </div>
      ) : (
        <div>
          <div className="innhold">
            <Nav.AlertStripe type="feil">{generellFeil}</Nav.AlertStripe>
          </div>
          <div style={{ float: "right" }}>
            <Mui.Knapp onClick={avbryt}>LUKK</Mui.Knapp>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Nav.Modal
      className="dialogboksEndreBehandlingsstatus"
      isOpen
      contentLabel="Velg ny behandlingsstatus"
      onRequestClose={avbryt}
      closeButton={false}
      shouldCloseOnOverlayClick
    >
      {behandlingsstatusEndret ? renderBehandlingsstatuserEndret() : renderEndreBehandlingsstatuser()}
    </Nav.Modal>
  );
}

DialogboksEndreBehandlingsstatus.propTypes = {
  avbryt: PT.func.isRequired,
  behandlingID: PT.number.isRequired,
  behandlingsstatus: PT.string.isRequired,
  hentBehandling: PT.func.isRequired,
  muligeBehandlingsstatuser: PT.array.isRequired,
  saksnummer: PT.string.isRequired,
  tilAnnenSide: PT.func.isRequired,
};

export default connector(DialogboksEndreBehandlingsstatus);
