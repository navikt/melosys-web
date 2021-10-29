import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import PT from "prop-types";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { behandlingerOperations, behandlingerSelectors } from "../../../../ducks/behandlinger";
import { behandlingsstatusSelectors } from "../../../../ducks/behandlingsstatus";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import { navigeringOperations } from "../../../../ducks/navigering";
import Knapperad from "../../../knapperad";

import * as Mui from "../../../ui";
import * as Api from "../../../../services/api";
import * as Nav from "../../../../navFrontend";
import * as Routing from "../../../../routing";

import "./dialogboksEndreBehandlingsfrist.css";
import Datovelger from "../../../datovelger";

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

function DialogboksEndreBehandlingsfrist({
  avbryt,
  behandlingID,
  hentBehandling,
  muligeBehandlingsstatuser,
  saksnummer,
  tilAnnenSide,
  ...props
}: Props & PropsFromRedux) {
  const [dato, setDato] = useState<Date>();
  const [generellFeil, setGenerellFeil] = useState("");
  const [behandlingsfristEndret, setBehandlingsfristEndret] = useState(false);
  const link = Routing.lagUrl(saksnummer, behandlingID, props.behandlingsstatus);

  const endreBehandlingsfristHandle = () => {
    if (!dato) return;
    Api.Behandlinger.behandlingsfrist
      .oppdaterBehandlingsfrist(behandlingID, dato)
      .then(() => {
        setBehandlingsfristEndret(true);
        hentBehandling(behandlingID);
        const nyLink = Routing.lagUrl(saksnummer, behandlingID, dato?.toLocaleDateString() || "mangler-dato");
        if (nyLink && nyLink !== link) tilAnnenSide(nyLink);
      })
      .catch(() => {
        setGenerellFeil(
          "Behandlingsfrist ble ikke endret og oppdatert. Prøv igjen, eller se driftsmeldinger for mer informasjon"
        );
      });
  };

  const renderBehandlingsfristEndret = () => (
    <div className="dialogboks">
      <div className="innhold">
        <Nav.AlertStripe type="suksess">Behandlingsfristen har blitt endret og oppdatert.</Nav.AlertStripe>
      </div>
      <Mui.Knapp className="avbryt-knapp" onClick={avbryt}>
        LUKK
      </Mui.Knapp>
    </div>
  );

  const renderEndreBehandlingsfrist = () => (
    <div className="dialogboks">
      {!generellFeil ? (
        <div>
          <Nav.Typo.Systemtittel className="overskrift">Velg ny behandlingsfrist</Nav.Typo.Systemtittel>
          <div className="innhold">
            <Datovelger onChange={setDato} value={dato} />
          </div>
          <div>
            <Knapperad
              avbryt={avbryt}
              avbrytTekst="AVBRYT"
              bekreft={endreBehandlingsfristHandle}
              bekreftTekst="ENDRE BEHANDLINGSFRIST"
              redigerbart
              bekreftRedigerbart={!!dato}
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
      className="dialogboksEndreBehandlingsfrist"
      isOpen
      contentLabel="Velg ny behandlingsfrist"
      onRequestClose={avbryt}
      closeButton={false}
      shouldCloseOnOverlayClick
    >
      {behandlingsfristEndret ? renderBehandlingsfristEndret() : renderEndreBehandlingsfrist()}
    </Nav.Modal>
  );
}

DialogboksEndreBehandlingsfrist.propTypes = {
  avbryt: PT.func.isRequired,
  behandlingID: PT.number.isRequired,
  behandlingsstatus: PT.string.isRequired,
  hentBehandling: PT.func.isRequired,
  muligeBehandlingsstatuser: PT.array.isRequired,
  saksnummer: PT.string.isRequired,
  tilAnnenSide: PT.func.isRequired,
};

export default connector(DialogboksEndreBehandlingsfrist);
