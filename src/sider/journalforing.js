import React, { Component } from 'react';
import PT from 'prop-types';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as Nav from '../utils/navFrontend';

import Informasjon from '../felles-komponenter/journalforing/informasjon';
import EksisterendeSaker from '../felles-komponenter/journalforing/eksisterendeSaker';
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
    saksTyper: PT.array,
    saksListe: PT.array,
    journalforingSkjemaVerdier: PT.object,
  };
  static defaultProps = {
    journalforing: {},
    journalpostID: 'DOC_321',
    saksTyper: [],
    saksListe: [],
    journalforingSkjemaVerdier: {},
  };

  componentDidMount() {
    const { journalpostID } = this.props.match.params;
    this.props.hentJournalOppgave(journalpostID);
  }

  knyttTilEksisterendeSak = () => {
    const { journalforingSkjemaVerdier: { knyttTilSaksID } } = this.props;

    return knyttTilSaksID !== undefined;
  }

  render() {
    const { saksTyper, saksListe, journalforingSkjemaVerdier } = this.props;
    const { knyttTilEksisterendeSak } = this;

    return (
      <div className="journalforing">
        <h1>Journalføring</h1>
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="4">
              <Nav.Panel>
                <Informasjon sakstyper={saksTyper} journalforingSkjemaVerdier={journalforingSkjemaVerdier} />
                <EksisterendeSaker saksListe={saksListe} knyttTilEksisterendeSak={knyttTilEksisterendeSak} />
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
  saksTyper: KodeverkSelectors.sakstyperSelector(state),
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
  saksListe: journalforingSelectors.JournalforingAlle(state).saksListe,
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
    'knyttTilSaksID',
  ],
  updateUnregisteredFields: true,
  validate: Journalforing.validering,
  onSubmit: () => {},
})(Journalforing)));
