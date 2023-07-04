import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import classNames from "classnames";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV, { MKVUtils } from "../../melosyskodeverk";
import * as Mui from "../ui";
import * as Api from "../../services/api";
import * as Nav from "../../navFrontend";
import * as Routing from "../../routing";
import * as Datoutils from "../../utils/dato";

import { behandlingsstatusOperations, behandlingsstatusSelectors } from "../../ducks/behandlingsstatus";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { navigeringOperations } from "../../ducks/navigering";
import { anmodningsperioderSelectors } from "../../ducks/anmodningsperioder";
import { useFeatureToggle } from "../../featuretoggle";
import Datovelger from "../datovelger";
import Knapperad from "../knapperad";
import { StandardMeldingOverst } from "../alertmeldinger";
import { Spinner } from "../spinner";

import "./endreBehandlingModal.css";
import {
  MELOSYS_FOLKETRYGDEN_MVP,
  MELOSYS_IKKEYRKESAKTIV_FORENKLETFLYT,
  MELOSYS_REGISTRERING_UNNTAK_FRA_MEDLEMSKAP,
} from "../../featuretoggle/toggleNavn";

enum FeltVerdier {
  sakstype = "sakstype",
  sakstema = "sakstema",
  behandlingstema = "behandlingstema",
  behandlingstype = "behandlingstype",
}

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  muligeBehandlingsstatuser: behandlingsstatusSelectors.MuligeBehandlingsstatusSelector(state),
  anmodningsperioderSendtTilUtlandet: anmodningsperioderSelectors.AnmodningsperioderErSendtUtlandetSelector(state),
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
    mottattDato?: string;
    skalViseModal: boolean;
    lukkModal: () => void;
  };

function EndreBehandlingModal({
  skalViseModal,
  lukkModal,
  behandlingID,
  oppsummering,
  fagsak,
  mottattDato,
  muligeBehandlingsstatuser,
  hentMuligeBehandlingsstatuser,
  tilAnnenSide,
  location,
  anmodningsperioderSendtTilUtlandet,
}: EndreBehandlingModalProps) {
  const [generellFeil, setGenerellFeil] = useState("");
  const [behandlingEndret, setBehandlingEndret] = useState(false);
  const [sakstype, setSakstype] = useState(fagsak.sakstype?.kode);
  const [sakstema, setSakstema] = useState(fagsak.sakstema?.kode);
  const [behandlingstema, setBehandlingstema] = useState(oppsummering.behandlingstema?.kode);
  const [behandlingstype, setBehandlingstype] = useState(oppsummering.behandlingstype?.kode);
  const [mottaksdato, setMottaksdato] = useState(Datoutils.isoStringTilDate(mottattDato));
  const [behandlingsstatus, setBehandlingsstatus] = useState(oppsummering.behandlingsstatus?.kode);
  const [skalViseSpinner, setSkalViseSpinner] = useState(false);
  const [skalViseFeilmeldinger, setSkalViseFeilmeldinger] = useState(false);
  const [muligeSakstyper, setMuligeSakstyper] = useState([]);
  const [muligeSakstemaer, setMuligeSakstemaer] = useState([]);
  const [muligeBehandlingstemaer, setMuligeBehandlingstemaer] = useState([]);
  const [muligeBehandlingstyper, setMuligeBehandlingstyper] = useState([]);
  const folketrygdenToggleEnabled = useFeatureToggle(MELOSYS_FOLKETRYGDEN_MVP);
  const ikkeYrkesaktivFlytToggleEnabled = useFeatureToggle(MELOSYS_IKKEYRKESAKTIV_FORENKLETFLYT);
  const registreringUnntakFraMedlemskapToggleEnabled = useFeatureToggle(MELOSYS_REGISTRERING_UNNTAK_FRA_MEDLEMSKAP);
  const typeTemaKanEndres = !anmodningsperioderSendtTilUtlandet;
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
      Api.LovligeKombinasjoner.hentBehandlingstyper(
        fagsak.hovedpartRolle,
        sakstype,
        sakstema,
        behandlingstema,
        behandlingID
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
      setSkalViseFeilmeldinger(false);
      setSakstype(fagsak.sakstype?.kode);
      setSakstema(fagsak.sakstema?.kode);
      setBehandlingstema(oppsummering.behandlingstema?.kode);
      setBehandlingstype(oppsummering.behandlingstype?.kode);
      setBehandlingsstatus(oppsummering.behandlingsstatus?.kode);
      setMottaksdato(Datoutils.isoStringTilDate(mottattDato));
    }
  }, [skalViseModal]);

  const håndterTrygdeavtaleFlyt = async (gammelSakstype: string) => {
    if (gammelSakstype !== MKV.Koder.sakstyper.TRYGDEAVTALE) return;

    if (
      sakstype !== MKV.Koder.sakstyper.TRYGDEAVTALE ||
      Routing.skalViseTomFlyt(
        sakstype,
        sakstema,
        behandlingstema,
        behandlingstype,
        folketrygdenToggleEnabled,
        ikkeYrkesaktivFlytToggleEnabled,
        registreringUnntakFraMedlemskapToggleEnabled
      )
    ) {
      await Api.Trygdeavtale.slettFlyt(behandlingID);
    } else {
      await Api.Trygdeavtale.oppfriskFlyt(behandlingID);
    }
  };

  const harMottaksdatoEndretSeg = () => Datoutils.isoStringTilDate(mottattDato)?.getTime() !== mottaksdato?.getTime();

  const sakstypeFeilmelding = !sakstype ? "Du må velge sakstype" : null;
  const sakstemaFeilmelding = !sakstema ? "Du må velge sakstema" : null;
  const behandlingstemaFeilmelding = !behandlingstema ? "Du må velge behandlingstema" : null;
  const behandlingstypeFeilmelding = !behandlingstype ? "Du må velge behandlingstype" : null;
  const behandlingsstatusFeilmelding = !behandlingsstatus ? "Du må velge behandlingsstatus" : null;
  const alleFeilmeldinger = [
    sakstypeFeilmelding,
    sakstemaFeilmelding,
    behandlingstemaFeilmelding,
    behandlingstypeFeilmelding,
    behandlingsstatusFeilmelding,
  ].filter((feilmelding) => feilmelding !== null);

  useEffect(() => {
    if (alleFeilmeldinger.length === 0) {
      setSkalViseFeilmeldinger(false);
    }
  }, [alleFeilmeldinger]);

  const endreBehandlingHandle = () => {
    if (alleFeilmeldinger.length > 0) {
      setSkalViseFeilmeldinger(true);
      return;
    }

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
      mottaksdato: harMottaksdatoEndretSeg() ? Datoutils.dateTilIsoString(mottaksdato) : null,
      behandlingsstatus,
    };

    Api.Fagsaker.fagsak
      .endreFagsak(saksnummer, reqFagsak)
      .then(async () => {
        setBehandlingEndret(true);

        await håndterTrygdeavtaleFlyt(forrigeSakstype);

        const nyGenerertLink = Routing.lagUrl(
          saksnummer,
          behandlingID,
          sakstype,
          sakstema,
          behandlingstema,
          behandlingstype,
          folketrygdenToggleEnabled,
          ikkeYrkesaktivFlytToggleEnabled,
          registreringUnntakFraMedlemskapToggleEnabled
        );

        if (nyGenerertLink && nyGenerertLink !== location.pathname + location.search) {
          tilAnnenSide(nyGenerertLink);
        }
        window.location.reload();
      })
      .catch(() => {
        setGenerellFeil("Oppdateringen feilet!");
      })
      .finally(() => setSkalViseSpinner(false));
  };

  const viserAlert = behandlingEndret || generellFeil?.length > 0;
  const endringerErBegrenset = MKVUtils.erBehandlingAvSed(fagsak.sakstype?.kode, oppsummering.behandlingstema?.kode);

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
            {!fagsakKanEndres && typeTemaKanEndres && (
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
              koder={fagsakKanEndres ? muligeSakstyper : [fagsak.sakstype]}
              redigerbart={!endringerErBegrenset && typeTemaKanEndres && fagsakKanEndres}
              feil={skalViseFeilmeldinger ? sakstypeFeilmelding : null}
              disableForsteValg
            />
            <Mui.KodeTermSelect
              onChange={(e) => {
                setSakstema(e.target.value);
                nullstillSak(FeltVerdier.sakstema);
              }}
              label="Sakstema"
              value={sakstema}
              koder={fagsakKanEndres ? muligeSakstemaer : [fagsak.sakstema]}
              redigerbart={!endringerErBegrenset && typeTemaKanEndres && fagsakKanEndres}
              feil={skalViseFeilmeldinger ? sakstemaFeilmelding : null}
              disableForsteValg
            />
            <Mui.KodeTermSelect
              onChange={(e) => {
                setBehandlingstema(e.target.value);
                nullstillSak(FeltVerdier.behandlingstema);
              }}
              label="Behandlingstema"
              value={behandlingstema}
              koder={muligeBehandlingstemaer}
              redigerbart={!endringerErBegrenset && typeTemaKanEndres}
              feil={skalViseFeilmeldinger ? behandlingstemaFeilmelding : null}
              disableForsteValg
            />
            <Mui.KodeTermSelect
              onChange={(e) => setBehandlingstype(e.target.value)}
              label="Behandlingstype"
              value={behandlingstype}
              koder={muligeBehandlingstyper}
              redigerbart={!endringerErBegrenset && typeTemaKanEndres}
              feil={skalViseFeilmeldinger ? behandlingstypeFeilmelding : null}
              disableForsteValg
            />
            <Datovelger
              onChange={setMottaksdato}
              label={<Nav.Typo.Element>Mottaksdato</Nav.Typo.Element>}
              value={mottaksdato}
            />
            <Mui.KodeTermSelect
              onChange={(e) => setBehandlingsstatus(e.target.value)}
              label="Behandlingsstatus"
              value={behandlingsstatus}
              koder={muligeVerdierPlussGjeldende(oppsummering.behandlingsstatus, muligeBehandlingsstatuser)}
              feil={skalViseFeilmeldinger ? behandlingsstatusFeilmelding : null}
              disableForsteValg
            />

            {skalViseFeilmeldinger && (
              <Nav.AlertStripeFeil>
                <Nav.Typo.Normaltekst>Følgende feil ble funnet</Nav.Typo.Normaltekst>
                <ul className="feilmeldingliste">
                  {alleFeilmeldinger.map((feilmelding) => (
                    <li key={feilmelding}>{feilmelding}</li>
                  ))}
                </ul>
              </Nav.AlertStripeFeil>
            )}
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

  const muligeVerdierPlussGjeldende = (valgtVerdi: KTObject, muligeVerdier: KTObject[] = []) => {
    return [valgtVerdi].concat(muligeVerdier.filter((verdi) => verdi.kode !== valgtVerdi.kode));
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
