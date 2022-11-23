import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import classNames from "classnames";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { KTObject } from "@navikt/melosys-kodeverk";
import { RouteComponentProps, withRouter } from "react-router-dom";

import MKV from "../../melosyskodeverk";
import * as Mui from "../ui";
import * as Api from "../../services/api";
import * as Nav from "../../navFrontend";
import * as Routing from "../../routing";
import * as Datoutils from "../../utils/dato";

import { behandlingsstatusOperations, behandlingsstatusSelectors } from "../../ducks/behandlingsstatus";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { behandlingstypeOperations, behandlingstypeSelectors } from "../../ducks/behandlingstype";
import { behandlingstemaOperations, behandlingstemaSelectors } from "../../ducks/behandlingstema";
import { fagsakOperations, fagsakSelectors } from "../../ducks/fagsaker";
import { saksopplysningerOperations } from "../../ducks/saksopplysninger";
import { navigeringOperations } from "../../ducks/navigering";

import { erBehandlingstemaMedBegrensetRettigheter } from "../../melosyskodeverk/kodekombinasjoner";
import Datovelger from "../datovelger";
import Knapperad from "../knapperad";
import { StandardMeldingOverst } from "../alertmeldinger";
import { Spinner } from "../spinner";

import "./endreBehandlingModal.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  muligeBehandlingsstatuser: behandlingsstatusSelectors.MuligeBehandlingsstatusSelector(state),
  muligeSakstemaer_gammel: fagsakSelectors.SakstemaerSelector(state),
  muligeSakstyper_gammel: fagsakSelectors.SakstyperSelector(state),
  muligeBehandlingstyper_gammel: behandlingstypeSelectors.MuligeBehandlingstyperSelector(state),
  muligeBehandlingstemaer_gammel: behandlingstemaSelectors.MuligeBehandlingstemaSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppfriskSaksopplysninger: (behandlingID: number) => saksopplysningerOperations.oppfrisk(behandlingID),
  hentMuligeBehandlingstemaer_gammel: (behandlingID: number) =>
    dispatch(behandlingstemaOperations.hentMuligeBehandlingstema(behandlingID)),
  hentMuligeSakstyper_gammel: (saksnummer: string) => dispatch(fagsakOperations.hentMuligeSakstyper(saksnummer)),
  hentMuligeBehandlingstyper_gammel: (behandlingID: number) =>
    dispatch(behandlingstypeOperations.hentMuligeBehandlingstyper(behandlingID)),
  hentMuligeBehandlingsstatuser: (behandlingID: number) =>
    dispatch(behandlingsstatusOperations.hentMuligeBehandlingsstatuser(behandlingID)),
  tilAnnenSide: (link: string) => dispatch(navigeringOperations.tilAnnenSide(link)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type EndreBehandlingModalProps = PropsFromRedux &
  RouteComponentProps & {
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
  muligeSakstyper_gammel,
  muligeBehandlingstyper_gammel,
  muligeBehandlingstemaer_gammel,
  muligeBehandlingsstatuser,
  hentMuligeBehandlingstyper_gammel,
  hentMuligeBehandlingstemaer_gammel,
  hentMuligeSakstyper_gammel,
  hentMuligeBehandlingsstatuser,
  tilAnnenSide,
  location,
  oppfriskSaksopplysninger,
}: EndreBehandlingModalProps) {
  const [generellFeil, setGenerellFeil] = useState("");
  const [behandlingEndret, setBehandlingEndret] = useState(false);
  const [sakstype, setSakstype] = useState(fagsak.sakstype?.kode);
  const [behandlingstema, setBehandlingstema] = useState(oppsummering.behandlingstema?.kode);
  const [behandlingstype, setBehandlingstype] = useState(oppsummering.behandlingstype?.kode);
  const [behandlingsfrist, setBehandlingsfrist] = useState(Datoutils.isoStringTilDate(oppsummering.behandlingsfrist));
  const [behandlingsstatus, setBehandlingsstatus] = useState(oppsummering.behandlingsstatus?.kode);
  const [skalViseSpinner, setSkalViseSpinner] = useState(false);

  useEffect(() => {
    if (skalViseModal) {
      const { saksnummer } = fagsak;
      hentMuligeBehandlingstyper_gammel(behandlingID);
      hentMuligeBehandlingstemaer_gammel(behandlingID);
      hentMuligeSakstyper_gammel(saksnummer);
      hentMuligeBehandlingsstatuser(behandlingID);
      setGenerellFeil("");
      setBehandlingEndret(false);
      setSakstype(fagsak.sakstype?.kode);
      setBehandlingstema(oppsummering.behandlingstema?.kode);
      setBehandlingstype(oppsummering.behandlingstype?.kode);
      setBehandlingsstatus(oppsummering.behandlingsstatus?.kode);
      setBehandlingsfrist(Datoutils.isoStringTilDate(oppsummering.behandlingsfrist));
    }
  }, [skalViseModal]);

  const endreBehandlingHandle = () => {
    setSkalViseSpinner(true);
    const reqBehandling: Api.Behandlinger.behandling.EndreBehandlingReqDto = {
      behandlingstema,
      behandlingstype,
      behandlingsfrist: Datoutils.dateTilIsoString(behandlingsfrist) || "",
      behandlingsstatus,
    };
    const { saksnummer } = fagsak;

    Api.Behandlinger.behandling
      .endreBehandling(behandlingID, reqBehandling)
      .then(async () => {
        setBehandlingEndret(true);

        await oppfriskSaksopplysninger(behandlingID);
        if (sakstype === MKV.Koder.sakstyper.TRYGDEAVTALE) await Api.Trygdeavtale.resetFlyt(behandlingID);

        const nyGenerertLink = Routing.lagUrlFraBehandlingstema(saksnummer, behandlingID, behandlingstema);
        if (nyGenerertLink && nyGenerertLink !== location.pathname + location.search) {
          tilAnnenSide(nyGenerertLink);
        } else {
          window.location.reload();
        }
      })
      .catch(() => {
        setGenerellFeil("Oppdateringen feilet!");
      })
      .finally(() => setSkalViseSpinner(false));
  };

  const muligeVerdierPlussValgt = (valgtVerdi: KTObject, muligeVerdier: KTObject[] = []) => {
    return [valgtVerdi].concat(muligeVerdier.filter((verdi) => verdi.kode !== valgtVerdi.kode));
  };

  const viserAlert = behandlingEndret || generellFeil?.length > 0;
  const endringerErBegrenset = erBehandlingstemaMedBegrensetRettigheter(oppsummering.behandlingstema, fagsak.sakstype);

  const renderEndreBehandling = () => {
    return (
      <div className="dialogboks">
        <div>
          <div className="innhold">
            <Mui.KodeTermSelect
              onChange={(e) => setSakstype(e.target.value)}
              label="Sakstype"
              value={sakstype}
              koder={muligeVerdierPlussValgt(fagsak.sakstype, muligeSakstyper_gammel)}
              disableForsteValg
              redigerbart={!endringerErBegrenset}
            />

            <Mui.KodeTermSelect
              onChange={(e) => setBehandlingstema(e.target.value)}
              label="Behandlingstema"
              value={behandlingstema}
              koder={muligeVerdierPlussValgt(oppsummering.behandlingstema, muligeBehandlingstemaer_gammel)}
              disableForsteValg
              redigerbart={!endringerErBegrenset}
            />
            <Mui.KodeTermSelect
              onChange={(e) => setBehandlingstype(e.target.value)}
              label="Behandlingstype"
              value={behandlingstype}
              koder={muligeVerdierPlussValgt(oppsummering.behandlingstype, muligeBehandlingstyper_gammel)}
              disableForsteValg
              redigerbart={!endringerErBegrenset}
            />
            <Datovelger onChange={setBehandlingsfrist} label="Frist" value={behandlingsfrist} />
            <Mui.KodeTermSelect
              onChange={(e) => setBehandlingsstatus(e.target.value)}
              label="Behandlingsstatus"
              value={behandlingsstatus}
              koder={muligeVerdierPlussValgt(oppsummering.behandlingsstatus, muligeBehandlingsstatuser)}
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
      return <StandardMeldingOverst type="feil" actionEtterSynlighet={lukkModal} melding={generellFeil} />;
    }
    if (behandlingEndret) {
      return (
        <StandardMeldingOverst type="suksess" actionEtterSynlighet={lukkModal} melding="Behandlingen er oppdatert" />
      );
    }
    return skalViseSpinner ? null : renderEndreBehandling();
  };

  return (
    <Nav.Modal
      className={classNames("modalEndreBehandling", { alert: viserAlert, skjulBakgrunn: skalViseSpinner })}
      contentLabel="Endre behandling"
      isOpen={skalViseModal || skalViseSpinner}
      onRequestClose={lukkModal}
      closeButton={!viserAlert && !skalViseSpinner}
      shouldCloseOnOverlayClick={viserAlert}
    >
      {skalViseSpinner && <Spinner />}
      {renderInnhold()}
    </Nav.Modal>
  );
}

export default withRouter(connector(EndreBehandlingModal));
