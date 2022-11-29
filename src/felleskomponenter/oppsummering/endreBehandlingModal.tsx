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
import { navigeringOperations } from "../../ducks/navigering";

import { erBehandlingstemaMedBegrensetRettigheter } from "../../melosyskodeverk/kodekombinasjoner";
import { useFeatureToggle } from "../../featuretoggle";
import Datovelger from "../datovelger";
import Knapperad from "../knapperad";
import { StandardMeldingOverst } from "../alertmeldinger";
import { Spinner } from "../spinner";

import "./endreBehandlingModal.css";

enum FeltVerdier {
  sakstype = "sakstype",
  sakstema = "sakstema",
  behandlingstema = "behandlingstema",
  behandlingstype = "behandlingstype",
}

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  muligeBehandlingsstatuser: behandlingsstatusSelectors.MuligeBehandlingsstatusSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
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
  muligeBehandlingsstatuser,
  hentMuligeBehandlingsstatuser,
  tilAnnenSide,
  location,
}: EndreBehandlingModalProps) {
  const [generellFeil, setGenerellFeil] = useState("");
  const [behandlingEndret, setBehandlingEndret] = useState(false);
  const [sakstype, setSakstype] = useState(fagsak.sakstype?.kode);
  const [sakstema, setSakstema] = useState(fagsak.sakstema?.kode);
  const [behandlingstema, setBehandlingstema] = useState(oppsummering.behandlingstema?.kode);
  const [behandlingstype, setBehandlingstype] = useState(oppsummering.behandlingstype?.kode);
  const [behandlingsfrist, setBehandlingsfrist] = useState(Datoutils.isoStringTilDate(oppsummering.behandlingsfrist));
  const [behandlingsstatus, setBehandlingsstatus] = useState(oppsummering.behandlingsstatus?.kode);
  const [skalViseSpinner, setSkalViseSpinner] = useState(false);
  const [muligeSakstyper, setMuligeSakstyper] = useState([]);
  const [muligeSakstemaer, setMuligeSakstemaer] = useState([]);
  const [muligeBehandlingstemaer, setMuligeBehandlingstemaer] = useState([]);
  const [muligeBehandlingstyper, setMuligeBehandlingstyper] = useState([]);
  const folketrygdenToggleEnabled = useFeatureToggle("melosys.folketrygden.mvp") === "enabled";
  const kanEndre = useFeatureToggle("melosys.behandle_alle_saker.ikke_endre") !== "enabled";
  const fagsakKanEndres = muligeSakstyper.length !== 0 || muligeSakstemaer.length !== 0;

  useEffect(() => {
    Api.LovligeKombinasjoner.hentSakstyper(fagsak.saksnummer).then((alleMuligeSakstyper) => {
      setMuligeSakstyper(alleMuligeSakstyper);
    });
  }, []);

  useEffect(() => {
    if (sakstype) {
      Api.LovligeKombinasjoner.hentSakstemaer(fagsak.hovedpartRolle, sakstype, fagsak.saksnummer).then(
        (alleMuligeSakstemaer) => {
          setMuligeSakstemaer(alleMuligeSakstemaer);
        }
      );
    }
  }, [sakstype]);

  useEffect(() => {
    if (sakstype && sakstema) {
      Api.LovligeKombinasjoner.hentBehandlingstemaer(fagsak.hovedpartRolle, sakstype, sakstema).then(
        (alleMuligeBehandlingstemaer) => {
          setMuligeBehandlingstemaer(alleMuligeBehandlingstemaer);
        }
      );
    }
  }, [sakstype, sakstema]);

  useEffect(() => {
    if (sakstype && sakstema && behandlingstema) {
      Api.LovligeKombinasjoner.hentBehandlingstyper(fagsak.hovedpartRolle, sakstype, sakstema, behandlingstema).then(
        (alleMuligeBehandlingstyper) => {
          setMuligeBehandlingstyper(alleMuligeBehandlingstyper);
        }
      );
    }
  }, [sakstype, sakstema, behandlingstema]);

  useEffect(() => {
    if (skalViseModal) {
      hentMuligeBehandlingsstatuser(behandlingID);
      setGenerellFeil("");
      setBehandlingEndret(false);
      setSakstype(fagsak.sakstype?.kode);
      setSakstema(fagsak.sakstema?.kode);
      setBehandlingstema(oppsummering.behandlingstema?.kode);
      setBehandlingstype(oppsummering.behandlingstype?.kode);
      setBehandlingsstatus(oppsummering.behandlingsstatus?.kode);
      setBehandlingsfrist(Datoutils.isoStringTilDate(oppsummering.behandlingsfrist));
    }
  }, [skalViseModal]);

  const endreBehandlingHandle = () => {
    setSkalViseSpinner(true);
    const {
      saksnummer,
      sakstype: { kode: forrigeSakstype },
    } = fagsak;

    const reqFagsak: Api.Fagsaker.fagsak.EndreSakDto = {
      sakstype,
      sakstema,
      behandlingstema,
      behandlingstype,
      behandlingsfrist: Datoutils.dateTilIsoString(behandlingsfrist),
      behandlingsstatus,
    };

    Api.Fagsaker.fagsak
      .endreFagsak(saksnummer, reqFagsak)
      .then(async () => {
        setBehandlingEndret(true);

        if (
          forrigeSakstype === MKV.Koder.sakstyper.TRYGDEAVTALE &&
          !Routing.skalViseTomFlyt(sakstype, sakstema, behandlingstema, behandlingstype, folketrygdenToggleEnabled)
        )
          await Api.Trygdeavtale.resetFlyt(behandlingID);

        const nyGenerertLink = Routing.lagUrl(
          saksnummer,
          behandlingID,
          sakstype,
          sakstema,
          behandlingstema,
          behandlingstype,
          folketrygdenToggleEnabled
        );

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

  const nullstillSak = (steg: FeltVerdier): void => {
    switch (steg) {
      case FeltVerdier.sakstype:
        setSakstema("");
        setBehandlingstema("");
        setBehandlingstype("");
        break;
      case FeltVerdier.sakstema:
        setBehandlingstema("");
        setBehandlingstype("");
        break;
      case FeltVerdier.behandlingstema:
        setBehandlingstype("");
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
            {!fagsakKanEndres && kanEndre && (
              <Nav.AlertStripeInfo className="infomelding">
                Du kan bare endre sakstype og -tema i den første behandlingen i saken
              </Nav.AlertStripeInfo>
            )}
            <Mui.KodeTermSelect
              onChange={(e) => {
                setSakstype(e.target.value);
                nullstillSak(FeltVerdier.sakstype);
              }}
              label="Sakstype"
              value={sakstype}
              koder={muligeVerdierPlussValgt(fagsak.sakstype, muligeSakstyper)}
              disableForsteValg
              redigerbart={!endringerErBegrenset && kanEndre && fagsakKanEndres}
            />
            <Mui.KodeTermSelect
              onChange={(e) => {
                setSakstema(e.target.value);
                nullstillSak(FeltVerdier.sakstema);
              }}
              label="Sakstema"
              value={sakstema}
              koder={muligeVerdierPlussValgt(fagsak.sakstema, muligeSakstemaer)}
              disableForsteValg
              redigerbart={!endringerErBegrenset && kanEndre && fagsakKanEndres}
            />
            <Mui.KodeTermSelect
              onChange={(e) => {
                setBehandlingstema(e.target.value);
                nullstillSak(FeltVerdier.behandlingstema);
              }}
              label="Behandlingstema"
              value={behandlingstema}
              koder={muligeBehandlingstemaer}
              disableForsteValg
              redigerbart={!endringerErBegrenset && kanEndre}
            />
            <Mui.KodeTermSelect
              onChange={(e) => setBehandlingstype(e.target.value)}
              label="Behandlingstype"
              value={behandlingstype}
              koder={muligeVerdierPlussValgt(oppsummering.behandlingstype, muligeBehandlingstyper)}
              disableForsteValg
              redigerbart={!endringerErBegrenset && kanEndre}
            />
            <Datovelger onChange={setBehandlingsfrist} label="Frist" value={behandlingsfrist} />
            <Mui.KodeTermSelect
              onChange={(e) => setBehandlingsstatus(e.target.value)}
              label="Behandlingsstatus"
              value={behandlingsstatus}
              koder={muligeBehandlingsstatuser}
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
