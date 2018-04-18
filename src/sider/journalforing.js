import React, { Component } from 'react';
import PT from 'prop-types';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as Nav from '../utils/navFrontend';
import * as Api from '../services/api';
import Informasjon from '../felles-komponenter/journalforing/informasjon';
import Dokument from '../felles-komponenter/journalforing/dokument';
import OpprettNyFagSak from '../felles-komponenter/journalforing/opprettnyfagsak';

import {
  journalforingOperations,
  journalforingSelectors,
} from '../ducks/journalforing/';

import {
  KodeverkSelectors,
} from '../ducks/kodeverk/';

import {
  formSelectors,
} from '../ducks/form/';

import './journalforing.css';

class Journalforing extends Component {
  static propTypes = {
    match: PT.object.isRequired,
    history: PT.object.isRequired,
    hentJournalOppgave: PT.func.isRequired,
    sendNyFagsakTilJournalforing: PT.func.isRequired,
    journalforing: PT.object,
    journalpostID: PT.string,
    sakstyper: PT.array,
    journalforingSkjemaVerdier: PT.object,
  };
  static defaultProps = {
    journalforing: {},
    journalpostID: 'DOC_321',
    sakstyper: [],
    journalforingSkjemaVerdier: {},
  };

  componentDidMount() {
    const { journalpostID } = this.props.match.params;
    this.props.hentJournalOppgave(journalpostID);
  }

  overstyrSubmit = event => {
    event.preventDefault();
  }

  opprettNyFagsakSubmit = event => {
    event.preventDefault();
    const { sendNyFagsakTilJournalforing, journalforingSkjemaVerdier, history } = this.props;
    const {
      brukersFnr, journalforingOppholdsLand, erBrukerAvsender, avsenderFnrOrgnr, journalforingPeriodeFraOgMed, journalforingPeriodeTilOgMed,
    } = journalforingSkjemaVerdier;

    const data = {
      brukersFnr,
      erBrukerAvsender,
      avsenderFnrOrgnr,
      oppholdsLand: journalforingOppholdsLand,
      periode: {
        fom: journalforingPeriodeFraOgMed,
        tom: journalforingPeriodeTilOgMed,
      },
    };
    sendNyFagsakTilJournalforing(data).then(response => {
      // TODO validate response before redirect
      /* eslint-disable no-console */
      console.log(response);
      /* eslint-enable no-console */
      history.push('/');
    });
  };

  render() {
    const { sakstyper, journalforingSkjemaVerdier } = this.props;
    const { opprettNyFagsakSubmit } = this;

    return (
      <div className="journalforing">
        <h1>Journalføring</h1>
        <Nav.Container fluid>
          <form onSubmit={this.overstyrSubmit} >
            <Nav.Row>
              <Nav.Column xs="4">
                <Nav.Panel>
                  <Informasjon sakstyper={sakstyper} journalforingSkjemaVerdier={journalforingSkjemaVerdier} />
                  <OpprettNyFagSak opprettNyFagsakSubmit={opprettNyFagsakSubmit} />
                </Nav.Panel>
              </Nav.Column>
              <Nav.Column xs="8">
                <Nav.Panel>
                  <Dokument />
                </Nav.Panel>
              </Nav.Column>
            </Nav.Row>
          </form>
        </Nav.Container>
      </div>
    );
  }
}

Journalforing.validering = value => ({
  brukersFnr: value.brukersFnr === '' ? 'Vær snill å tast inn fødselsnummer eller D-nummer.' : false,
});

const mapStateToProps = state => ({
  journalforing: journalforingSelectors.JournalforingAlle(state),
  sakstyper: KodeverkSelectors.sakstyperSelector(state),
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
  initialValues: {
    brukersFnr: journalforingSelectors.JournalforingBruker(state).fnr,
    brukersNavn: journalforingSelectors.JournalforingBruker(state).sammensattNavn,
    erBrukerAvsender: journalforingSelectors.JournalforingAlle(state).erBrukerAvsender,
    avsenderFnrOrgnr: journalforingSelectors.JournalforingAvsender(state).fnr,
    avsenderNavn: journalforingSelectors.JournalforingAvsender(state).sammensattNavn,
  },
});

const mapDispatchToProps = dispatch => ({
  hentJournalOppgave: journalpostID => dispatch(journalforingOperations.hentJournalOppgave(journalpostID)),
  sendNyFagsakTilJournalforing: data => Api.sendNyFagsakTilJournalforing(data),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(reduxForm({
  form: 'journalforing',
  enableReinitialize: true,
  destroyOnUnmount: false,
  fields: [
    'brukersFnr',
  ],
  updateUnregisteredFields: true,
  validate: Journalforing.validering,
  onSubmit: () => {},
})(Journalforing)));
