import React, { ChangeEventHandler, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { behandlingsgrunnlagOperations } from "../../ducks/behandlingsgrunnlag";
import { behandlingstemaSelectors } from "../../ducks/behandlingstema";
import { behandlingstypeSelectors } from "../../ducks/behandlingstype";
import { fagsakSelectors } from "../../ducks/fagsaker";
import { navigeringOperations } from "../../ducks/navigering";
import Knapperad from "../knapperad";

import * as Mui from "../ui";
import * as KV from "../../kodeverk";
import * as Api from "../../services/api";
import * as Nav from "../../navFrontend";
import * as Routing from "../../routing";
import { behandlingsstatusSelectors } from "../../ducks/behandlingsstatus";
import Datovelger from "../datovelger";
import * as Datoutils from "../../utils/dato";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  muligeBehandlingstyper: behandlingstypeSelectors.MuligeBehandlingstyperSelector(state),
  muligeBehandlingstema: behandlingstemaSelectors.MuligeBehandlingstemaSelector(state),
  muligeBehandlingsstatuser: behandlingsstatusSelectors.MuligeBehandlingsstatusSelector(state),
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  hentBehandling: (behandlingID: number) => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentBehandlingsgrunnlag: (behandlingID: number) => dispatch(behandlingsgrunnlagOperations.hent(behandlingID)),
  tilAnnenSide: (link: string) => dispatch(navigeringOperations.tilAnnenSide(link)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type EndreBehandlingModalProps = PropsFromRedux & {
  fagsak: Api.Fagsak;
  oppsummering: Api.Behandlinger.behandling.Oppsummering;
  skalViseModal: boolean;
  lukkModal: () => void;
};

function EndreBehandlingModal({
  skalViseModal,
  lukkModal,
  behandlingID,
  oppsummering,
  fagsak,
  hentBehandling,
  hentBehandlingsgrunnlag,
  muligeBehandlingstyper,
  muligeBehandlingstema,
  muligeBehandlingsstatuser,
  saksnummer,
  tilAnnenSide,
}: EndreBehandlingModalProps) {
  const [generellFeil, setGenerellFeil] = useState("");
  const [behandlingEndret, setBehandlingEndret] = useState(false);

  const [behandlingstype, setBehandlingstype] = useState(KV.objektTilKodeUtenFeilmelding(oppsummering.behandlingstype));
  const [behandlingstema, setBehandlingstema] = useState(KV.objektTilKodeUtenFeilmelding(oppsummering.behandlingstema));
  const [behandlingsstatus, setBehandlingsstatus] = useState(
    KV.objektTilKodeUtenFeilmelding(oppsummering.behandlingsstatus)
  );
  const [behandlingsfrist, setBehandlingsfrist] = useState(Datoutils.isoStringTilDate(oppsummering.behandlingsfrist));

  const link = Routing.lagUrl(saksnummer, behandlingID, behandlingstema);

  const velgBehandlingstypeHandle: ChangeEventHandler<HTMLInputElement> = (event) => {
    setBehandlingstype(event.target.value);
  };
  const velgBehandlingstemaHandle: ChangeEventHandler<HTMLInputElement> = (event) => {
    setBehandlingstema(event.target.value);
  };
  const velgBehandlingsstatusHandle: ChangeEventHandler<HTMLInputElement> = (event) => {
    setBehandlingsstatus(event.target.value);
  };

  const lukkModalHandle = () => {
    setGenerellFeil("");
    setBehandlingEndret(false);
    setBehandlingstype(KV.objektTilKodeUtenFeilmelding(oppsummering.behandlingstype));
    setBehandlingstema(KV.objektTilKodeUtenFeilmelding(oppsummering.behandlingstema));
    setBehandlingsstatus(KV.objektTilKodeUtenFeilmelding(oppsummering.behandlingsstatus));
    setBehandlingsfrist(Datoutils.norskStringTilDate(oppsummering.behandlingsfrist));
    lukkModal();
  };

  const endreBehandlingHandle = () => {
    const req: Api.Behandlinger.behandling.EndreBehandlingReqDto = {
      sakstype: KV.objektTilKode(fagsak.sakstype),
      behandlingstype,
      behandlingstema,
      behandlingsstatus,
      behandlingsfrist: Datoutils.dateTilIsoString(behandlingsfrist) || "",
    };
    Api.Behandlinger.behandling
      .endreBehandling(behandlingID, req)
      .then(() => {
        setBehandlingEndret(true);
        hentBehandling(behandlingID);
        hentBehandlingsgrunnlag(behandlingID);
        const nyLink = Routing.lagUrl(saksnummer, behandlingID, behandlingstema);
        if (nyLink && nyLink !== link) tilAnnenSide(nyLink);
      })
      .catch(() => {
        setGenerellFeil(
          "Behandling ble ikke endret og oppdatert. Prøv igjen, eller se driftsmeldinger for mer informasjon"
        );
      });
  };

  const renderBehandlingEndret = () => (
    <div className="dialogboks">
      <div className="innhold">
        <Nav.AlertStripe type="suksess">Behandlingen er oppdatert</Nav.AlertStripe>
      </div>
    </div>
  );

  const renderFeil = () => (
    <>
      <div className="innhold">
        <Nav.AlertStripe type="feil">{generellFeil}</Nav.AlertStripe>
      </div>
      <div style={{ float: "right" }}>
        <Mui.Knapp onClick={lukkModalHandle}>LUKK</Mui.Knapp>
      </div>
    </>
  );

  const renderEndreBehandling = () => {
    return (
      <div className="dialogboks">
        <div>
          <div className="innhold">
            Sakstype: {KV.objektTilTerm(fagsak.sakstype)}
            <Mui.KodeTermSelect
              onChange={velgBehandlingstypeHandle}
              label="Behandlingstype"
              value={behandlingstype}
              koder={muligeBehandlingstyper}
            />
            <Mui.KodeTermSelect
              onChange={velgBehandlingstemaHandle}
              label="Behandlingstema"
              value={behandlingstema}
              koder={muligeBehandlingstema}
            />
            <Datovelger onChange={setBehandlingsfrist} label="Frist" value={behandlingsfrist} />
            <Mui.KodeTermSelect
              onChange={velgBehandlingsstatusHandle}
              label="Behandlingsstatus"
              value={behandlingsstatus}
              koder={muligeBehandlingsstatuser}
            />
          </div>
          <div>
            <Knapperad
              avbryt={lukkModalHandle}
              avbrytTekst="Avbryt"
              bekreft={endreBehandlingHandle}
              bekreftTekst="Ok, oppdater behandlingen"
              redigerbart
              bekreftRedigerbart={!!behandlingstema}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderInnhold = () => {
    if (generellFeil) return renderFeil();
    else if (behandlingEndret) return renderBehandlingEndret();
    return renderEndreBehandling();
  };

  return (
    <Nav.Modal
      className="modalEndreBehandling"
      contentLabel="Endre behandling"
      isOpen={skalViseModal}
      onRequestClose={lukkModalHandle}
      closeButton
      shouldCloseOnOverlayClick={false}
    >
      {renderInnhold()}
    </Nav.Modal>
  );
}

export default connector(EndreBehandlingModal);
