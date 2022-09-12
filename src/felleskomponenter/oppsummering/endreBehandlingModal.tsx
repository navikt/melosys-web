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
import { fagsakOperations, fagsakSelectors } from "../../ducks/fagsaker";
import { saksopplysningerOperations } from "../../ducks/saksopplysninger";
import { useFeatureToggle } from "../../featuretoggle";
import { erBehandlingstemaMedBegrensetRettigheter } from "../../melosyskodeverk/kodekombinasjoner";
import { behandlingstypeOperations, behandlingstypeSelectors } from "../../ducks/behandlingstype";
import { behandlingstemaOperations, behandlingstemaSelectors } from "../../ducks/behandlingstema";
import { SakFormData } from "../skjema/formdatahjelper/nullstillsak";

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
  hentBehandling: (behandlingID: number) => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentFagsak: (saksnummer: string) => dispatch(fagsakOperations.hent(saksnummer)),
  hentBehandlingsgrunnlag: (behandlingID: number) => dispatch(behandlingsgrunnlagOperations.hent(behandlingID)),
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
  hentBehandling,
  hentBehandlingsgrunnlag,
  hentFagsak,
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
  const [sakstema, setSakstema] = useState(fagsak.sakstema?.kode);
  const [sakstype, setSakstype] = useState(fagsak.sakstype?.kode);
  const [behandlingstema, setBehandlingstema] = useState(oppsummering.behandlingstema?.kode);
  const [behandlingstype, setBehandlingstype] = useState(oppsummering.behandlingstype?.kode);
  const [behandlingsfrist, setBehandlingsfrist] = useState(Datoutils.isoStringTilDate(oppsummering.behandlingsfrist));
  const [behandlingsstatus, setBehandlingsstatus] = useState(oppsummering.behandlingsstatus?.kode);

  const [muligeSakstyper] = useState([]);
  const [muligeSakstemaer, setMuligeSakstemaer] = useState([]);
  const [muligeBehandlingstemaer, setMuligeBehandlingstemaer] = useState([]);
  const [muligeBehandlingstyper, setMuligeBehandlingstyper] = useState([]);

  const sakstemaToggle = useFeatureToggle("melosys.sakstema");

  useEffect(() => {
    if (sakstemaToggle !== "enabled") return;
    if (sakstype) {
      Api.LovligeKombinasjoner.hentSakstemaer(MKV.Koder.aktoersroller.BRUKER, sakstype).then((alleMuligesakstemaer) => {
        setMuligeSakstemaer(alleMuligesakstemaer);
      });
    }
  }, [sakstemaToggle, sakstype]);

  useEffect(() => {
    if (sakstemaToggle !== "enabled") return;
    if (sakstema && sakstype) {
      Api.LovligeKombinasjoner.hentBehandlingstemaer(MKV.Koder.aktoersroller.BRUKER, sakstype, sakstema).then(
        (alleMuligeBehandlingstemaer) => {
          setMuligeBehandlingstemaer(alleMuligeBehandlingstemaer);
        }
      );
    }
  }, [sakstemaToggle, sakstema, sakstype]);

  useEffect(() => {
    if (sakstemaToggle !== "enabled") return;
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
  }, [sakstemaToggle, sakstype, sakstema, behandlingstema]);

  useEffect(() => {
    if (skalViseModal) {
      const { saksnummer } = fagsak;
      hentMuligeBehandlingstyper_gammel(behandlingID);
      hentMuligeBehandlingstemaer_gammel(behandlingID);
      hentMuligeSakstyper_gammel(saksnummer);
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

  const nullstillSak = (steg: SakFormData): void => {
    switch (steg) {
      case SakFormData.sakstype:
        setSakstema("");
        setBehandlingstema("");
        setBehandlingstype("");
        break;
      case SakFormData.sakstema:
        setBehandlingstema("");
        setBehandlingstype("");
        break;
      case SakFormData.behandlingstema:
        setBehandlingstype("");
        break;
      case SakFormData.behandlingstype:
        break;
      default:
        break;
    }
  };

  const renderEndreBehandling = () => {
    return (
      <div className="dialogboks">
        <div>
          <div className="innhold">
            <Mui.KodeTermSelect
              onChange={(e) => {
                setSakstype(e.target.value);
                nullstillSak(SakFormData.sakstype);
              }}
              label="Sakstype"
              value={sakstype}
              koder={muligeVerdierPlussValgt(
                fagsak.sakstype,
                sakstemaToggle === "enabled" ? muligeSakstyper : muligeSakstyper_gammel
              )}
              disableForsteValg
              redigerbart={!endringerErBegrenset}
            />
            {sakstemaToggle === "enabled" && (
              <Mui.KodeTermSelect
                onChange={(e) => {
                  setSakstema(e.target.value);
                  nullstillSak(SakFormData.sakstema);
                }}
                label="Sakstema"
                value={sakstema}
                koder={muligeVerdierPlussValgt(fagsak.sakstema, muligeSakstemaer)}
                disableForsteValg
                redigerbart={!endringerErBegrenset}
              />
            )}
            <Mui.KodeTermSelect
              onChange={(e) => {
                setBehandlingstema(e.target.value);
                nullstillSak(SakFormData.behandlingstema);
              }}
              label="Behandlingstema"
              value={behandlingstema}
              koder={muligeVerdierPlussValgt(
                oppsummering.behandlingstema,
                sakstemaToggle === "enabled" ? muligeBehandlingstemaer : muligeBehandlingstemaer_gammel
              )}
              disableForsteValg
              redigerbart={!endringerErBegrenset}
            />
            <Mui.KodeTermSelect
              onChange={(e) => setBehandlingstype(e.target.value)}
              label="Behandlingstype"
              value={behandlingstype}
              koder={muligeVerdierPlussValgt(
                oppsummering.behandlingstype,
                sakstemaToggle === "enabled" ? muligeBehandlingstyper : muligeBehandlingstyper_gammel
              )}
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
