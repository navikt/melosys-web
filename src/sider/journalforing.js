import React, { Component } from 'react';
import PT from 'prop-types';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as Nav from '../utils/navFrontend';

import Informasjon from '../felles-komponenter/journalforing/informasjon';
import {
  journalforingOperations,
  journalforingSelectors,
} from '../ducks/journalforing/';

import './journalforing.css';

class Journalforing extends Component {
  static propTypes = {
    match: PT.object.isRequired,
    hentJournalOppgave: PT.func.isRequired,
    journalforing: PT.object,
    journalpostID: PT.string,
  };
  static defaultProps = {
    journalforing: {},
    journalpostID: 'DOC_321',
  };

  componentDidMount() {
    const { journalpostID } = this.props.match.params;
    this.props.hentJournalOppgave(journalpostID);
  }

  render() {
    return (
      <div className="journalforing">
        <h1>Journalforing</h1>
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="6">
              <Nav.Panel>
                <Informasjon />
              </Nav.Panel>
            </Nav.Column>
            <Nav.Column xs="6">
              <Nav.Panel>
                dokumentvisning her
              </Nav.Panel>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    );
  }
}

Journalforing.validering = () => (true);

const mapStateToProps = state => ({
  journalforing: journalforingSelectors.AlleJournalforingData(state),
  initialValues: {
    brukersFnr: journalforingSelectors.JournalforingBruker(state).fnr,
    brukersNavn: journalforingSelectors.JournalforingBruker(state).sammensattNavn,
    erBrukerAvsender: journalforingSelectors.AlleJournalforingData(state).erBrukerAvsender,
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
  onSubmit: () => console.log('journalføring sendes'),
})(Journalforing)));
