import React, { Component } from 'react';
import PT from 'prop-types';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as Nav from '../utils/navFrontend';

import Informasjon from '../felles-komponenter/journalforing/informasjon';
import Dokument from '../felles-komponenter/journalforing/dokument';

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
  componentDidMount() {
    const { journalpostID } = this.props.match.params;
    this.props.hentJournalOppgave(journalpostID);
  }

  render() {
    const { sakstyper, journalforingSkjemaVerdier, dokumentURL } = this.props;

    return (
      <div className="journalforing">
        <h1>Journalføring</h1>
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="4">
              <Nav.Panel>
                <Informasjon sakstyper={sakstyper} journalforingSkjemaVerdier={journalforingSkjemaVerdier} />
              </Nav.Panel>
            </Nav.Column>
            <Nav.Column xs="8">
              <Nav.Panel>
                <Dokument dokumentURL={dokumentURL} />
              </Nav.Panel>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    );
  }
}

Journalforing.propTypes = {
  match: PT.object.isRequired,
  hentJournalOppgave: PT.func.isRequired,
  journalforing: PT.object,
  journalpostID: PT.string,
  dokumentURL: PT.string,
  sakstyper: PT.array,
  journalforingSkjemaVerdier: PT.object,
};

Journalforing.defaultProps = {
  journalforing: {},
  journalpostID: 'DOC_321',
  dokumentURL: '',
  sakstyper: [],
  journalforingSkjemaVerdier: {},
};

Journalforing.validering = value => ({
  brukersFnr: value.brukersFnr === '' ? 'Vær snill å tast inn fødselsnummer eller D-nummer.' : false,
});

const mapStateToProps = state => ({
  journalforing: journalforingSelectors.JournalforingAlle(state),
  sakstyper: KodeverkSelectors.sakstyperSelector(state),
  dokumentURL: journalforingSelectors.JournalforingDokument(state).url,
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
