import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import { withRouter } from 'react-router-dom';

import * as Utils from '../../utils';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes';

import DialogboksOppfriskSak from '../../felleskomponenter/dialogboks/dialogboksOppfrisk';
import DialogboksVenter from '../../felleskomponenter/dialogboks/dialogboksVenter';
import DialogboksHenlegg from '../../felleskomponenter/dialogboks/dialogboksHenlegg';
import { Saksopplysninger } from './komponenter/saksopplysninger';

import SideDialog from '../../soknad-komponenter/sideDialog/sideDialog';
import SideOppsummering from '../../soknad-komponenter/sideOppsummering';

import { fagsakOperations, fagsakSelectors } from '../../ducks/fagsaker';
import { behandlingsresultatOperations } from '../../ducks/behandlingsresultat';
import { behandlingerOperations, behandlingerSelectors } from '../../ducks/behandlinger';
import { anmodningsperioderOperations, anmodningsperioderSelectors } from '../../ducks/anmodningsperioder';
import { vilkarOperations, vilkarSelectors } from '../../ducks/vilkar';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../ducks/avklartefakta';
import { saksopplysningerOperations, saksopplysningerSelectors } from '../../ducks/saksopplysninger';
import { oppgaverOperations } from '../../ducks/oppgaver';
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from '../../ducks/lovvalgsperioder';
import { soknadOperations, soknadSelectors, soknadActions } from '../../ducks/soknad';
import { behandlingsperioderOperations, behandlingsperioderSelectors } from '../../ducks/behandlingsperioder';
import { formSelectors } from '../../ducks/form';
import * as Api from '../../services/api';

import './saksbehandling.css';

class Saksbehandling extends Component {
  state = {
    visOppfriskDialog: false,
    oppfriskningBlokkererInnhold: false,
    visHenleggDialog: false,
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
    this.props.resetSoknadState();
    this.props.resetBehandlingsPerioderState();
  }

  lastInnSaksopplysninger = async () => {
    const { match, location } = this.props;
    const { snr } = match.params;
    const behandlingID = Utils.queryString.getParam(location, 'behandlingID');
    this.setState({ behandlingID: Utils._toInteger(behandlingID) });

    const {
      hentFagsaker, hentBehandling, hentBehandlingsresultat,
      hentSoknad, sjekkOppfriskningStatus,
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
        this.blokkerInnholdMedOppfriskSpinner();
        return false;
      }

      await hentSoknad(behandlingID);
      return true;
    } catch (e) {
      Utils.logger.error(e);
    }
    return false;
  };

  blokkerInnholdMedOppfriskSpinner = () => {
    this.setState({ oppfriskningBlokkererInnhold: true });
  };

  lagreSoknadOgOppfriskSaksopplysninger = async () => {
    const { behandlingID } = this.state;
    const { oppfriskSaksopplysninger, sendSoknad, soknad } = this.props;
    await sendSoknad(behandlingID, soknad);
    await oppfriskSaksopplysninger(behandlingID);
    this.blokkerInnholdMedOppfriskSpinner();
  };

  navigerTilOversiktSide = () => {
    this.skjulOppfriskBekreftelse();
    this.props.history.push('/');
  };

  visOppfriskBekreftelse = () => {
    this.setState({ visOppfriskDialog: true });
  };

  skjulOppfriskBekreftelse = () => {
    this.setState({ visOppfriskDialog: false });
    this.setState({ oppfriskningBlokkererInnhold: false });
  };

  visHenleggDialog = () => {
    this.setState({ visHenleggDialog: true });
  };

  skjulHenleggDialog = () => {
    this.setState({ visHenleggDialog: false });
  };

  hentBehandlingStatus = async () => {
    const { behandlingID } = this.state;
    const { sjekkOppfriskningStatus } = this.props;
    const oppfriskning = await sjekkOppfriskningStatus(behandlingID);

    if (oppfriskning && oppfriskning.response) {
      this.skjulOppfriskBekreftelse();
    } else if (oppfriskning.data === 'DONE') {
      this.skjulOppfriskBekreftelse();
      this.lastInnSaksopplysninger();
    }
  };

  lagreOgLukk = async () => {
    this.lagreAllData();
    const { history, hentOppgaveOversikt } = this.props;
    await hentOppgaveOversikt();
    history.push('/');
  };

  tilbakeleggeHandle = async () => {
    const { behandlingID } = this.state;
    const { tilbakeleggeOppgave } = this.props;
    const venterPaaDokumentasjon = true;

    await tilbakeleggeOppgave(behandlingID, venterPaaDokumentasjon);
    this.lagreOgLukk();
  };

  lagreSoknadHandler = async () => {
    const { behandlingID } = this.state;
    const { skjema, inngang_skjema, oppdaterSoknadState } = this.props;
    await oppdaterSoknadState({ ...skjema, ...inngang_skjema });

    const { soknad, sendSoknad } = this.props;
    sendSoknad(behandlingID, soknad);
  };

  lagreVilkarHandler = async () => {
    const { behandlingID } = this.state;

    const { sendVilkar, vilkar } = this.props;
    sendVilkar(behandlingID, vilkar);
  };

  lagreAvklartefaktaHandler = async () => {
    const { behandlingID } = this.state;
    const { sendAvklartefakta, avklartefakta } = this.props;

    sendAvklartefakta(behandlingID, avklartefakta);
  };

  lagreLovvalgsperioderHandler = async () => {
    const { behandlingID } = this.state;
    const { sendLovvalgsperioder, lovvalgsperioder } = this.props;

    sendLovvalgsperioder(behandlingID, lovvalgsperioder);
  };

  lagreAnmodningsperioderHandler = async () => {
    const { behandlingID } = this.state;
    const { sendAnmodningsperioder, anmodningsperioder } = this.props;

    sendAnmodningsperioder(behandlingID, { anmodningsperioder });
  };

  oppdaterOgLagreBehandlingerHandler = async () => {
    const { skjema, artikkel16_skjema, oppdaterBehandlingerState } = this.props;
    await oppdaterBehandlingerState({ ...skjema, ...artikkel16_skjema });

    this.lagreBehandlinger();
  };

  lagreBehandlinger = () => {
    const { behandlingID } = this.state;
    const { behandlingsPeriode, sendPerioder } = this.props;
    sendPerioder(behandlingID, behandlingsPeriode);
  };

  lagreAllData = async (ignorerLovvalgsperioder = false) => {
    const {
      lagreSoknadHandler,
      lagreVilkarHandler,
      lagreAvklartefaktaHandler,
      lagreLovvalgsperioderHandler,
      lagreAnmodningsperioderHandler,
      oppdaterOgLagreBehandlingerHandler,
    } = this;

    try {
      await Promise.all([
        lagreSoknadHandler(),
        lagreVilkarHandler(),
        lagreAvklartefaktaHandler(),
        oppdaterOgLagreBehandlingerHandler(),
      ]);

      lagreAnmodningsperioderHandler();
      if (!ignorerLovvalgsperioder) lagreLovvalgsperioderHandler();
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  henleggHandle = async data => {
    try {
      await this.lagreAllData();
      await this.henleggSak(data);
    } catch (e) {
      Utils.logger.error(e);
    } finally {
      this.props.history.push('/');
    }
  };

  henleggSak = async data => {
    const { fagsak: { saksnummer } } = this.props;
    Api.Fagsaker.henlegg(saksnummer, data);
  };

  avsluttSakSomBortfalt = () => {
    const { fagsak: { saksnummer } } = this.props;
    Api.Fagsaker.bortfall(saksnummer).catch(err => Utils.logger.error(err));
    this.props.history.push('/');
  };

  render() {
    const { redigerbart } = this.props;
    const { behandlingID } = this.state;
    const { blokkerInnholdMedOppfriskSpinner } = this;

    if (Utils._isNil(redigerbart)) return null;

    const oppfriskVenterDialog = this.state.oppfriskningBlokkererInnhold && (
      <div>
        <DialogboksVenter
          tittel="Oppdaterer registeropplysninger"
          tekst="Vent mens registeropplysningene hentes på nytt fra TPS, Aa-register, Medl etc."
          synlig
          tilForsiden={this.navigerTilOversiktSide}
          oppdater={this.hentBehandlingStatus}
        />
      </div>
    );

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
                lagreAllData={this.lagreAllData}
              />
            </Nav.Column>
            <Nav.Column xs="5">
              <SideOppsummering
                behandlingID={behandlingID}
                avsluttSakSomBortfalt={this.avsluttSakSomBortfalt}
                oppfriskSaksopplysningerHandle={this.visOppfriskBekreftelse}
                lagreOgLukkHandle={this.lagreOgLukk}
                tilbakeleggeHandle={this.tilbakeleggeHandle}
                visHenleggDialogHandle={this.visHenleggDialog}
                tilForsidenHandle={this.navigerTilOversiktSide}
              />
              <SideDialog behandlingID={behandlingID} />
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
        { oppfriskVenterDialog }
        {
          this.state.visOppfriskDialog &&
          <DialogboksOppfriskSak
            bekreft={this.lagreSoknadOgOppfriskSaksopplysninger}
            avbryt={this.skjulOppfriskBekreftelse}
            tilForsiden={this.navigerTilOversiktSide}
            oppdater={this.hentBehandlingStatus}
          />
        }
        {
          this.state.visHenleggDialog &&
          <DialogboksHenlegg
            avbryt={this.skjulHenleggDialog}
            henleggHandle={this.henleggHandle}
          />
        }
      </div>
    );
  }
}

Saksbehandling.propTypes = {
  redigerbart: PT.bool,
  avklartefakta: MPT.AvklartefaktaListe,
  fagsak: MPT.Fagsak,
  soknad: MPT.Soknad,
  vilkar: PT.array, // TODO lag proptype
  behandlingsPeriode: PT.object.isRequired, // TODO lag proptype
  lovvalgsperioder: PT.array.isRequired, // TODO lag proptype
  history: PT.object.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  skjema: PT.object,
  artikkel16_skjema: PT.object,
  inngang_skjema: PT.object,
  // Funcs
  hentFagsaker: PT.func.isRequired,
  hentBehandling: PT.func.isRequired,
  hentBehandlingsresultat: PT.func.isRequired,
  hentSoknad: PT.func.isRequired,
  oppfriskSaksopplysninger: PT.func.isRequired,
  resetFagsakState: PT.func.isRequired,
  resetBehandlingsresultatState: PT.func.isRequired,
  resetVilkarState: PT.func.isRequired,
  resetAvklartefaktaState: PT.func.isRequired,
  resetSoknadState: PT.func.isRequired,
  resetBehandlingerState: PT.func.isRequired,
  resetBehandlingsPerioderState: PT.func.isRequired,
  resetLovvalgsperiode: PT.func.isRequired,
  sjekkOppfriskningStatus: PT.func.isRequired,
  sendSoknad: PT.func.isRequired,
  hentOppgaveOversikt: PT.func.isRequired,
  tilbakeleggeOppgave: PT.func.isRequired,
  oppdaterSoknadState: PT.func.isRequired,
  sendVilkar: PT.func.isRequired,
  sendAvklartefakta: PT.func.isRequired,
  sendLovvalgsperioder: PT.func.isRequired,
  sendPerioder: PT.func.isRequired,
  oppdaterVilkarState: PT.func.isRequired,
  oppdaterAvklarteFaktaState: PT.func.isRequired,
  oppdaterLovvalgperioderState: PT.func.isRequired,
  oppdaterBehandlingerState: PT.func.isRequired,
  anmodningsperioder: PT.array,
  sendAnmodningsperioder: PT.func.isRequired,
};

Saksbehandling.defaultProps = {
  redigerbart: null,
  avklartefakta: [],
  fagsak: {},
  soknad: {},
  vilkar: [],
  skjema: {},
  anmodningsperioder: [],
  artikkel16_skjema: {},
  inngang_skjema: {},
};
/** Mapper både fast tekst inn til de forskjellige panelene i tillegg til å
 * mappe verdier fra søknaden (soknad) ut til Redux Form via initialValue.
 * @param state
 */
const mapStateToProps = state => ({
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  oppfriskning: saksopplysningerSelectors.SaksopplysningerSelector(state),
  soknad: soknadSelectors.SoknadSelector(state),
  vilkar: vilkarSelectors.VilkarSelector(state),
  skjema: formSelectors.SoknadenFormSelector(state).values,
  inngang_skjema: formSelectors.InngangFormSelector(state).values,
  artikkel16_skjema: formSelectors.Artikkel16AnmodningFormSelector(state).values,
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  behandlingsPeriode: behandlingsperioderSelectors.behandlingsPerioderSelector(state),
  anmodningsperioder: anmodningsperioderSelectors.AnmodningsperioderSelector(state),
});

const mapDispatchToProps = dispatch => ({
  sjekkOppfriskningStatus: behandlingID => dispatch(saksopplysningerOperations.sjekkStatus(behandlingID)),
  hentFagsaker: saksnummer => dispatch(fagsakOperations.hent(saksnummer)),
  hentBehandling: behandlingID => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentBehandlingsresultat: bid => dispatch(behandlingsresultatOperations.hent(bid)),
  hentSoknad: bid => dispatch(soknadOperations.hent(bid)),
  hentOppgaveOversikt: () => dispatch(oppgaverOperations.oversikt()),
  oppfriskSaksopplysninger: saksnummer => saksopplysningerOperations.oppfrisk(saksnummer),
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  resetBehandlingsresultatState: () => dispatch(behandlingsresultatOperations.resetBehandlingsresultatState()),
  resetVilkarState: () => dispatch(vilkarOperations.resetVilkarState()),
  resetAvklartefaktaState: () => dispatch(avklartefaktaOperations.resetAvklartefaktaState()),
  resetSoknadState: () => dispatch(soknadOperations.resetSoknadState()),
  resetLovvalgsperiode: () => dispatch(lovvalgsperioderOperations.resetLovvalgsperioderState()),
  resetBehandlingerState: () => dispatch(behandlingerOperations.resetBehandlingerState()),
  resetBehandlingsPerioderState: () => dispatch(behandlingsperioderOperations.resetPerioderState()),
  sendAvklartefakta: (behandlingID, body) => dispatch(avklartefaktaOperations.send(behandlingID, body)),
  sendSoknad: (bid, dokument) => dispatch(soknadOperations.send(bid, dokument)),
  sendVilkar: (behandlingID, body) => dispatch(vilkarOperations.send(behandlingID, body)),
  tilbakeleggeOppgave: (oppgaveID, venterPaaDokumentasjon) => oppgaverOperations.tilbakelegge(oppgaveID, venterPaaDokumentasjon),
  oppdaterAvklarteFaktaState: skjema => dispatch(avklartefaktaOperations.oppdaterAvklarteFaktaState(skjema)),
  oppdaterSoknadState: skjema => dispatch(soknadActions.oppdaterSoknadState(skjema)),
  oppdaterVilkarState: skjema => dispatch(vilkarOperations.oppdaterVilkarState(skjema)),
  oppdaterLovvalgperioderState: skjema => dispatch(lovvalgsperioderOperations.oppdaterLovvalgsperioderState(skjema)),
  oppdaterBehandlingerState: skjema => dispatch(behandlingsperioderOperations.oppdaterPerioderState(skjema)),
  sendLovvalgsperioder: (behandlingID, body) => dispatch(lovvalgsperioderOperations.send(behandlingID, body)),
  sendPerioder: (behandlingID, body) => dispatch(behandlingsperioderOperations.sendMedlemsPerioder(behandlingID, body)),
  sendAnmodningsperioder: (behandlingID, body) => dispatch(anmodningsperioderOperations.send(behandlingID, body)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksbehandling));
