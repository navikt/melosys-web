import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import { withRouter } from 'react-router-dom';

import MKV from '../../melosyskodeverk';

import * as Utils from '../../utils';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes';

import { Saksopplysninger } from './komponenter/saksopplysninger';
import SideDialog from '../../felleskomponenter/sideDialog/sideDialog';
import SideOppsummering from '../../felleskomponenter/sideOppsummering';
import Behandlingsstatus from '../../felleskomponenter/behandlingsstatus';
import Behandlingsmeny from './komponenter/behandlingsmeny';

import { fagsakOperations, fagsakSelectors } from '../../ducks/fagsaker';
import { behandlingsresultatOperations } from '../../ducks/behandlingsresultat';
import { behandlingerOperations, behandlingerSelectors } from '../../ducks/behandlinger';
import { anmodningsperioderOperations, anmodningsperioderSelectors } from '../../ducks/anmodningsperioder';
import { vilkarOperations, vilkarSelectors } from '../../ducks/vilkar';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../ducks/avklartefakta';
import { saksopplysningerOperations, saksopplysningerSelectors } from '../../ducks/saksopplysninger';
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from '../../ducks/lovvalgsperioder';
import { redigerbartSelectors } from '../../ducks/redigerbart';
import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from '../../ducks/behandlingsgrunnlag';
import { behandlingsperioderOperations, behandlingsperioderSelectors } from '../../ducks/behandlingsperioder';
import { formSelectors } from '../../ducks/form';
import { datalastingOperations } from '../../ducks/datalasting';

import './saksbehandling.css';

const behandlingsstatusMap = {
  [MKV.Koder.behandlinger.behandlingsstatus.VURDER_DOKUMENT]: [
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.SVAR_ANMODNING_MOTTATT]: [
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL]: [
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART]: [
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING]: [],
};

class Saksbehandling extends Component {
  state = {
    behandlingID: -1,
  };

  componentDidMount() {
    this.lastInnSaksopplysninger();
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

  lastInnSaksopplysninger = async () => {
    const { match, location } = this.props;
    const { snr } = match.params;
    const behandlingID = Utils.queryString.getParam(location, 'behandlingID');
    this.setState({ behandlingID: Utils._toInteger(behandlingID) });

    const {
      hentFagsaker, hentBehandling, hentBehandlingsresultat,
      hentBehandlingsgrunnlag, sjekkOppfriskningStatus, blokkerInnholdMedOppfriskSpinner,
    } = this.props;

    try {
      await hentFagsaker(snr);
      const response = await hentBehandling(behandlingID);
      const behandling = response.data;
      if (!behandling) return false;

      await hentBehandlingsresultat(behandlingID);

      // Sjekk om saken er iferd under oppdatering
      const oppfriskningStatus = await sjekkOppfriskningStatus(behandlingID);
      const { data: status } = oppfriskningStatus;

      if (status === 'PROGRESS') {
        blokkerInnholdMedOppfriskSpinner();
        return false;
      }

      await hentBehandlingsgrunnlag(behandlingID);
      return true;
    } catch (e) {
      Utils.logger.error(e);
    }
    return false;
  };

  lagreVilkarHandler = async () => {
    const { behandlingID } = this.state;

    const { sendVilkar, vilkar } = this.props;
    sendVilkar(behandlingID, vilkar);
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

    /* eslint-disable-next-line no-unused-vars */
    sendAnmodningsperioder(behandlingID, { anmodningsperioder: anmodningsperioder.map(({ sendtUtland, ...beholdProperties }) => beholdProperties) });
  };

  oppdaterOgLagreBehandlingerHandler = async () => {
    const {
      skjema, artikkel16_skjema, oppdaterBehandlingerState, lagrePerioder,
    } = this.props;
    await oppdaterBehandlingerState({ ...skjema, ...artikkel16_skjema });

    lagrePerioder();
  };

  render() {
    const {
      redigerbart,
      brevBestillingRedigerbart,
      brevBestillingRedigerbartIArtikkel13,
      behandlingsmenyRedigerbart,
      match,
      lagreOgLukk,
      tilbakeleggOppgave,
      behandlingstype,
      fagsak,
      oppsummering,
      person,
      lovvalgsperiodeFom,
      lovvalgsperiodeTom,
      oppdaterBehandlingsStatus,
      visHenleggDialogHandle,
      visAvsluttSakSomBortfaltDialogHandle,
      visAvslagSoknadDialogHandle,
      visOppfriskBekreftelse,
      apneTidligereBehandlinger,
      blokkerInnholdMedOppfriskSpinner,
      arbeidsland,
      behandlingsgrunnlagPeriodeFom,
      behandlingsgrunnlagPeriodeTom,
      visRevurderVedtakDialogHandle,
      tilForsiden,
      visValideringModalDialogHandle,
    } = this.props;
    const { params: { snr: saksnummer } } = match;
    const { behandlingID } = this.state;

    if (Utils._isNil(redigerbart)) return null;

    return (
      <div className="saksbehandling">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="7">
              <Saksopplysninger
                behandlingID={behandlingID}
                blokkerInnholdMedOppfriskSpinner={blokkerInnholdMedOppfriskSpinner}
                lagreVilkarHandler={this.lagreVilkarHandler}
                lagreAvklartefaktaHandler={this.lagreAvklartefaktaHandler}
                lagreLovvalgsperioderHandler={this.lagreLovvalgsperioderHandler}
                lagreAnmodningsperioderHandler={this.lagreAnmodningsperioderHandler}
                oppdaterOgLagreBehandlingerHandler={this.oppdaterOgLagreBehandlingerHandler}
                lagreAllData={this.props.lagreAllData}
                tilForsiden={tilForsiden}
                visValideringModalDialogHandle={visValideringModalDialogHandle}
              />
            </Nav.Column>
            <Nav.Column xs="5">
              <SideOppsummering
                behandlingstype={behandlingstype}
                redigerbart={redigerbart}
                fagsak={fagsak}
                oppsummering={oppsummering}
                person={person}
                lovvalgsperiodeFom={lovvalgsperiodeFom}
                lovvalgsperiodeTom={lovvalgsperiodeTom}
                arbeidsland={arbeidsland}
                behandlingsgrunnlagPeriodeFom={behandlingsgrunnlagPeriodeFom}
                behandlingsgrunnlagPeriodeTom={behandlingsgrunnlagPeriodeTom}
                renderBehandlingsmeny={() => <Behandlingsmeny
                  redigerbart={behandlingsmenyRedigerbart}
                  lagreOgLukkHandle={lagreOgLukk}
                  tilbakeleggeHandle={tilbakeleggOppgave}
                  visHenleggDialogHandle={visHenleggDialogHandle}
                  apneTidligereBehandlinger={apneTidligereBehandlinger}
                  visAvsluttSakSomBortfaltDialogHandle={visAvsluttSakSomBortfaltDialogHandle}
                  visHenleggSak={behandlingstype !== MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE}
                  visAvslagSoknadDialogHandle={visAvslagSoknadDialogHandle}
                  visAvslagManglendeOpplysninger={behandlingstype !== MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING}
                  visOppfriskSaksopplysninger
                  oppfriskSaksopplysningerHandle={visOppfriskBekreftelse}
                  visRevurderVedtakDialogHandle={visRevurderVedtakDialogHandle}
                  visRevurderVedtak={behandlingstype !== MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE}
                  visAvsluttSakSomBortfalt={behandlingstype !== MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE}
                />}
                renderBehandlingsstatus={() => <Behandlingsstatus
                  behandlingID={behandlingID}
                  redigerbart={redigerbart}
                  oppsummering={oppsummering}
                  oppdaterBehandlingsStatus={oppdaterBehandlingsStatus}
                  behandlingsstatusMap={behandlingsstatusMap}
                />}
              />
              <SideDialog
                behandlingID={behandlingID}
                saksnummer={saksnummer}
                brevBestillingRedigerbart={brevBestillingRedigerbart}
                brevBestillingRedigerbartIArtikkel13={brevBestillingRedigerbartIArtikkel13}
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
  oppfriskSaksopplysninger: PT.func.isRequired,
  resetFagsakState: PT.func.isRequired,
  resetBehandlingsresultatState: PT.func.isRequired,
  resetVilkarState: PT.func.isRequired,
  resetAvklartefaktaState: PT.func.isRequired,
  resetBehandlingsgrunnlagState: PT.func.isRequired,
  resetBehandlingerState: PT.func.isRequired,
  resetBehandlingsPerioderState: PT.func.isRequired,
  resetLovvalgsperiode: PT.func.isRequired,
  sjekkOppfriskningStatus: PT.func.isRequired,
  sendVilkar: PT.func.isRequired,
  sendAvklartefakta: PT.func.isRequired,
  sendLovvalgsperioder: PT.func.isRequired,
  lagrePerioder: PT.func.isRequired,
  oppdaterVilkarState: PT.func.isRequired,
  oppdaterBehandlingerState: PT.func.isRequired,
  anmodningsperioder: PT.array,
  sendAnmodningsperioder: PT.func.isRequired,
  brevBestillingRedigerbart: PT.bool.isRequired,
  brevBestillingRedigerbartIArtikkel13: PT.bool.isRequired,
  behandlingsmenyRedigerbart: PT.bool.isRequired,
  anmodningsperioderErSendtUtlandet: PT.bool.isRequired,
  lagreAllData: PT.func.isRequired,
  lagreOgLukk: PT.func.isRequired,
  tilbakeleggOppgave: PT.func.isRequired,
  oppdaterBehandlingsStatus: PT.func.isRequired,
  resetSaksopplysninger: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  visAvsluttSakSomBortfaltDialogHandle: PT.func.isRequired,
  visAvslagSoknadDialogHandle: PT.func.isRequired,
  visOppfriskBekreftelse: PT.func.isRequired,
  apneTidligereBehandlinger: PT.func.isRequired,
  behandlingstype: PT.string.isRequired,
  oppsummering: MPT.Behandlinger.Oppsummering,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  blokkerInnholdMedOppfriskSpinner: PT.func.isRequired,
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  behandlingsgrunnlagPeriodeFom: PT.string.isRequired,
  behandlingsgrunnlagPeriodeTom: PT.string.isRequired,
  visRevurderVedtakDialogHandle: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  visValideringModalDialogHandle: PT.func.isRequired,
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
const mapStateToProps = state => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeSelector(state).fom),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeSelector(state).tom),
  oppfriskning: saksopplysningerSelectors.SaksopplysningerSelector(state),
  vilkar: vilkarSelectors.VilkarSelector(state),
  skjema: formSelectors.SoknadenFormSelector(state).values,
  artikkel16_skjema: formSelectors.Artikkel16AnmodningFormSelector(state).values,
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  behandlingsPeriode: behandlingsperioderSelectors.behandlingsPerioderSelector(state),
  anmodningsperioder: anmodningsperioderSelectors.AnmodningsperioderSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  brevBestillingRedigerbart: redigerbartSelectors.BrevBestillingRedigerbartSelector(state),
  brevBestillingRedigerbartIArtikkel13: redigerbartSelectors.BrevBestillingRedigerbartIArtikkel13Selector(state),
  anmodningsperioderErSendtUtlandet: anmodningsperioderSelectors.AnmodningsperioderErSendtUtlandetSelector(state),
  arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  behandlingsgrunnlagPeriodeFom: Utils.dato.formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).fom),
  behandlingsgrunnlagPeriodeTom: Utils.dato.formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).tom),
  behandlingsmenyRedigerbart: redigerbartSelectors.BehandlingsmenyRedigerbartSelector(state),
});

const mapDispatchToProps = dispatch => ({
  sjekkOppfriskningStatus: behandlingID => dispatch(saksopplysningerOperations.sjekkStatus(behandlingID)),
  hentFagsaker: saksnummer => dispatch(fagsakOperations.hent(saksnummer)),
  hentBehandling: behandlingID => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentBehandlingsresultat: bid => dispatch(behandlingsresultatOperations.hent(bid)),
  hentBehandlingsgrunnlag: bid => dispatch(behandlingsgrunnlagOperations.hent(bid)),
  oppfriskSaksopplysninger: saksnummer => saksopplysningerOperations.oppfrisk(saksnummer),
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  resetBehandlingsresultatState: () => dispatch(behandlingsresultatOperations.resetBehandlingsresultatState()),
  resetVilkarState: () => dispatch(vilkarOperations.resetVilkarState()),
  resetAvklartefaktaState: () => dispatch(avklartefaktaOperations.resetAvklartefaktaState()),
  resetBehandlingsgrunnlagState: () => dispatch(behandlingsgrunnlagOperations.resetBehandlingsgrunnlagState()),
  resetLovvalgsperiode: () => dispatch(lovvalgsperioderOperations.resetLovvalgsperioderState()),
  resetBehandlingerState: () => dispatch(behandlingerOperations.resetBehandlingerState()),
  resetBehandlingsPerioderState: () => dispatch(behandlingsperioderOperations.resetPerioderState()),
  sendAvklartefakta: (behandlingID, body) => dispatch(avklartefaktaOperations.send(behandlingID, body)),
  sendVilkar: (behandlingID, body) => dispatch(vilkarOperations.send(behandlingID, body)),
  oppdaterVilkarState: skjema => dispatch(vilkarOperations.oppdaterVilkarState(skjema)),
  oppdaterBehandlingerState: skjema => dispatch(behandlingsperioderOperations.oppdaterPerioderState(skjema)),
  sendLovvalgsperioder: (behandlingID, body) => dispatch(lovvalgsperioderOperations.send(behandlingID, body)),
  lagrePerioder: () => dispatch(behandlingsperioderOperations.lagre()),
  sendAnmodningsperioder: (behandlingID, body) => dispatch(anmodningsperioderOperations.send(behandlingID, body)),
  lagreAllData: () => dispatch(datalastingOperations.lagreAllData()),
  oppdaterBehandlingsStatus: behandlingsstatus => dispatch(behandlingerOperations.oppdaterBehandlingsStatus(behandlingsstatus)),
  resetSaksopplysninger: () => dispatch(datalastingOperations.resetSaksopplysninger()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksbehandling));
