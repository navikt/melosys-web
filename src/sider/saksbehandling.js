import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';

import DialogboksOppfriskSak from '../felles-komponenter/dialogboks/dialogboksOppfrisk';
import DialogboksVenter from '../felles-komponenter/dialogboks/dialogboksVenter';
import { Saksopplysninger } from './saksopplysninger';

import SideDialog from '../felles-komponenter/sideDialog/sideDialog';
import SideOppsummering from '../felles-komponenter/sideOppsummering';
import SideKommentarer from '../felles-komponenter/sideKommentarer';

import { fagsakOperations, fagsakSelectors } from '../ducks/fagsaker/';
import { vilkarOperations, vilkarSelectors } from '../ducks/vilkar/';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../ducks/avklartefakta/';
import { saksflytOperations, saksflytSelectors } from '../ducks/saksflyt';
import { oppgaverOperations } from '../ducks/oppgaver/';
import { lovvalgsperioderOperations } from '../ducks/lovvalgsperioder/';
import { soknadOperations, soknadSelectors } from '../ducks/soknad/';


import './saksbehandling.css';
import '../felles-komponenter/skjema/skjema.css';

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
    sjekkSaksflytStatus: PT.func.isRequired,
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
      sjekkSaksflytStatus,
    } = this.props;
    const { snr } = this.props.match.params;
    const response = await hentFagsaker(snr);
    const { behandlinger } = response.data;

    if (!behandlinger) return false;
    const { oppsummering: { behandlingID } } = behandlinger[0];

    const saksflyt = await sjekkSaksflytStatus(behandlingID);
    const { data: saksFlytData } = saksflyt;
    if (saksFlytData && saksFlytData.response) {
      this.skjulOppfriskBekreftelse();
    } else if (saksFlytData === 'PROGRESS') {
      this.blokkerInnholdMedOppfriskSpinner();
    } else {
      await hentSoknad(behandlingID);
    }

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

  hentBehandlingStatus = async () => {
    const { sjekkSaksflytStatus } = this.props;
    const { behandlingID } = this.props.oppsummering;
    const saksflyt = await sjekkSaksflytStatus(behandlingID);

    if (saksflyt && saksflyt.response) {
      this.skjulOppfriskBekreftelse();
    } else if (saksflyt.data === 'DONE') {
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
              />
              <SideDialog />
              <SideKommentarer />
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
      </div>
    );
  }
}

/** Mapper både fast tekst inn til de forskjellige panelene i tillegg til å
 * mappe verdier fra søknaden (soknad) ut til Redux Form via initialValue.
 * @param state
 */
const mapStateToProps = state => ({
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  saksflyt: saksflytSelectors.SaksflytSelector(state),
  soknad: soknadSelectors.SoknadSelector(state),
  vilkar: vilkarSelectors.VilkarSelector(state),
});

const mapDispatchToProps = dispatch => ({
  sjekkSaksflytStatus: behandlingID => dispatch(saksflytOperations.sjekkStatus(behandlingID)),
  hentFagsaker: saksnummer => dispatch(fagsakOperations.hent(saksnummer)),
  oppfriskSaksopplysninger: saksnummer => fagsakOperations.oppfrisk(saksnummer),
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
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksbehandling));
