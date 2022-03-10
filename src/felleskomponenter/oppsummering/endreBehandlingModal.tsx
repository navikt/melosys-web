import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import classNames from "classnames";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { KTObject } from "@navikt/melosys-kodeverk";
import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { behandlingsgrunnlagOperations } from "../../ducks/behandlingsgrunnlag";
import { behandlingstemaOperations, behandlingstemaSelectors } from "../../ducks/behandlingstema";
import { behandlingstypeOperations, behandlingstypeSelectors } from "../../ducks/behandlingstype";
import { navigeringOperations } from "../../ducks/navigering";
import Knapperad from "../knapperad";

import * as Mui from "../ui";
import * as KV from "../../kodeverk";
import * as Api from "../../services/api";
import * as Nav from "../../navFrontend";
import * as Routing from "../../routing";
import { behandlingsstatusOperations, behandlingsstatusSelectors } from "../../ducks/behandlingsstatus";
import Datovelger from "../datovelger";
import * as Datoutils from "../../utils/dato";

import "./endreBehandlingModal.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  muligeBehandlingstyper: behandlingstypeSelectors.MuligeBehandlingstyperSelector(state),
  muligeBehandlingstema: behandlingstemaSelectors.MuligeBehandlingstemaSelector(state),
  muligeBehandlingsstatuser: behandlingsstatusSelectors.MuligeBehandlingsstatusSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  hentBehandling: (behandlingID: number) => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentBehandlingsgrunnlag: (behandlingID: number) => dispatch(behandlingsgrunnlagOperations.hent(behandlingID)),
  hentMuligeBehandlingstema: (behandlingID: number) =>
    dispatch(behandlingstemaOperations.hentMuligeBehandlingstema(behandlingID)),
  hentMuligeBehandlingstyper: (behandlingID: number) =>
    dispatch(behandlingstypeOperations.hentMuligeBehandlingstyper(behandlingID)),
  hentMuligeBehandlingsstatuser: (behandlingID: number) =>
    dispatch(behandlingsstatusOperations.hentMuligeBehandlingsstatuser(behandlingID)),
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
  hentMuligeBehandlingstyper,
  hentMuligeBehandlingstema,
  hentMuligeBehandlingsstatuser,
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

  const link = Routing.lagUrl(fagsak.saksnummer, behandlingID, behandlingstema);

  useEffect(() => {
    if (skalViseModal) {
      hentMuligeBehandlingstyper(behandlingID);
      hentMuligeBehandlingstema(behandlingID);
      hentMuligeBehandlingsstatuser(behandlingID);
      setGenerellFeil("");
      setBehandlingEndret(false);
      setBehandlingstype(KV.objektTilKodeUtenFeilmelding(oppsummering.behandlingstype));
      setBehandlingstema(KV.objektTilKodeUtenFeilmelding(oppsummering.behandlingstema));
      setBehandlingsstatus(KV.objektTilKodeUtenFeilmelding(oppsummering.behandlingsstatus));
      setBehandlingsfrist(Datoutils.isoStringTilDate(oppsummering.behandlingsfrist));
    }
  }, [skalViseModal]);

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
        const nyLink = Routing.lagUrl(fagsak.saksnummer, behandlingID, behandlingstema);
        if (nyLink && nyLink !== link) tilAnnenSide(nyLink);
        setTimeout(lukkModal, 2000);
      })
      .catch(() => {
        setGenerellFeil(
          "Behandling ble ikke endret og oppdatert. Prøv igjen, eller se driftsmeldinger for mer informasjon"
        );
        setTimeout(lukkModal, 5000);
      });
  };

  const muligeVerdierPlussValgt = (muligeVerdier: KTObject[], valgtVerdi: KTObject) => {
    return [valgtVerdi].concat(muligeVerdier.filter((verdi) => verdi.kode !== valgtVerdi.kode));
  };

  const viserAlert = behandlingEndret || generellFeil?.length > 0;

  const renderEndreBehandling = () => {
    return (
      <div className="dialogboks">
        <div>
          <div className="innhold">
            <Mui.KodeTermSelect
              onChange={() => null}
              label="Sakstype"
              value={KV.objektTilTerm(fagsak.sakstype)}
              koder={[fagsak.sakstype]}
              disableForsteValg
              redigerbart={false}
            />
            <Mui.KodeTermSelect
              onChange={(e) => setBehandlingstype(e.target.value)}
              label="Behandlingstype"
              value={behandlingstype}
              koder={muligeVerdierPlussValgt(muligeBehandlingstyper, oppsummering.behandlingstype)}
              disableForsteValg
            />
            <Mui.KodeTermSelect
              onChange={(e) => setBehandlingstema(e.target.value)}
              label="Behandlingstema"
              value={behandlingstema}
              koder={muligeVerdierPlussValgt(muligeBehandlingstema, oppsummering.behandlingstema)}
              disableForsteValg
            />
            <Datovelger onChange={setBehandlingsfrist} label="Frist" value={behandlingsfrist} />
            <Mui.KodeTermSelect
              onChange={(e) => setBehandlingsstatus(e.target.value)}
              label="Behandlingsstatus"
              value={behandlingsstatus}
              koder={muligeVerdierPlussValgt(muligeBehandlingsstatuser, oppsummering.behandlingsstatus)}
              disableForsteValg
            />
          </div>
          <Knapperad
            avbryt={lukkModal}
            avbrytTekst="Avbryt"
            bekreft={endreBehandlingHandle}
            bekreftTekst="Lagre endringene"
            redigerbart
          />
        </div>
      </div>
    );
  };

  const renderInnhold = () => {
    if (generellFeil) {
      return <Nav.AlertStripe type="feil">{generellFeil}</Nav.AlertStripe>;
    }
    if (behandlingEndret) {
      return <Nav.AlertStripe type="suksess">Behandlingen er oppdatert</Nav.AlertStripe>;
    }
    return renderEndreBehandling();
  };

  return (
    <Nav.Modal
      className={classNames("modalEndreBehandling", { alert: viserAlert })}
      contentLabel="Endre behandling"
      isOpen={skalViseModal}
      onRequestClose={lukkModal}
      closeButton={!viserAlert}
      shouldCloseOnOverlayClick={viserAlert}
    >
      {renderInnhold()}
    </Nav.Modal>
  );
}

export default connector(EndreBehandlingModal);
