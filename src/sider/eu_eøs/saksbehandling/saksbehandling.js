import React, { Component } from "react";
import { connect } from "react-redux";
import PT from "prop-types";
import { withRouter } from "react-router-dom";

import MKV from "../../../melosyskodeverk";

import * as Utils from "../../../utils";
import * as Nav from "../../../navFrontend";
import * as MPT from "../../../proptypes";
import * as Api from "../../../services/api";

import SideDialog from "../../../felleskomponenter/sideDialog/sideDialog";
import { Saksopplysninger } from "./komponenter/saksopplysninger";
import SideOppsummering from "../../../felleskomponenter/oppsummering/sideOppsummering";
import Behandlingsstatus from "../../../felleskomponenter/behandlingsstatus";
import Legacybehandlingsmeny from "./komponenter/legacybehandlingsmeny";

import { fagsakOperations, fagsakSelectors } from "../../../ducks/fagsaker";
import { behandlingsresultatOperations } from "../../../ducks/behandlingsresultat";
import { behandlingerOperations, behandlingerSelectors } from "../../../ducks/behandlinger";
import { anmodningsperioderOperations, anmodningsperioderSelectors } from "../../../ducks/anmodningsperioder";
import { vilkarOperations, vilkarSelectors } from "../../../ducks/vilkar";
import { avklartefaktaOperations, avklartefaktaSelectors } from "../../../ducks/avklartefakta";
import { saksopplysningerSelectors } from "../../../ducks/saksopplysninger";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../ducks/lovvalgsperioder";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from "../../../ducks/behandlingsgrunnlag";
import { behandlingsperioderOperations, behandlingsperioderSelectors } from "../../../ducks/behandlingsperioder";
import { formSelectors } from "../../../ducks/form";
import { datalastingOperations } from "../../../ducks/datalasting";

import "./saksbehandling.css";
import { dokumenterOperations, dokumenterSelectors } from "../../../ducks/dokumenter";
import { anmodningsperiodesvarOperations } from "../../../ducks/anmodningsperiodesvar";

const { AVSLUTTET, MIDLERTIDIG_LOVVALGSBESLUTNING } = MKV.Koder.behandlinger.behandlingsstatus;

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

class Saksbehandling extends Component {
  state = {
    behandlingID: -1,
    saksopplysningerLastet: false,
  };

  async componentDidMount() {
    await this.lastInnSaksopplysninger();
    this.setSaksopplysningerLastet(true);
  }

  componentDidUpdate() {
    this.oppdaterBehandlingIDState();
  }

  componentWillUnmount() {
    this.props.resetFagsakState();
    this.props.resetBehandlingerState();
    this.props.resetAvklartefaktaState();
    this.props.resetLovvalgsperiode();
    this.props.resetVilkarState();
    this.props.resetBehandlingsgrunnlagState();
    this.props.resetBehandlingsPerioderState();
  }

  setSaksopplysningerLastet(lastet) {
    this.setState({ saksopplysningerLastet: lastet });
  }

  oppdaterBehandlingIDState = () => {
    const { location } = this.props;
    const behandlingID = Utils.queryString.getParam(location, "behandlingID");

    if (Utils._toInteger(behandlingID) !== this.state.behandlingID) {
      this.setState({ behandlingID: Utils._toInteger(behandlingID) });
    }
  };

  lastInnSaksopplysninger = async () => {
    const { match, location } = this.props;
    const { snr } = match.params;
    const behandlingID = Utils.queryString.getParam(location, "behandlingID");
    this.setState({ behandlingID: Utils._toInteger(behandlingID) });

    const {
      hentFagsaker,
      hentBehandling,
      hentBehandlingsresultat,
      hentBehandlingsgrunnlag,
      visOppfriskModal,
      behandlingOppfriskes,
      hentDokumentOversikt,
      hentAnmodningsperiodesvar,
    } = this.props;

    try {
      await hentFagsaker(snr);
      const response = await hentBehandling(behandlingID);
      const behandling = response.data;
      if (!behandling) return false;

      await hentBehandlingsresultat(behandlingID);

      // Sjekk om saken er iferd under oppdatering
      if (behandlingOppfriskes) {
        visOppfriskModal();
        return false;
      }

      await hentBehandlingsgrunnlag(behandlingID);
      await hentDokumentOversikt(snr);

      const anmodningsperioderRes = await Api.Anmodningsperioder.hent(behandlingID);
      const anmodningsperiodeID = anmodningsperioderRes.anmodningsperioder[0]?.id;
      if (anmodningsperiodeID) await hentAnmodningsperiodesvar(anmodningsperiodeID);

      return true;
    } catch (e) {
      return false;
    }
  };

  lagreAvklartefaktaHandler = async () => {
    const { behandlingID } = this.state;
    const { sendAvklartefakta, avklartefakta } = this.props;

    return sendAvklartefakta(behandlingID, avklartefakta);
  };

  lagreLovvalgsperioderHandler = async () => {
    const { behandlingID } = this.state;
    const { sendLovvalgsperioder, lovvalgsperioder, anmodningsperioderErSendtUtlandet } = this.props;

    if (anmodningsperioderErSendtUtlandet) return;

    sendLovvalgsperioder(behandlingID, lovvalgsperioder);
  };

  lagreAnmodningsperioderHandler = async () => {
    const { behandlingID } = this.state;
    const { sendAnmodningsperioder, anmodningsperioder, anmodningsperioderErSendtUtlandet } = this.props;

    if (anmodningsperioderErSendtUtlandet) return;

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    sendAnmodningsperioder(behandlingID, {
      anmodningsperioder: anmodningsperioder.map(({ sendtUtland, ...beholdProperties }) => beholdProperties),
    });
  };

  oppdaterOgLagreBehandlingerHandler = async () => {
    const { skjema, artikkel16_skjema, oppdaterBehandlingerState, lagrePerioder } = this.props;
    await oppdaterBehandlingerState({ ...skjema, ...artikkel16_skjema });

    lagrePerioder();
  };

  render() {
    const {
      anmodningsperioderErSendtUtlandet,
      redigerbart,
      brevBestillingRedigerbart,
      behandlingsmenyRedigerbart,
      match,
      lagreOgLukk,
      tilbakeleggOppgave,
      behandlingstype,
      behandlingstema,
      fagsak,
      oppsummering,
      person,
      lovvalgsperiodeFom,
      lovvalgsperiodeTom,
      visHenleggDialogHandle,
      visAvsluttSakSomBortfaltDialogHandle,
      visAvslagSoknadDialogHandle,
      visOppfriskModal,
      apneTidligereBehandlinger,
      arbeidsland,
      behandlingsgrunnlagPeriodeFom,
      behandlingsgrunnlagPeriodeTom,
      visRevurderFagsakDialogHandle,
      tilForsiden,
      visValideringModalDialogHandle,
      startOgVisOppfriskModal,
      dokumentOversikt,
      dokumenter,
      behandlingsstatus,
    } = this.props;
    const {
      params: { snr: saksnummer },
    } = match;
    const { behandlingID, saksopplysningerLastet } = this.state;

    if (Utils._isNil(redigerbart)) return null;
    if (!saksopplysningerLastet) return null;

    const behandlingErAvsluttet = [AVSLUTTET, MIDLERTIDIG_LOVVALGSBESLUTNING].includes(behandlingsstatus);
    const visRevurderFagsak =
      anmodningsperioderErSendtUtlandet ||
      (behandlingErAvsluttet && behandlingstype !== MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE);
    const behandlingstypeErNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

    return (
      <div className="saksbehandling">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="7">
              <Saksopplysninger
                behandlingID={behandlingID}
                visOppfriskModal={visOppfriskModal}
                lagreVilkarHandler={this.props.lagreVilkar}
                lagreAvklartefaktaHandler={this.lagreAvklartefaktaHandler}
                lagreLovvalgsperioderHandler={this.lagreLovvalgsperioderHandler}
                lagreAnmodningsperioderHandler={this.lagreAnmodningsperioderHandler}
                oppdaterOgLagreBehandlingerHandler={this.oppdaterOgLagreBehandlingerHandler}
                lagreAllData={this.props.lagreAllData}
                tilForsiden={tilForsiden}
                visValideringModalDialogHandle={visValideringModalDialogHandle}
                startOgVisOppfriskModal={startOgVisOppfriskModal}
              />
            </Nav.Column>
            <Nav.Column xs="5">
              <SideOppsummering
                behandlingstema={behandlingstema}
                redigerbart={redigerbart}
                fagsak={fagsak}
                oppsummering={oppsummering}
                person={person}
                lovvalgsperiodeFom={lovvalgsperiodeFom}
                lovvalgsperiodeTom={lovvalgsperiodeTom}
                arbeidsland={arbeidsland}
                behandlingsgrunnlagPeriodeFom={behandlingsgrunnlagPeriodeFom}
                behandlingsgrunnlagPeriodeTom={behandlingsgrunnlagPeriodeTom}
                renderBehandlingsmeny={() => (
                  <Legacybehandlingsmeny
                    redigerbart={behandlingsmenyRedigerbart}
                    lagreOgLukkHandle={lagreOgLukk}
                    tilbakeleggeHandle={tilbakeleggOppgave}
                    visHenleggDialogHandle={visHenleggDialogHandle}
                    apneTidligereBehandlinger={apneTidligereBehandlinger}
                    visAvsluttSakSomBortfalt={!behandlingstypeErNyVurdering}
                    visAvsluttSakSomBortfaltDialogHandle={visAvsluttSakSomBortfaltDialogHandle}
                    visHenleggSak={behandlingstype !== MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE}
                    visAvslagSoknadDialogHandle={visAvslagSoknadDialogHandle}
                    visAvslagManglendeOpplysninger={!behandlingstypeErNyVurdering}
                    visRevurderFagsakDialogHandle={visRevurderFagsakDialogHandle}
                    visRevurderFagsak={visRevurderFagsak}
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
                redigerbart={redigerbart}
                dokumentOversikt={dokumentOversikt}
                dokumenter={dokumenter}
              />
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    );
  }
}

Saksbehandling.propTypes = {
  behandlingID: PT.number.isRequired,
  redigerbart: PT.bool,
  avklartefakta: MPT.AvklartefaktaListe,
  fagsak: MPT.Fagsak,
  vilkar: PT.array, // TODO lag proptype
  behandlingsPeriode: PT.object.isRequired, // TODO lag proptype
  lovvalgsperioder: PT.array.isRequired, // TODO lag proptype
  history: PT.object.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  skjema: PT.object,
  artikkel16_skjema: PT.object,
  // Funcs
  hentFagsaker: PT.func.isRequired,
  hentBehandling: PT.func.isRequired,
  hentBehandlingsresultat: PT.func.isRequired,
  hentBehandlingsgrunnlag: PT.func.isRequired,
  resetFagsakState: PT.func.isRequired,
  resetBehandlingsresultatState: PT.func.isRequired,
  resetVilkarState: PT.func.isRequired,
  resetAvklartefaktaState: PT.func.isRequired,
  resetBehandlingsgrunnlagState: PT.func.isRequired,
  resetBehandlingerState: PT.func.isRequired,
  resetBehandlingsPerioderState: PT.func.isRequired,
  resetLovvalgsperiode: PT.func.isRequired,
  lagreVilkar: PT.func.isRequired,
  sendAvklartefakta: PT.func.isRequired,
  sendLovvalgsperioder: PT.func.isRequired,
  lagrePerioder: PT.func.isRequired,
  oppdaterVilkarState: PT.func.isRequired,
  oppdaterBehandlingerState: PT.func.isRequired,
  anmodningsperioder: PT.array,
  sendAnmodningsperioder: PT.func.isRequired,
  brevBestillingRedigerbart: PT.bool.isRequired,
  behandlingsmenyRedigerbart: PT.bool.isRequired,
  anmodningsperioderErSendtUtlandet: PT.bool.isRequired,
  lagreAllData: PT.func.isRequired,
  lagreOgLukk: PT.func.isRequired,
  tilbakeleggOppgave: PT.func.isRequired,
  resetSaksopplysninger: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  visAvsluttSakSomBortfaltDialogHandle: PT.func.isRequired,
  visAvslagSoknadDialogHandle: PT.func.isRequired,
  apneTidligereBehandlinger: PT.func.isRequired,
  behandlingstype: PT.string.isRequired,
  behandlingstema: PT.string.isRequired,
  oppsummering: MPT.Behandlinger.Oppsummering,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  behandlingsgrunnlagPeriodeFom: PT.string.isRequired,
  behandlingsgrunnlagPeriodeTom: PT.string.isRequired,
  visRevurderFagsakDialogHandle: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  visValideringModalDialogHandle: PT.func.isRequired,
  visOppfriskModal: PT.func.isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  startOgVisOppfriskModal: PT.func.isRequired,
  hentDokumentOversikt: PT.func.isRequired,
  dokumentOversikt: PT.array.isRequired,
  dokumenter: PT.array.isRequired,
  behandlingsstatus: PT.string.isRequired,
  hentAnmodningsperiodesvar: PT.func.isRequired,
};

Saksbehandling.defaultProps = {
  redigerbart: null,
  avklartefakta: [],
  fagsak: {},
  vilkar: [],
  skjema: {},
  anmodningsperioder: [],
  artikkel16_skjema: {},
  oppsummering: undefined,
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
};
/** Mapper både fast tekst inn til de forskjellige panelene i tillegg til å
 * mappe verdier fra søknaden (soknad) ut til Redux Form via initialValue.
 * @param state
 */
const mapStateToProps = (state) => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeFomSelector(state)),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeTomSelector(state)),
  oppfriskning: saksopplysningerSelectors.SaksopplysningerSelector(state),
  vilkar: vilkarSelectors.VilkarSelector(state),
  skjema: formSelectors.SoknadenFormSelector(state).values,
  artikkel16_skjema: formSelectors.Artikkel16AnmodningFormSelector(state).values,
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  behandlingsPeriode: behandlingsperioderSelectors.behandlingsPerioderSelector(state),
  anmodningsperioder: anmodningsperioderSelectors.AnmodningsperioderSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  brevBestillingRedigerbart: redigerbartSelectors.BrevBestillingRedigerbartSelector(state),
  anmodningsperioderErSendtUtlandet: anmodningsperioderSelectors.AnmodningsperioderErSendtUtlandetSelector(state),
  arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  behandlingsgrunnlagPeriodeFom: Utils.dato.formatterDatoTilNorsk(
    behandlingsgrunnlagSelectors.PeriodeSelector(state).fom
  ),
  behandlingsgrunnlagPeriodeTom: Utils.dato.formatterDatoTilNorsk(
    behandlingsgrunnlagSelectors.PeriodeSelector(state).tom
  ),
  behandlingsmenyRedigerbart: redigerbartSelectors.BehandlingsmenyRedigerbartSelector(state),
  dokumenter: dokumenterSelectors.AlleFysiskeDokumentSelector(state),
  dokumentOversikt: dokumenterSelectors.DokumentOversiktSelector(state),
  behandlingsstatus: behandlingerSelectors.BehandlingsstatusKodeSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  hentFagsaker: (saksnummer) => dispatch(fagsakOperations.hent(saksnummer)),
  hentBehandling: (behandlingID) => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentBehandlingsresultat: (bid) => dispatch(behandlingsresultatOperations.hent(bid)),
  hentBehandlingsgrunnlag: (bid) => dispatch(behandlingsgrunnlagOperations.hent(bid)),
  hentDokumentOversikt: (saksnummer) => dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer)),
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  resetBehandlingsresultatState: () => dispatch(behandlingsresultatOperations.resetBehandlingsresultatState()),
  resetVilkarState: () => dispatch(vilkarOperations.resetState()),
  resetAvklartefaktaState: () => dispatch(avklartefaktaOperations.resetAvklartefaktaState()),
  resetBehandlingsgrunnlagState: () => dispatch(behandlingsgrunnlagOperations.resetState()),
  resetLovvalgsperiode: () => dispatch(lovvalgsperioderOperations.resetLovvalgsperioderState()),
  resetBehandlingerState: () => dispatch(behandlingerOperations.resetBehandlingerState()),
  resetBehandlingsPerioderState: () => dispatch(behandlingsperioderOperations.resetPerioderState()),
  sendAvklartefakta: (behandlingID, body) => dispatch(avklartefaktaOperations.send(behandlingID, body)),
  lagreVilkar: () => dispatch(vilkarOperations.lagre()),
  oppdaterVilkarState: (skjema) => dispatch(vilkarOperations.oppdaterState(skjema)),
  oppdaterBehandlingerState: (skjema) => dispatch(behandlingsperioderOperations.oppdaterPerioderState(skjema)),
  sendLovvalgsperioder: (behandlingID, body) => dispatch(lovvalgsperioderOperations.send(behandlingID, body)),
  lagrePerioder: () => dispatch(behandlingsperioderOperations.lagre()),
  sendAnmodningsperioder: (behandlingID, body) => dispatch(anmodningsperioderOperations.send(behandlingID, body)),
  lagreAllData: () => dispatch(datalastingOperations.lagreAllData()),
  resetSaksopplysninger: () => dispatch(datalastingOperations.resetSaksopplysninger()),
  hentAnmodningsperiodesvar: (anmodningsperiodeID) =>
    dispatch(anmodningsperiodesvarOperations.hent(anmodningsperiodeID)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksbehandling));
