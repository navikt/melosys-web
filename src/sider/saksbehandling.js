import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';

import DialogboksOppfriskSak from '../felles-komponenter/dialogboks/dialogboksOppfrisk';
import DialogboksVenter from '../felles-komponenter/dialogboks/dialogboksVenter';
import DialogboksHenleggSak from '../felles-komponenter/dialogboks/dialogboksHenlegg';
import { Saksopplysninger } from './saksopplysninger';

import SideDialog from '../felles-komponenter/sideDialog/sideDialog';
import SideOppsummering from '../felles-komponenter/sideOppsummering';

import { fagsakOperations, fagsakSelectors } from '../ducks/fagsaker/';
import { vilkarOperations, vilkarSelectors } from '../ducks/vilkar/';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../ducks/avklartefakta/';
import { saksopplysningerOperations, saksopplysningerSelectors } from '../ducks/saksopplysninger';
import { oppgaverOperations } from '../ducks/oppgaver/';
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from '../ducks/lovvalgsperioder/';
import { soknadOperations, soknadSelectors } from '../ducks/soknad/';
import * as Api from '../services/api';

import './saksbehandling.css';
import '../felles-komponenter/skjema/skjema.css';
import { formSelectors } from '../ducks/form';
import { behandlingerOperations, behandlingerSelectors } from '../ducks/behandlinger';

class Saksbehandling extends Component {
  static propTypes = {
    avklartefakta: PT.array,
    hentFagsaker: PT.func.isRequired,
    hentSoknad: PT.func.isRequired,
    history: PT.object.isRequired,
    match: PT.object.isRequired,
    oppfriskSaksopplysninger: PT.func.isRequired,
    resetFagsakState: PT.func.isRequired,
    resetVilkarState: PT.func.isRequired,
    resetAvklartefaktaState: PT.func.isRequired,
    resetSoknadState: PT.func.isRequired,
    resetLovvalgsperiode: PT.func.isRequired,
    sjekkOppfriskningStatus: PT.func.isRequired,
    oppsummering: MPT.Oppsummering,
    sendSoknad: PT.func.isRequired,
    soknad: PT.object,
    vilkar: PT.array,
  };

  static defaultProps = {
    avklartefakta: [],
    oppsummering: {},
    soknad: {},
    vilkar: [],
  };

  state = {
    visOppfriskDialog: false,
    oppfriskningBlokkererInnhold: false,
    visHenleggDialog: false,
  };

  async componentDidMount() {
    await this.lastInnSaksopplysninger();
  }

  async componentWillUnmount() {
    await this.props.resetFagsakState();
    await this.props.resetAvklartefaktaState();
    await this.props.resetLovvalgsperiode();
    await this.props.resetVilkarState();
    await this.props.resetSoknadState();
  }

  lastInnSaksopplysninger = async () => {
    const {
      hentFagsaker, hentSoknad,
      sjekkOppfriskningStatus,
    } = this.props;
    const { snr } = this.props.match.params;
    const response = await hentFagsaker(snr);
    const { behandlinger } = response.data;

    if (!behandlinger) return false;
    const { oppsummering: { behandlingID } } = behandlinger[0];

    // Sjekk om saken er iferd under oppdatering
    const oppfriskningStatus = await sjekkOppfriskningStatus(behandlingID);
    const { data: status } = oppfriskningStatus;

    if (status === 'PROGRESS') {
      this.blokkerInnholdMedOppfriskSpinner();
      return false;
    }

    await hentSoknad(behandlingID);
    return true;
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

  /* eslint-disable */
  lagreOgLukk = async () => {
    const {
      avklartefakta,
      history,
      hentOppgaver,
      oppsummering,
      soknad,
      sendSoknad,
      sendAvklartefakta,
      sendVilkar,
      vilkar,
    } = this.props;
    const { behandlingID } = oppsummering;

    await sendSoknad(behandlingID, soknad);
    await sendAvklartefakta(behandlingID, avklartefakta);
    await sendVilkar(behandlingID, vilkar);
    await hentOppgaver();
    history.push('/');
  };
  /* eslint-enable */

  /* eslint-disable */
  tilbakeleggeHandle = async () => {
    const { tilbakeleggeOppgave, oppsummering } = this.props;
    const { behandlingID } = oppsummering;
    const venterPaaDokumentasjon = true;

    await tilbakeleggeOppgave(behandlingID, venterPaaDokumentasjon);
    this.lagreOgLukk();
  };
  /* eslint-enable */

  lagreBehandlingerHandler = async () => {
    const { behandlinger, sendPerioder, oppsummering: { behandlingID } } = this.props;
    await sendPerioder(behandlingID, behandlinger);
  };

  lagreVilkarHandler = async () => {
    const bid = this.props.oppsummering.behandlingID;
    const { vilkar } = this.props;
    const { sendVilkar } = this.props;
    await sendVilkar(bid, vilkar);
  };

  lagreAvklartefaktaHandler = async () => {
    const bid = this.props.oppsummering.behandlingID;
    const { avklartefakta } = this.props;
    const { sendAvklartefakta } = this.props;
    await sendAvklartefakta(bid, avklartefakta);
  };

  lagreLovvalgsperioderHandler = async () => {
    const bid = this.props.oppsummering.behandlingID;
    const { lovvalgsperioder } = this.props;
    const { sendLovvalgsperioder } = this.props;
    await sendLovvalgsperioder(bid, lovvalgsperioder);
  };

  henleggSak = async data => {
    const { oppsummering } = this.props;
    const { saksnummer } = oppsummering;
    await Api.Fagsaker.henlegg(saksnummer, data);
  };

  /* eslint-disable */
  henleggHandle = async data => {
    const {
      skjema,
      oppdaterAvklarteFaktaState,
      oppdaterVilkarState,
      oppdaterLovvalgperioderState,
      oppdaterBehandlingerState,
      history,
    } = this.props;

    await oppdaterAvklarteFaktaState(skjema);
    await oppdaterVilkarState(skjema);
    await oppdaterLovvalgperioderState(skjema);
    await oppdaterBehandlingerState(skjema);

    await this.lagreVilkarHandler();
    await this.lagreAvklartefaktaHandler();
    await this.lagreLovvalgsperioderHandler();
    await this.lagreBehandlingerHandler();
    await this.henleggSak(data);
    history.push('/');
  };
  /* eslint-enable */

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
          <DialogboksHenleggSak
            avbryt={this.skjulHenleggDialog}
            henleggHandle={this.henleggHandle}
          />
        }
      </div>
    );
  }
}

Saksbehandling.propTypes = {
  sendVilkar: PT.func.isRequired,
  sendAvklartefakta: PT.func.isRequired,
  sendPerioder: PT.func.isRequired,
  behandlinger: PT.object.isRequired,
  lovvalgsperioder: PT.array.isRequired,
  sendLovvalgsperioder: PT.func.isRequired,
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
  oppfriskSaksopplysninger: saksnummer => saksopplysningerOperations.oppfrisk(saksnummer),
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  resetVilkarState: () => dispatch(vilkarOperations.resetVilkarState()),
  resetAvklartefaktaState: () => dispatch(avklartefaktaOperations.resetAvklartefaktaState()),
  resetSoknadState: () => dispatch(soknadOperations.resetSoknadState()),
  resetLovvalgsperiode: () => dispatch(lovvalgsperioderOperations.resetLovvalgsperioderState()),
  hentSoknad: bid => dispatch(soknadOperations.hent(bid)),
  sendAvklartefakta: (behandlingID, body) => dispatch(avklartefaktaOperations.send(behandlingID, body)),
  sendSoknad: (bid, dokument) => dispatch(soknadOperations.send(bid, dokument)),
  sendVilkar: (behandlingID, body) => dispatch(vilkarOperations.send(behandlingID, body)),
  tilbakeleggeOppgave: (oppgaveID, venterPaaDokumentasjon) => oppgaverOperations.tilbakelegge(oppgaveID, venterPaaDokumentasjon),
  hentOppgaver: () => dispatch(oppgaverOperations.hent()),
  oppdaterAvklarteFaktaState: skjema => dispatch(avklartefaktaOperations.oppdaterAvklarteFaktaState(skjema)),
  oppdaterVilkarState: skjema => dispatch(vilkarOperations.oppdaterVilkarState(skjema)),
  oppdaterLovvalgperioderState: skjema => dispatch(lovvalgsperioderOperations.oppdaterLovvalgsperioderState(skjema)),
  oppdaterBehandlingerState: skjema => dispatch(behandlingerOperations.oppdaterPerioderState(skjema)),
  sendLovvalgsperioder: (behandlingID, body) => dispatch(lovvalgsperioderOperations.send(behandlingID, body)),
  sendPerioder: (behandlingID, body) => dispatch(behandlingerOperations.sendPerioder(behandlingID, body)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksbehandling));
