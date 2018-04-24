import React, { Component } from 'react';
import PT from 'prop-types';
import { reduxForm, change } from 'redux-form';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as Nav from '../utils/navFrontend';
import * as Api from '../services/api';
import * as MPT from '../proptypes';

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
    hentJournalOppgave: PT.func.isRequired,
    sendNyFagsakTilJournalforing: PT.func.isRequired,
    journalforing: PT.object,
    journalpostID: PT.string,
    pdfDokument: PT.string,
    sakstyper: PT.array,
    journalforingSkjemaVerdier: PT.object,
    dokumentTittel: PT.arrayOf(MPT.Kodeverk).isRequired,
    vedleggsTitler: PT.arrayOf(MPT.Kodeverk).isRequired,
    settBrukerSomAvsender: PT.func.isRequired,
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

  componentWillReceiveProps(nextProps) {
    const { erBrukerAvsender } = nextProps.journalforingSkjemaVerdier;

    if (erBrukerAvsender) {
      const { brukersID, brukersNavn } = nextProps.journalforingSkjemaVerdier;
      this.props.settBrukerSomAvsender(brukersID, brukersNavn);
    }
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
      journalforing, dokumentTittel, vedleggsTitler, pdfDokument, journalforingSkjemaVerdier,
    } = this.props;
    const { opprettNyFagsakSubmit } = this;

    return (
      <div className="journalforing">
        <h1>Journalføring</h1>
        <Nav.Container fluid>
          <form onSubmit={this.overstyrSubmit} >
            <Nav.Row>
              <Nav.Column xs="4">
                <Nav.Panel>
                  <Informasjon
                    journalforing={journalforing} journalforingSkjemaVerdier={journalforingSkjemaVerdier} dokumentTittel={dokumentTittel} vedleggsTitler={vedleggsTitler} />
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
  sakstyper: KodeverkSelectors.sakstyperSelector(state),
  pdfDokument: journalforingSelectors.JournalforingDokument(state).url,
  dokumentTittel: KodeverkSelectors.dokumenttitlerSelector(state),
  vedleggsTitler: KodeverkSelectors.vedleggstitlerSelector(state),
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
  initialValues: {
    brukersID: journalforingSelectors.JournalforingBruker(state).ID,
    brukersNavn: journalforingSelectors.JournalforingBruker(state).navn,
    erBrukerAvsender: journalforingSelectors.JournalforingAlle(state).erBrukerAvsender,
    avsendersID: journalforingSelectors.JournalforingAvsender(state).ID,
    avsendersNavn: journalforingSelectors.JournalforingAvsender(state).navn,
    dokumentTittel: journalforingSelectors.JournalforingDokument(state).tittel.kode,
    vedleggsTitler: journalforingSelectors.JournalforingDokument(state).vedleggstitler,
  },
});

const mapDispatchToProps = dispatch => ({
  hentJournalOppgave: journalpostID => dispatch(journalforingOperations.hentJournalOppgave(journalpostID)),
  sendNyFagsakTilJournalforing: data => Api.sendNyFagsakTilJournalforing(data),
  settBrukerSomAvsender: (id, navn) => {
    dispatch(change('journalforing', 'avsendersID', id));
    dispatch(change('journalforing', 'avsendersNavn', navn));
  },
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
