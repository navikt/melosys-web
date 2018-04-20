import React, { Component } from 'react';
import PT from 'prop-types';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';

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
  static propTypes = {
    match: PT.object.isRequired,
    hentJournalOppgave: PT.func.isRequired,
    journalforing: PT.object,
    journalpostID: PT.string,
    journalforingSkjemaVerdier: PT.object,
    dokumenttitler: PT.arrayOf(MPT.Kodeverk).isRequired,
    vedleggstitler: PT.arrayOf(MPT.Kodeverk).isRequired,
  };

  static defaultProps = {
    journalforing: {},
    journalpostID: 'DOC_321',
    journalforingSkjemaVerdier: {},
  };

  componentDidMount() {
    const { journalpostID } = this.props.match.params;
    this.props.hentJournalOppgave(journalpostID);
  }

  render() {
    const {
      journalforing, dokumenttitler, vedleggstitler, journalforingSkjemaVerdier,
    } = this.props;

    return (
      <div className="journalforing">
        <h1>Journalføring</h1>
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="4">
              <Nav.Panel>
                <Informasjon journalforing={journalforing} journalforingSkjemaVerdier={journalforingSkjemaVerdier} dokumenttitler={dokumenttitler} vedleggstitler={vedleggstitler} />
              </Nav.Panel>
            </Nav.Column>
            <Nav.Column xs="8">
              <Nav.Panel>
                <Dokument />
              </Nav.Panel>
            </Nav.Column>
          </Nav.Row>
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
  dokumenttitler: KodeverkSelectors.dokumenttitlerSelector(state),
  vedleggstitler: KodeverkSelectors.vedleggstitlerSelector(state),
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
  initialValues: {
    brukersID: journalforingSelectors.JournalforingBruker(state).ID,
    brukersNavn: journalforingSelectors.JournalforingBruker(state).navn,
    erBrukerAvsender: journalforingSelectors.JournalforingAlle(state).erBrukerAvsender,
    avsendersID: journalforingSelectors.JournalforingAvsender(state).ID,
    avsendersNavn: journalforingSelectors.JournalforingAvsender(state).navn,
    dokumentTittel: journalforingSelectors.JournalforingDokument(state).tittel.kode,
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
    'brukersID',
  ],
  updateUnregisteredFields: true,
  validate: Journalforing.validering,
  onSubmit: () => {},
})(Journalforing)));
