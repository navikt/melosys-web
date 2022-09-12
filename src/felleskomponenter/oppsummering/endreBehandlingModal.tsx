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
import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { behandlingsgrunnlagOperations } from "../../ducks/behandlingsgrunnlag";
import { navigeringOperations } from "../../ducks/navigering";
import Datovelger from "../datovelger";
import Knapperad from "../knapperad";

import "./endreBehandlingModal.css";
import { fagsakOperations } from "../../ducks/fagsaker";
import { saksopplysningerOperations } from "../../ducks/saksopplysninger";
import { useFeatureToggle } from "../../featuretoggle";
import { erBehandlingstemaMedBegrensetRettigheter } from "../../melosyskodeverk/kodekombinasjoner";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  muligeBehandlingsstatuser: behandlingsstatusSelectors.MuligeBehandlingsstatusSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppfriskSaksopplysninger: (behandlingID: number) => saksopplysningerOperations.oppfrisk(behandlingID),
  hentBehandling: (behandlingID: number) => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentFagsak: (saksnummer: string) => dispatch(fagsakOperations.hent(saksnummer)),
  hentBehandlingsgrunnlag: (behandlingID: number) => dispatch(behandlingsgrunnlagOperations.hent(behandlingID)),
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
  hentBehandling,
  hentBehandlingsgrunnlag,
  hentFagsak,
  muligeBehandlingsstatuser,
  hentMuligeBehandlingsstatuser,
  tilAnnenSide,
  location,
  oppfriskSaksopplysninger,
}: EndreBehandlingModalProps) {
  const [generellFeil, setGenerellFeil] = useState("");
  const [behandlingEndret, setBehandlingEndret] = useState(false);
  const [sakstema, setSakstema] = useState(fagsak.sakstema?.kode);
  const [sakstype, setSakstype] = useState(fagsak.sakstype?.kode);
  const [behandlingstema, setBehandlingstema] = useState(oppsummering.behandlingstema?.kode);
  const [behandlingstype, setBehandlingstype] = useState(oppsummering.behandlingstype?.kode);
  const [behandlingsfrist, setBehandlingsfrist] = useState(Datoutils.isoStringTilDate(oppsummering.behandlingsfrist));
  const [behandlingsstatus, setBehandlingsstatus] = useState(oppsummering.behandlingsstatus?.kode);

  const [muligeSakstemaer, setMuligeSakstemaer] = useState([]);
  const [muligeBehandlingstemaer, setMuligeBehandlingstemaer] = useState([]);
  const [muligeBehandlingstyper, setMuligeBehandlingstyper] = useState([]);

  const sakstemaToggle = useFeatureToggle("melosys.sakstema");

  useEffect(() => {
    if (sakstype) {
      Api.LovligeKombinasjoner.hentSakstemaer(MKV.Koder.aktoersroller.BRUKER, sakstype).then((alleMuligesakstemaer) => {
        setMuligeSakstemaer(alleMuligesakstemaer);
      });
    }
  }, [sakstype]);

  useEffect(() => {
    if (sakstema && sakstype) {
      Api.LovligeKombinasjoner.hentBehandlingstemaer(MKV.Koder.aktoersroller.BRUKER, sakstype, sakstema).then(
        (alleMuligeBehandlingstemaer) => {
          setMuligeBehandlingstemaer(alleMuligeBehandlingstemaer);
        }
      );
    }
  }, [sakstema, sakstype]);

  useEffect(() => {
    if (sakstema && sakstype && behandlingstema) {
      Api.LovligeKombinasjoner.hentBehandlingstyper(
        MKV.Koder.aktoersroller.BRUKER,
        sakstype,
        sakstema,
        behandlingstema
      ).then((alleMuligeBehandlingstyper) => {
        setMuligeBehandlingstyper(alleMuligeBehandlingstyper);
      });
    }
  }, [sakstype, sakstema, behandlingstema]);

  useEffect(() => {
    if (skalViseModal) {
      hentMuligeBehandlingsstatuser(behandlingID);
      setGenerellFeil("");
      setBehandlingEndret(false);
      setSakstema(fagsak.sakstema?.kode);
      setSakstype(fagsak.sakstype?.kode);
      setBehandlingstema(oppsummering.behandlingstema?.kode);
      setBehandlingstype(oppsummering.behandlingstype?.kode);
      setBehandlingsstatus(oppsummering.behandlingsstatus?.kode);
      setBehandlingsfrist(Datoutils.isoStringTilDate(oppsummering.behandlingsfrist));
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
      .then(async () => {
        setBehandlingEndret(true);
        hentBehandling(behandlingID);
        hentFagsak(saksnummer);
        hentBehandlingsgrunnlag(behandlingID);
        const nyLink =
          sakstemaToggle === "enabled"
            ? Routing.lagUrl(saksnummer, behandlingID, sakstype, behandlingstema, behandlingstype)
            : Routing.lagUrlFraBehandlingstema(saksnummer, behandlingID, behandlingstema);
        if (nyLink && nyLink !== location.pathname + location.search) tilAnnenSide(nyLink);
        setTimeout(lukkModal, 2000);
        nullstillFlyt();
      })
      .catch(() => {
        setGenerellFeil(
          "Behandling ble ikke endret og oppdatert. Prøv igjen, eller se driftsmeldinger for mer informasjon"
        );
        setTimeout(lukkModal, 5000);
      });
  };

  const nullstillFlyt = async () => {
    await oppfriskSaksopplysninger(behandlingID);
    await Api.Trygdeavtale.resetFlyt(behandlingID);
    window.location.reload();
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
              koder={muligeVerdierPlussValgt(fagsak.sakstype, [])}
              disableForsteValg
              redigerbart={!endringerErBegrenset}
            />
            {sakstemaToggle === "enabled" && (
              <Mui.KodeTermSelect
                onChange={(e) => setSakstema(e.target.value)}
                label="Sakstema"
                value={sakstema}
                koder={muligeVerdierPlussValgt(fagsak.sakstema, muligeSakstemaer)}
                disableForsteValg
                redigerbart={!endringerErBegrenset}
              />
            )}
            <Mui.KodeTermSelect
              onChange={(e) => setBehandlingstema(e.target.value)}
              label="Behandlingstema"
              value={behandlingstema}
              koder={muligeVerdierPlussValgt(oppsummering.behandlingstema, muligeBehandlingstemaer)}
              disableForsteValg
              redigerbart={!endringerErBegrenset}
            />
            <Mui.KodeTermSelect
              onChange={(e) => setBehandlingstype(e.target.value)}
              label="Behandlingstype"
              value={behandlingstype}
              koder={muligeVerdierPlussValgt(oppsummering.behandlingstype, muligeBehandlingstyper)}
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
