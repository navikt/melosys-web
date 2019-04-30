import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import { withRouter } from 'react-router-dom';

import * as Utils from '../utils';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';

import DialogboksOppfriskSak from '../soknad-komponenter/dialogboks/dialogboksOppfrisk';
import DialogboksVenter from '../soknad-komponenter/dialogboks/dialogboksVenter';
import DialogboksHenlegg from '../soknad-komponenter/dialogboks/dialogboksHenlegg';
import { Saksopplysninger } from './saksopplysninger';

import SideDialog from '../soknad-komponenter/sideDialog/sideDialog';
import SideOppsummering from '../soknad-komponenter/sideOppsummering';

import { fagsakOperations, fagsakSelectors } from '../ducks/fagsaker/';
import { behandlingsresultatOperations } from '../ducks/behandlingsresultat/';

import { vilkarOperations, vilkarSelectors } from '../ducks/vilkar/';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../ducks/avklartefakta/';
import { saksopplysningerOperations, saksopplysningerSelectors } from '../ducks/saksopplysninger';
import { oppgaverOperations } from '../ducks/oppgaver/';
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from '../ducks/lovvalgsperioder/';
import { soknadOperations, soknadSelectors, soknadActions } from '../ducks/soknad/';
import { behandlingerOperations, behandlingerSelectors } from '../ducks/behandlinger';
import { formSelectors } from '../ducks/form';
import * as Api from '../services/api';

import './saksbehandling.css';
import '../soknad-komponenter/skjema/skjema.css';

class Saksbehandling extends Component {
  state = {
    visOppfriskDialog: false,
    oppfriskningBlokkererInnhold: false,
    visHenleggDialog: false,
  };

  componentDidMount() {
    this.lastInnSaksopplysninger();
  }

  componentWillUnmount() {
    this.props.resetFagsakState();
    this.props.resetAvklartefaktaState();
    this.props.resetLovvalgsperiode();
    this.props.resetVilkarState();
    this.props.resetSoknadState();
    this.props.resetBehandlingerState();
  }

  lastInnSaksopplysninger = async () => {
    const {
      hentFagsaker, hentBehandlingsresultat,
      hentSoknad, sjekkOppfriskningStatus,
    } = this.props;
    const { snr } = this.props.match.params;
    try {
      const response = await hentFagsaker(snr);
      const { behandlinger } = response.data;

      if (!behandlinger) return false;
      const { oppsummering: { behandlingID } } = behandlinger[0];

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
    const { oppfriskSaksopplysninger, sendSoknad } = this.props;
    const { behandlingID } = this.props.oppsummering;
    const { soknad } = this.props;
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
    const { sjekkOppfriskningStatus } = this.props;
    const { behandlingID } = this.props.oppsummering;
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
    const { tilbakeleggeOppgave, oppsummering } = this.props;
    const { behandlingID } = oppsummering;
    const venterPaaDokumentasjon = true;

    await tilbakeleggeOppgave(behandlingID, venterPaaDokumentasjon);
    this.lagreOgLukk();
  };

  lagreSoknadHandler = async () => {
    const { skjema, oppdaterSoknadState } = this.props;
    await oppdaterSoknadState(skjema);

    const { soknad, sendSoknad, oppsummering: { behandlingID } } = this.props;
    sendSoknad(behandlingID, soknad);
  };

  lagreVilkarHandler = async () => {
    const { sendVilkar, vilkar } = this.props;
    const bid = this.props.oppsummering.behandlingID;
    sendVilkar(bid, vilkar);
  };

  lagreAvklartefaktaHandler = async () => {
    const { sendAvklartefakta, avklartefakta } = this.props;
    const bid = this.props.oppsummering.behandlingID;
    sendAvklartefakta(bid, avklartefakta);
  };

  lagreLovvalgsperioderHandler = async () => {
    const { skjema, oppdaterLovvalgperioderState } = this.props;
    await oppdaterLovvalgperioderState(skjema);

    const { sendLovvalgsperioder, lovvalgsperioder } = this.props;
    const bid = this.props.oppsummering.behandlingID;
    sendLovvalgsperioder(bid, lovvalgsperioder);
  };

  lagreBehandlingerHandler = async () => {
    const { skjema, oppdaterBehandlingerState } = this.props;
    await oppdaterBehandlingerState(skjema);

    const { behandlinger, sendPerioder, oppsummering: { behandlingID } } = this.props;
    sendPerioder(behandlingID, behandlinger);
  };

  lagreAllData = async () => {
    const {
      lagreSoknadHandler,
      lagreVilkarHandler,
      lagreAvklartefaktaHandler,
      lagreLovvalgsperioderHandler,
      lagreBehandlingerHandler,
    } = this;

    try {
      await Promise.all([
        lagreSoknadHandler(),
        lagreVilkarHandler(),
        lagreAvklartefaktaHandler(),
        lagreBehandlingerHandler(),
      ]);

      lagreLovvalgsperioderHandler();
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
    const { oppsummering: { saksnummer } } = this.props;
    Api.Fagsaker.henlegg(saksnummer, data);
  };

  render() {
    const { oppsummering } = this.props;
    const { blokkerInnholdMedOppfriskSpinner } = this;

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
                blokkerInnholdMedOppfriskSpinner={blokkerInnholdMedOppfriskSpinner}
                lagreVilkarHandler={this.lagreVilkarHandler}
                lagreAvklartefaktaHandler={this.lagreAvklartefaktaHandler}
                lagreLovvalgsperioderHandler={this.lagreLovvalgsperioderHandler}
                lagreBehandlingerHandler={this.lagreBehandlingerHandler}
                lagreAllData={this.lagreAllData}
              />
            </Nav.Column>
            <Nav.Column xs="5">
              <SideOppsummering
                oppsummering={oppsummering}
                oppfriskSaksopplysningerHandle={this.visOppfriskBekreftelse}
                lagreOgLukkHandle={this.lagreOgLukk}
                tilbakeleggeHandle={this.tilbakeleggeHandle}
                visHenleggDialogHandle={this.visHenleggDialog}
                tilForsidenHandle={this.navigerTilOversiktSide}
              />
              <SideDialog />
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
  avklartefakta: PT.array,
  hentFagsaker: PT.func.isRequired,
  hentBehandlingsresultat: PT.func.isRequired,
  hentSoknad: PT.func.isRequired,
  history: PT.object.isRequired,
  match: PT.object.isRequired,
  oppfriskSaksopplysninger: PT.func.isRequired,
  resetFagsakState: PT.func.isRequired,
  resetBehandlingsresultatState: PT.func.isRequired,
  resetVilkarState: PT.func.isRequired,
  resetAvklartefaktaState: PT.func.isRequired,
  resetSoknadState: PT.func.isRequired,
  resetBehandlingerState: PT.func.isRequired,
  resetLovvalgsperiode: PT.func.isRequired,
  sjekkOppfriskningStatus: PT.func.isRequired,
  oppsummering: MPT.Oppsummering,
  sendSoknad: PT.func.isRequired,
  soknad: PT.object,
  vilkar: PT.array,
  hentOppgaveOversikt: PT.func.isRequired,
  tilbakeleggeOppgave: PT.func.isRequired,
  oppdaterSoknadState: PT.func.isRequired,
  sendVilkar: PT.func.isRequired,
  sendAvklartefakta: PT.func.isRequired,
  behandlinger: PT.object.isRequired,
  lovvalgsperioder: PT.array.isRequired,
  sendLovvalgsperioder: PT.func.isRequired,
  sendPerioder: PT.func.isRequired,
  oppdaterAvklarteFaktaState: PT.func.isRequired,
  oppdaterLovvalgperioderState: PT.func.isRequired,
  oppdaterBehandlingerState: PT.func.isRequired,
  skjema: PT.any,
};

Saksbehandling.defaultProps = {
  avklartefakta: [],
  oppsummering: {},
  soknad: {},
  vilkar: [],
  skjema: {},
};
/** Mapper både fast tekst inn til de forskjellige panelene i tillegg til å
 * mappe verdier fra søknaden (soknad) ut til Redux Form via initialValue.
 * @param state
 */
const mapStateToProps = state => ({
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  oppfriskning: saksopplysningerSelectors.SaksopplysningerSelector(state),
  soknad: soknadSelectors.SoknadSelector(state),
  vilkar: vilkarSelectors.VilkarSelector(state),
  skjema: formSelectors.SoknadenFormSelector(state).values,
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  behandlinger: behandlingerSelectors.behandlingerSelector(state),
});

const mapDispatchToProps = dispatch => ({
  sjekkOppfriskningStatus: behandlingID => dispatch(saksopplysningerOperations.sjekkStatus(behandlingID)),
  hentFagsaker: saksnummer => dispatch(fagsakOperations.hent(saksnummer)),
  hentBehandlingsresultat: bid => dispatch(behandlingsresultatOperations.hent(bid)),
  oppfriskSaksopplysninger: saksnummer => saksopplysningerOperations.oppfrisk(saksnummer),
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  resetBehandlingsresultatState: () => dispatch(behandlingsresultatOperations.resetBehandlingsresultatState()),
  resetVilkarState: () => dispatch(vilkarOperations.resetVilkarState()),
  resetAvklartefaktaState: () => dispatch(avklartefaktaOperations.resetAvklartefaktaState()),
  resetSoknadState: () => dispatch(soknadOperations.resetSoknadState()),
  resetLovvalgsperiode: () => dispatch(lovvalgsperioderOperations.resetLovvalgsperioderState()),
  resetBehandlingerState: () => dispatch(behandlingerOperations.resetPerioderState()),
  hentSoknad: bid => dispatch(soknadOperations.hent(bid)),
  sendAvklartefakta: (behandlingID, body) => dispatch(avklartefaktaOperations.send(behandlingID, body)),
  sendSoknad: (bid, dokument) => dispatch(soknadOperations.send(bid, dokument)),
  sendVilkar: (behandlingID, body) => dispatch(vilkarOperations.send(behandlingID, body)),
  tilbakeleggeOppgave: (oppgaveID, venterPaaDokumentasjon) => oppgaverOperations.tilbakelegge(oppgaveID, venterPaaDokumentasjon),
  hentOppgaveOversikt: () => dispatch(oppgaverOperations.oversikt()),
  oppdaterAvklarteFaktaState: skjema => dispatch(avklartefaktaOperations.oppdaterAvklarteFaktaState(skjema)),
  oppdaterSoknadState: skjema => dispatch(soknadActions.oppdaterSoknadState(skjema)),
  oppdaterLovvalgperioderState: skjema => dispatch(lovvalgsperioderOperations.oppdaterLovvalgsperioderState(skjema)),
  oppdaterBehandlingerState: skjema => dispatch(behandlingerOperations.oppdaterPerioderState(skjema)),
  sendLovvalgsperioder: (behandlingID, body) => dispatch(lovvalgsperioderOperations.send(behandlingID, body)),
  sendPerioder: (behandlingID, body) => dispatch(behandlingerOperations.sendPerioder(behandlingID, body)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksbehandling));
