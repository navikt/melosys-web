import React, { useEffect, useState } from "react";
import { connect, ConnectedProps, useSelector } from "react-redux";
import classNames from "classnames";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { KTObject } from "@navikt/melosys-kodeverk";
import { RouteComponentProps, withRouter } from "react-router-dom";

import * as Mui from "../ui";
import * as KV from "../../kodeverk";
import * as Api from "../../services/api";
import * as Nav from "../../navFrontend";
import * as Routing from "../../routing";
import * as Datoutils from "../../utils/dato";

import { behandlingsstatusOperations, behandlingsstatusSelectors } from "../../ducks/behandlingsstatus";
import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { behandlingsgrunnlagOperations } from "../../ducks/behandlingsgrunnlag";
import { behandlingstemaOperations, behandlingstemaSelectors } from "../../ducks/behandlingstema";
import { behandlingstypeOperations, behandlingstypeSelectors } from "../../ducks/behandlingstype";
import { navigeringOperations } from "../../ducks/navigering";
import Datovelger from "../datovelger";
import Knapperad from "../knapperad";
import MKV from "../../melosyskodeverk";

import "./endreBehandlingModal.css";
import { fagsakOperations } from "../../ducks/fagsaker";
import { saksopplysningerOperations } from "../../ducks/saksopplysninger";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  muligeBehandlingstyper: behandlingstypeSelectors.MuligeBehandlingstyperSelector(state),
  muligeBehandlingstema: behandlingstemaSelectors.MuligeBehandlingstemaSelector(state),
  muligeBehandlingsstatuser: behandlingsstatusSelectors.MuligeBehandlingsstatusSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppfriskSaksopplysninger: (behandlingID: number) => saksopplysningerOperations.oppfrisk(behandlingID),
  hentBehandling: (behandlingID: number) => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentBehandlingsgrunnlag: (behandlingID: number) => dispatch(behandlingsgrunnlagOperations.hent(behandlingID)),
  hentMuligeBehandlingstema: (behandlingID: number) =>
    dispatch(behandlingstemaOperations.hentMuligeBehandlingstema(behandlingID)),
  hentMuligeSakstema: (saksnummer: string) => dispatch(fagsakOperations.hentMuligeSakstema(saksnummer)),
  hentMuligeSakstype: (saksnummer: string) => dispatch(fagsakOperations.hentMuligeSakstype(saksnummer)),
  hentMuligeBehandlingstyper: (behandlingID: number) =>
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

const {
  REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
  REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
  BESLUTNING_LOVVALG_NORGE,
  BESLUTNING_LOVVALG_ANNET_LAND,
  ANMODNING_OM_UNNTAK_HOVEDREGEL,
} = MKV.Koder.behandlinger.behandlingstema;

const behandlingsTemaMedBegrensetRettigheter = [
  REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
  REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
  BESLUTNING_LOVVALG_NORGE,
  BESLUTNING_LOVVALG_ANNET_LAND,
  ANMODNING_OM_UNNTAK_HOVEDREGEL,
];

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
  hentMuligeSakstema,
  hentMuligeSakstype,
  hentMuligeBehandlingsstatuser,
  tilAnnenSide,
  location,
  oppfriskSaksopplysninger,
}: EndreBehandlingModalProps) {
  const [generellFeil, setGenerellFeil] = useState("");
  const [behandlingEndret, setBehandlingEndret] = useState(false);
  const [sakstema, setSakstema] = useState(KV.objektTilKodeUtenFeilmelding(oppsummering.sakstema));
  const [sakstype, setSakstype] = useState(KV.objektTilKodeUtenFeilmelding(oppsummering.sakstype));
  const [behandlingstema, setBehandlingstema] = useState(KV.objektTilKodeUtenFeilmelding(oppsummering.behandlingstema));
  const [behandlingstype, setBehandlingstype] = useState(KV.objektTilKodeUtenFeilmelding(oppsummering.behandlingstype));
  const [behandlingsfrist, setBehandlingsfrist] = useState(Datoutils.isoStringTilDate(oppsummering.behandlingsfrist));
  const [behandlingsstatus, setBehandlingsstatus] = useState(
    KV.objektTilKodeUtenFeilmelding(oppsummering.behandlingsstatus)
  );
  const [endringerErBegrenset, setEndringerErBegrenset] = useState(false);
  const { muligeSakstemaer, muligeSakstyper } = useSelector((state: any) => state.fagsaker.data);
  useEffect(() => {
    if (behandlingsTemaMedBegrensetRettigheter.includes(behandlingstema)) {
      setEndringerErBegrenset(true);
    }
  }, [behandlingstema]);

  useEffect(() => {
    if (skalViseModal) {
      const { saksnummer } = fagsak;
      hentMuligeBehandlingstyper(behandlingID);
      hentMuligeBehandlingstema(behandlingID);
      hentMuligeSakstema(saksnummer);
      hentMuligeSakstype(saksnummer);
      hentMuligeBehandlingsstatuser(behandlingID);
      setGenerellFeil("");
      setBehandlingEndret(false);
      setSakstema(KV.objektTilKodeUtenFeilmelding(oppsummering.sakstema));
      setSakstype(KV.objektTilKodeUtenFeilmelding(oppsummering.sakstype));
      setBehandlingstema(KV.objektTilKodeUtenFeilmelding(oppsummering.behandlingstema));
      setBehandlingstype(KV.objektTilKodeUtenFeilmelding(oppsummering.behandlingstype));
      setBehandlingsfrist(Datoutils.isoStringTilDate(oppsummering.behandlingsfrist));
      setBehandlingsstatus(KV.objektTilKodeUtenFeilmelding(oppsummering.behandlingsstatus));
    }
  }, [skalViseModal]);

  const endreBehandlingHandle = () => {
    const reqBehandling: Api.Behandlinger.behandling.EndreBehandlingReqDto = {
      behandlingstema,
      behandlingstype,
      behandlingsfrist: Datoutils.dateTilIsoString(behandlingsfrist) || "",
      behandlingsstatus,
    };

    const reqFagsak: Api.Fagsaker.fagsak.EndreFagsakDto = {
      sakstema,
      sakstype,
    };
    const { saksnummer } = fagsak;

    Promise.all([
      Api.Behandlinger.behandling.endreBehandling(behandlingID, reqBehandling),
      Api.Fagsaker.fagsak.endreFagsak(saksnummer, reqFagsak),
    ])
      .then(() => {
        setBehandlingEndret(true);
        hentBehandling(behandlingID);
        hentBehandlingsgrunnlag(behandlingID);
        const nyLink = Routing.lagUrl(saksnummer, behandlingID, behandlingstema);
        if (nyLink && nyLink !== location.pathname + location.search) tilAnnenSide(nyLink);
        setTimeout(lukkModal, 2000);
      })
      .catch(() => {
        setGenerellFeil(
          "Behandling ble ikke endret og oppdatert. Prøv igjen, eller se driftsmeldinger for mer informasjon"
        );
        setTimeout(lukkModal, 5000);
      })
      .finally(async () => {
        await oppfriskSaksopplysninger(behandlingID);
        window.location.reload();
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
            {muligeSakstyper && (
              <Mui.KodeTermSelect
                onChange={(e) => setSakstype(e.target.value)}
                label="Sakstype"
                value={sakstype}
                koder={muligeVerdierPlussValgt(muligeSakstyper, oppsummering.sakstype)}
                disableForsteValg
                redigerbart={!endringerErBegrenset}
              />
            )}
            {muligeSakstemaer && (
              <Mui.KodeTermSelect
                onChange={(e) => setSakstema(e.target.value)}
                label="Sakstema"
                value={sakstema}
                koder={muligeVerdierPlussValgt(muligeSakstemaer, oppsummering.sakstema)}
                disableForsteValg
                redigerbart={!endringerErBegrenset}
              />
            )}
            <Mui.KodeTermSelect
              onChange={(e) => setBehandlingstype(e.target.value)}
              label="Behandlingstype"
              value={behandlingstype}
              koder={muligeVerdierPlussValgt(muligeBehandlingstyper, oppsummering.behandlingstype)}
              disableForsteValg
              redigerbart={!endringerErBegrenset}
            />
            <Mui.KodeTermSelect
              onChange={(e) => setBehandlingstema(e.target.value)}
              label="Behandlingstema"
              value={behandlingstema}
              koder={muligeVerdierPlussValgt(muligeBehandlingstema, oppsummering.behandlingstema)}
              disableForsteValg
              redigerbart={!endringerErBegrenset}
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

export default withRouter(connector(EndreBehandlingModal));
