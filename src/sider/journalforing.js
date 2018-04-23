import React, { Component } from 'react';
import PT from 'prop-types';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as Nav from '../utils/navFrontend';
import * as Api from '../services/api';
import Informasjon from '../felles-komponenter/journalforing/informasjon';
import EksisterendeSaker from '../felles-komponenter/journalforing/eksisterendeSaker';
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
    hentJournalOppgave: PT.func.isRequired,
    sendNyFagsakTilJournalforing: PT.func.isRequired,
    journalforing: PT.object,
    journalpostID: PT.string,
    pdfDokument: PT.string,
    sakstyper: PT.array,
    journalforingSkjemaVerdier: PT.object,
  };
  static defaultProps = {
    journalforing: {},
    journalpostID: 'DOC_321',
    pdfDokument: '',
    sakstyper: [],
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

  overstyrSubmit = event => {
    event.preventDefault();
  }

  opprettNyFagsakSubmit = event => {
    event.preventDefault();
    const { sendNyFagsakTilJournalforing, journalforingSkjemaVerdier } = this.props;
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
      /* eslint-disable */
      console.log(response);
      alert('Denne er ikke avklart / implementert.');
      /* eslint-enable */
    });
  };

  render() {
    const {
      saksTyper, saksListe, journalforingSkjemaVerdier, pdfDokument
    } = this.props;
    const { knyttTilEksisterendeSak, opprettNyFagsakSubmit } = this;

    return (
      <div className="journalforing">
        <h1>Journalføring</h1>
        <Nav.Container fluid>
          <form onSubmit={this.overstyrSubmit} >
            <Nav.Row>
              <Nav.Column xs="4">
                <Nav.Panel>
                  <Informasjon sakstyper={saksTyper} journalforingSkjemaVerdier={journalforingSkjemaVerdier} />
                  <EksisterendeSaker saksListe={saksListe} knyttTilEksisterendeSak={knyttTilEksisterendeSak} />
                  <OpprettNyFagSak opprettNyFagsakSubmit={opprettNyFagsakSubmit} />
                </Nav.Panel>
              </Nav.Column>
              <Nav.Column xs="8">
                <Nav.Panel>
                  <Dokument pdfDokument={pdfDokument} />
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
  saksTyper: KodeverkSelectors.sakstyperSelector(state),
  pdfDokument: journalforingSelectors.JournalforingDokument(state).url,
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
  sendNyFagsakTilJournalforing: data => Api.sendNyFagsakTilJournalforing(data),
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
