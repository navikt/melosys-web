import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PT from "prop-types";
import { withRouter } from "react-router-dom";

import MKV from "../../../melosyskodeverk";

import * as Utils from "../../../utils";
import * as Nav from "../../../utils/navFrontend";
import * as MPT from "../../../proptypes";
import * as API from "../../../services/api";

import SideDialog from "../../../felleskomponenter/sideDialog/sideDialog";
import SideOppsummering from "../../../felleskomponenter/oppsummering/sideOppsummering";
import Behandlingsstatus from "../../../felleskomponenter/behandlingsstatus";
import Behandlingsmeny from "./behandlingsmeny";
import Stegvelger from "../../../felleskomponenter/stegvelger";
import { STEG } from "../../../felleskomponenter/stegvelger/stegMotor/typer";
import { SoknadMenypanelForm } from "../../../felleskomponenter/menypanelForm";
import { useFeatureToggle } from "../../../featuretoggle";

import { fagsakOperations, fagsakSelectors } from "../../../ducks/fagsaker";
import { behandlingsresultatOperations, behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { behandlingerOperations, behandlingerSelectors } from "../../../ducks/behandlinger";
import { avklartefaktaOperations } from "../../../ducks/avklartefakta";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from "../../../ducks/behandlingsgrunnlag";
import { datalastingOperations } from "../../../ducks/datalasting";
import { dokumenterOperations, dokumenterSelectors } from "../../../ducks/dokumenter";
import { formSelectors } from "../../../ducks/form";
import { menypanelOperations } from "../../../ducks/menypanel";
import { folketrygdenkodeverkOperations } from "../../../ducks/folketrygdenkodeverk";
import { oppsummertfaktaOperations } from "../../../ducks/oppsummertfakta";
import { vilkarOperations } from "../../../ducks/vilkar";
import { medlemskapsperioderOperations } from "../../../ducks/medlemskapsperioder";
import { anmodningsperioderSelectors } from "../../../ducks/anmodningsperioder";

import { AvslaattSoknad, HenlagtSak } from "../../eu_eøs/saksbehandling/komponenter/stegErstatter";
import { stegMap } from "./stegMap";
import "./saksbehandling.css";

const behandlingsstatusMap = {
  [MKV.Koder.behandlinger.behandlingsstatus.VURDER_DOKUMENT]: [
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
      term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
    },
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
      term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
    },
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
      term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.SVAR_ANMODNING_MOTTATT]: [
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
      term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
    },
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
      term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
    },
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
      term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL]: [
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
      term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
    },
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
      term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART]: [
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
      term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
    },
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
      term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING]: [],
};

const Saksbehandling = ({
  anmodningsperioderErSendtUtlandet,
  annenBehandlingOppfriskes,
  apneTidligereBehandlinger,
  arbeidsland,
  behandlingOppfriskes,
  behandlingsgrunnlag,
  behandlingsgrunnlagPeriodeFom,
  behandlingsgrunnlagPeriodeTom,
  behandlingsgrunnlagMottaksdato,
  behandlingsresultat,
  behandlingstema,
  behandlingstype,
  brevBestillingRedigerbart,
  brevBestillingRedigerbartIArtikkel13,
  dokumenter,
  dokumentOversikt,
  fagsak,
  fagsakStatusKode,
  hentBehandling,
  hentBehandlingsgrunnlag,
  hentBehandlingsresultat,
  hentDokumentOversikt,
  hentFagsaker,
  hentFolketrygdenKodeverk,
  hentMedlemskapsperioder,
  hentOppsummertFakta,
  lagreAllData,
  lagreAvklartefakta,
  lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger,
  lagreOgLukk,
  lagreVilkar,
  location,
  match,
  oppdaterBehandlingsgrunnlag,
  oppsummering,
  person,
  redigerbart,
  resetBehandlingerState,
  resetBehandlingsgrunnlagState,
  resetFagsakState,
  resetVilkarState,
  resetOppsummertFaktaState,
  resetMedlemskapsperiodeState,
  skjulMenypanel,
  soknadForm,
  tilbakeleggOppgave,
  startOgVisOppfriskModal,
  tilForsiden,
  visAvsluttSakSomBortfaltDialogHandle,
  visAvslagSoknadDialogHandle,
  visHenleggDialogHandle,
  visOppfriskModal,
  visRevurderFagsakDialogHandle,
}) => {
  const [behandlingID, setBehandlingID] = useState(-1);
  const [landkoder, setLandkoder] = useState([]);
  const [bestemmelser, setBestemmelser] = useState([]);
  const folketrygdenToggle = useFeatureToggle("melosys.folketrygden.mvp");

  const oppdaterBehandlingIDState = () => {
    const behandlingIDFraParam = Utils.queryString.getParam(location, "behandlingID");

    if (Utils._toInteger(behandlingIDFraParam) !== behandlingID) {
      setBehandlingID(Utils._toInteger(behandlingIDFraParam));
    }
  };

  const lastInnSaksopplysninger = async () => {
    const { snr } = match.params;
    const behandlingIDFraParam = Utils.queryString.getParam(location, "behandlingID");
    setBehandlingID(Utils._toInteger(behandlingIDFraParam));

    try {
      await hentFagsaker(snr);
      await hentFolketrygdenKodeverk();
      await hentOppsummertFakta(behandlingIDFraParam);
      const response = await hentBehandling(behandlingIDFraParam);
      const behandling = response.data;
      if (!behandling) return false;

      await hentBehandlingsresultat(behandlingIDFraParam);

      // Sjekk om saken er iferd under oppdatering
      if (behandlingOppfriskes) {
        visOppfriskModal();
        return false;
      }

      const bestemmelserResponse = await API.Medlemskapsperioder.hentBestemmelserMedVilkår();
      bestemmelserResponse
        .sort((a, b) => b.bestemmelse.localeCompare(a.bestemmelse))
        .forEach((bestemmelse) => bestemmelse.vilkårOgBegrunnelser.sort((a, b) => a.vilkaar.localeCompare(b.vilkaar)));
      setBestemmelser(bestemmelserResponse);
      await hentMedlemskapsperioder(behandlingIDFraParam);
      await hentBehandlingsgrunnlag(behandlingIDFraParam);
      await hentDokumentOversikt(snr);
      return true;
    } catch (e) {
      Utils.logger.error(e);
    }
    return false;
  };

  useEffect(() => {
    lastInnSaksopplysninger();
    API.Kodeverk.hentLandkoderIso2()
      .then((response) => {
        setLandkoder(
          response.sort((a, b) => {
            if (a.term > b.term) return 1;
            if (b.term > a.term) return -1;
            return 0;
          })
        );
      })
      .catch(Utils.logger.error);

    return () => {
      resetFagsakState();
      resetVilkarState();
      resetOppsummertFaktaState();
      resetMedlemskapsperiodeState();
      resetBehandlingerState();
      resetBehandlingsgrunnlagState();
      skjulMenypanel();
    };
  }, []);

  useEffect(() => {
    oppdaterBehandlingIDState();
  });

  const {
    params: { snr: saksnummer },
  } = match;

  if (Utils._isNil(redigerbart)) {
    return null;
  }
  if (!behandlingID || behandlingID < 0) {
    return null;
  }
  if (folketrygdenToggle === "fetching" || folketrygdenToggle === "disabled") return null;

  const erHenlagtSak = fagsakStatusKode === MKV.Koder.saksstatuser.HENLAGT;
  const erAvslaattSoknad =
    behandlingsresultat.behandlingsresultatTypeKode ===
    MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL;
  const visAvslaattSoknad = erAvslaattSoknad && !erHenlagtSak;
  const behandlingsgrunnlagErKlart = !(
    Object.keys(soknadForm).length === 0 || Object.keys(behandlingsgrunnlag).length === 0
  );
  const visStegVelger = !erHenlagtSak && !erAvslaattSoknad && behandlingsgrunnlagErKlart;

  return (
    <div className="saksbehandling">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="7">
            {erHenlagtSak && <HenlagtSak behandlingsresultat={behandlingsresultat} />}
            {visAvslaattSoknad && <AvslaattSoknad behandlingsresultat={behandlingsresultat} />}
            {visStegVelger && (
              <Stegvelger
                annenBehandlingOppfriskes={annenBehandlingOppfriskes}
                behandlingID={behandlingID}
                lagreAvklartefaktaHandler={lagreAvklartefakta}
                lagreAllData={lagreAllData}
                lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger={lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger}
                lagreVilkarHandler={lagreVilkar}
                oppdaterBehandlingsgrunnlag={oppdaterBehandlingsgrunnlag}
                begrunnelser={MKV.KTObjects.begrunnelser}
                landkoder={landkoder}
                bestemmelser={bestemmelser}
                tilForsiden={tilForsiden}
                stegMap={stegMap}
                forsteSteg={STEG.START}
                sakstype={MKV.Koder.sakstyper.FTRL}
              />
            )}
            <SoknadMenypanelForm startOgVisOppfriskModal={startOgVisOppfriskModal} />
          </Nav.Column>
          <Nav.Column xs="5">
            <SideOppsummering
              behandlingstema={behandlingstema}
              redigerbart={redigerbart}
              fagsak={fagsak}
              oppsummering={oppsummering}
              person={person}
              arbeidsland={landkoder && landkoder.filter((landkodeObjekt) => arbeidsland.includes(landkodeObjekt.kode))}
              behandlingsgrunnlagPeriodeFom={behandlingsgrunnlagPeriodeFom}
              behandlingsgrunnlagPeriodeTom={behandlingsgrunnlagPeriodeTom}
              behandlingsgrunnlagMottaksdato={behandlingsgrunnlagMottaksdato}
              renderBehandlingsmeny={() => (
                <Behandlingsmeny
                  redigerbart={redigerbart}
                  behandlingstype={behandlingstype}
                  anmodningsperioderErSendtUtlandet={anmodningsperioderErSendtUtlandet}
                  lagreOgLukkHandle={lagreOgLukk}
                  tilbakeleggeHandle={tilbakeleggOppgave}
                  oppfriskSaksopplysningerHandle={visOppfriskModal}
                  visHenleggDialogHandle={visHenleggDialogHandle}
                  visAvsluttSakSomBortfaltDialogHandle={visAvsluttSakSomBortfaltDialogHandle}
                  visAvslagSoknadDialogHandle={visAvslagSoknadDialogHandle}
                  apneTidligereBehandlinger={apneTidligereBehandlinger}
                  visRevurderFagsakDialogHandle={visRevurderFagsakDialogHandle}
                />
              )}
              renderBehandlingsstatus={() => (
                <Behandlingsstatus
                  behandlingID={behandlingID}
                  redigerbart={redigerbart}
                  oppsummering={oppsummering}
                  behandlingsstatusMap={behandlingsstatusMap}
                />
              )}
            />
            <SideDialog
              behandlingID={behandlingID}
              saksnummer={saksnummer}
              brevBestillingRedigerbart={brevBestillingRedigerbart}
              brevBestillingRedigerbartIArtikkel13={brevBestillingRedigerbartIArtikkel13}
              redigerbart={redigerbart}
              dokumentOversikt={dokumentOversikt}
              dokumenter={dokumenter}
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};

Saksbehandling.propTypes = {
  anmodningsperioderErSendtUtlandet: PT.bool.isRequired,
  annenBehandlingOppfriskes: PT.bool.isRequired,
  arbeidsland: PT.arrayOf(PT.string).isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  behandlingsgrunnlag: MPT.Behandlingsgrunnlag,
  behandlingsgrunnlagPeriodeFom: PT.string.isRequired,
  behandlingsgrunnlagPeriodeTom: PT.string.isRequired,
  behandlingsgrunnlagMottaksdato: PT.string.isRequired,
  behandlingsresultat: MPT.Behandlingsresultat.isRequired,
  behandlingstema: PT.string.isRequired,
  behandlingstype: PT.string.isRequired,
  brevBestillingRedigerbart: PT.bool.isRequired,
  brevBestillingRedigerbartIArtikkel13: PT.bool.isRequired,
  dokumenter: PT.array.isRequired,
  dokumentOversikt: PT.array.isRequired,
  fagsak: MPT.Fagsak,
  fagsakStatusKode: PT.string.isRequired,
  history: PT.object.isRequired,
  location: PT.object.isRequired,
  match: PT.object.isRequired,
  oppsummering: MPT.Behandlinger.Oppsummering,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  redigerbart: PT.bool,
  soknadForm: PT.object.isRequired,
  // Funcs
  apneTidligereBehandlinger: PT.func.isRequired,
  hentBehandling: PT.func.isRequired,
  hentBehandlingsgrunnlag: PT.func.isRequired,
  hentBehandlingsresultat: PT.func.isRequired,
  hentDokumentOversikt: PT.func.isRequired,
  hentFagsaker: PT.func.isRequired,
  hentMedlemskapsperioder: PT.func.isRequired,
  hentOppsummertFakta: PT.func.isRequired,
  hentFolketrygdenKodeverk: PT.func.isRequired,
  lagreAllData: PT.func.isRequired,
  lagreAvklartefakta: PT.func.isRequired,
  lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger: PT.func.isRequired,
  lagreOgLukk: PT.func.isRequired,
  lagreVilkar: PT.func.isRequired,
  oppdaterBehandlingsgrunnlag: PT.func.isRequired,
  resetBehandlingerState: PT.func.isRequired,
  resetBehandlingsgrunnlagState: PT.func.isRequired,
  resetFagsakState: PT.func.isRequired,
  resetVilkarState: PT.func.isRequired,
  resetOppsummertFaktaState: PT.func.isRequired,
  resetMedlemskapsperiodeState: PT.func.isRequired,
  startOgVisOppfriskModal: PT.func.isRequired,
  skjulMenypanel: PT.func.isRequired,
  tilbakeleggOppgave: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  visAvsluttSakSomBortfaltDialogHandle: PT.func.isRequired,
  visAvslagSoknadDialogHandle: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  visOppfriskModal: PT.func.isRequired,
  visRevurderFagsakDialogHandle: PT.func.isRequired,
};

Saksbehandling.defaultProps = {
  behandlingsgrunnlag: {},
  fagsak: {},
  oppsummering: undefined,
  redigerbart: null,
};

const mapStateToProps = (state) => ({
  anmodningsperioderErSendtUtlandet: anmodningsperioderSelectors.AnmodningsperioderErSendtUtlandetSelector(state),
  arbeidsland: behandlingsgrunnlagSelectors.SoknadslandSelector(state),
  behandlingsgrunnlag: behandlingsgrunnlagSelectors.BehandlingsgrunnlagDataSelector(state),
  behandlingsgrunnlagPeriodeFom: Utils.dato.formatterDatoTilNorsk(
    behandlingsgrunnlagSelectors.PeriodeSelector(state).fom
  ),
  behandlingsgrunnlagPeriodeTom: Utils.dato.formatterDatoTilNorsk(
    behandlingsgrunnlagSelectors.PeriodeSelector(state).tom
  ),
  behandlingsgrunnlagMottaksdato: Utils.dato.formatterDatoTilNorsk(
    behandlingsgrunnlagSelectors.MottaksdatoSelector(state)
  ),
  behandlingsresultat: behandlingsresultatSelectors.BehandlingsresultatSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  brevBestillingRedigerbart: redigerbartSelectors.BrevBestillingRedigerbartSelector(state),
  brevBestillingRedigerbartIArtikkel13: redigerbartSelectors.BrevBestillingRedigerbartIArtikkel13Selector(state),
  dokumenter: dokumenterSelectors.AlleFysiskeDokumentSelector(state),
  dokumentOversikt: dokumenterSelectors.DokumentOversiktSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  fagsakStatusKode: fagsakSelectors.FagsakStatusSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  skjema: formSelectors.SoknadenFormSelector(state).values,
  soknadForm: formSelectors.SoknadenFormSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  hentBehandling: (behandlingID) => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentBehandlingsgrunnlag: (bid) => dispatch(behandlingsgrunnlagOperations.hent(bid)),
  hentBehandlingsresultat: (bid) => dispatch(behandlingsresultatOperations.hent(bid)),
  hentDokumentOversikt: (saksnummer) => dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer)),
  hentFagsaker: (saksnummer) => dispatch(fagsakOperations.hent(saksnummer)),
  hentFolketrygdenKodeverk: () => dispatch(folketrygdenkodeverkOperations.hentKodeverkForFolketrygden()),
  hentMedlemskapsperioder: (bid) => dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(bid)),
  hentOppsummertFakta: (bid) => dispatch(oppsummertfaktaOperations.hentOppsummertFakta(bid)),
  lagreAllData: () => dispatch(datalastingOperations.lagreAllData(MKV.Koder.sakstyper.FTRL)),
  lagreAvklartefakta: () => dispatch(avklartefaktaOperations.lagre()),
  lagreVilkar: () => dispatch(vilkarOperations.lagre()),
  oppdaterBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.oppdaterState()),
  resetVilkarState: () => dispatch(vilkarOperations.resetState()),
  resetOppsummertFaktaState: () => dispatch(oppsummertfaktaOperations.resetOppsummertFakta()),
  resetMedlemskapsperiodeState: () => dispatch(medlemskapsperioderOperations.resetMedlemskapsperioder()),
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  resetBehandlingerState: () => dispatch(behandlingerOperations.resetBehandlingerState()),
  resetBehandlingsgrunnlagState: () => dispatch(behandlingsgrunnlagOperations.resetState()),
  skjulMenypanel: () => dispatch(menypanelOperations.skjulMenypanel()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksbehandling));
