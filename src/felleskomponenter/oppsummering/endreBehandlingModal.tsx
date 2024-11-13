import { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV, { MKVUtils } from "../../melosyskodeverk";
import * as Mui from "../ui";
import * as Api from "../../services/api";
import * as Nav from "../../navFrontend";
import * as Routing from "../../url";
import * as Datoutils from "../../utils/dato";

import { behandlingsstatusOperations, behandlingsstatusSelectors } from "../../ducks/behandlingsstatus";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { navigeringOperations } from "../../ducks/navigering";
import { anmodningsperioderSelectors } from "../../ducks/anmodningsperioder";
import Datovelger from "../datovelger";
import Knapperad from "../knapperad";

import "./endreBehandlingModal.css";
import { useAsyncCallbackState } from "../../hooks";
import { useFeatureToggle } from "../../featuretoggle";
import { MELOSYS_ARBEID_KUN_NORGE } from "../../featuretoggle/toggleNavn";

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
    erÅrsavregning?: boolean;
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
  erÅrsavregning,
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
  const [muligeBehandlingstyper, setMuligeBehandlingstyper] = useState<KTObject[]>([]);
  const erArbeidKunNorgeToggleEnabled = useFeatureToggle(MELOSYS_ARBEID_KUN_NORGE);

  const typeTemaKanEndres = !anmodningsperioderSendtTilUtlandet;
  const fagsakKanEndres = muligeSakstyper.length !== 0 || muligeSakstemaer.length !== 0;
  const [{ harBehandlingMedTrygdeavgift }] = useAsyncCallbackState(
    () => Api.Fagsaker.fagsak.hentTrygdeavgiftOppsummering(fagsak.saksnummer),
    { harBehandlingMedTrygdeavgift: false },
    []
  );

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
      Api.LovligeKombinasjoner.hentBehandlingstemaer(fagsak.hovedpartRolle, sakstype, sakstema, behandlingID).then(
        (alleMuligeBehandlingstemaer) => {
          setMuligeBehandlingstemaer(alleMuligeBehandlingstemaer);
        }
      );
    }
  }, [sakstype, sakstema]);

  useEffect(() => {
    if (erÅrsavregning) {
      setBehandlingstype(oppsummering.behandlingstype?.kode);
      setMuligeBehandlingstyper([oppsummering.behandlingstype]);
      return;
    }
    if (sakstype && sakstema && behandlingstema) {
      Api.LovligeKombinasjoner.hentBehandlingstyperForEndring(
        fagsak.hovedpartRolle,
        sakstype,
        sakstema,
        behandlingstema,
        fagsak.saksnummer
      ).then((alleMuligeBehandlingstyper) => {
        setMuligeBehandlingstyper(alleMuligeBehandlingstyper);
      });
    }
  }, [sakstype, sakstema, behandlingstema, erÅrsavregning]);

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
      Routing.skalViseIngenFlyt(sakstype, sakstema, behandlingstema, behandlingstype, erArbeidKunNorgeToggleEnabled)
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

    setGenerellFeil("");
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
          erArbeidKunNorgeToggleEnabled
        );

        if (nyGenerertLink && nyGenerertLink !== location.pathname + location.search) {
          tilAnnenSide(nyGenerertLink);
        }
        window.location.reload();
      })
      .catch(() => {
        setGenerellFeil("Oppdateringen feilet!");
        setBehandlingEndret(false);
      })
      .finally(() => setSkalViseSpinner(false));
  };

  const erBehandlingAvSed = MKVUtils.erBehandlingAvSed(fagsak.sakstype?.kode, oppsummering.behandlingstema?.kode);

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

  const muligeVerdierPlussGjeldende = (valgtVerdi: KTObject, muligeVerdier: KTObject[] = []) => {
    return [valgtVerdi].concat(muligeVerdier.filter((verdi) => verdi.kode !== valgtVerdi.kode));
  };

  return (
    <Nav.Modal width={550} className="modalEndreBehandling" onClose={lukkModal} open={skalViseModal} header={undefined}>
      <Nav.Modal.Body>
        {!fagsakKanEndres && typeTemaKanEndres && (
          <Nav.Alert variant="info" className="infomelding">
            Du kan bare endre sakstype og -tema i den første behandlingen i saken
          </Nav.Alert>
        )}
        <Mui.KodeTermSelect
          onChange={(e) => {
            setSakstype(e.target.value);
            nullstillSak(FeltVerdier.sakstype);
          }}
          label="Sakstype"
          value={sakstype}
          koder={fagsakKanEndres ? muligeSakstyper : [fagsak.sakstype]}
          redigerbart={!erBehandlingAvSed && typeTemaKanEndres && fagsakKanEndres}
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
          redigerbart={!erBehandlingAvSed && typeTemaKanEndres && fagsakKanEndres}
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
          redigerbart={!erBehandlingAvSed && typeTemaKanEndres && !harBehandlingMedTrygdeavgift}
          feil={skalViseFeilmeldinger ? behandlingstemaFeilmelding : null}
          disableForsteValg
          className={harBehandlingMedTrygdeavgift ? "ktselect__slim" : undefined}
        />
        {harBehandlingMedTrygdeavgift && (
          <Nav.Typo.EtikettLiten className="behandlingstema__label">
            Du kan ikke endre behandlingstema når saken har en tilknyttet fakturaserie.
          </Nav.Typo.EtikettLiten>
        )}

        <Mui.KodeTermSelect
          onChange={(e) => setBehandlingstype(e.target.value)}
          label="Behandlingstype"
          value={behandlingstype}
          koder={muligeBehandlingstyper}
          redigerbart={!erBehandlingAvSed && typeTemaKanEndres && !erÅrsavregning}
          feil={skalViseFeilmeldinger ? behandlingstypeFeilmelding : null}
          disableForsteValg
        />
        <Datovelger
          onChange={(dato) => setMottaksdato(Datoutils.norskStringTilDate(dato))}
          label={<Nav.Typo.Element>Mottaksdato</Nav.Typo.Element>}
          value={mottaksdato}
          brukInternValidering
        />
        <Mui.KodeTermSelect
          onChange={(e) => setBehandlingsstatus(e.target.value)}
          label="Behandlingsstatus"
          value={behandlingsstatus}
          koder={muligeVerdierPlussGjeldende(oppsummering.behandlingsstatus, muligeBehandlingsstatuser)}
          feil={skalViseFeilmeldinger ? behandlingsstatusFeilmelding : null}
          disableForsteValg
        />

        {generellFeil && <Nav.Alert variant="error">{generellFeil}</Nav.Alert>}
        {behandlingEndret && <Nav.Alert variant="success">Behandlingen er oppdatert</Nav.Alert>}

        {skalViseFeilmeldinger && (
          <Nav.Alert variant="error">
            <Nav.BodyLong size="small">Følgende feil ble funnet</Nav.BodyLong>
            <ul className="feilmeldingliste">
              {alleFeilmeldinger.map((feilmelding) => (
                <li key={feilmelding}>{feilmelding}</li>
              ))}
            </ul>
          </Nav.Alert>
        )}
      </Nav.Modal.Body>
      <Nav.Modal.Footer>
        <Knapperad
          avbryt={lukkModal}
          avbrytTekst="Avbryt"
          bekreft={endreBehandlingHandle}
          bekreftTekst="Lagre endringene"
          redigerbart
          spinner={skalViseSpinner}
        />
      </Nav.Modal.Footer>
    </Nav.Modal>
  );
}

export default withRouter(connector(EndreBehandlingModal));
