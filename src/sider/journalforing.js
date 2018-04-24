import React, { Component } from 'react';
import PT from 'prop-types';
import { reduxForm, change } from 'redux-form';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as Nav from '../utils/navFrontend';
import * as Api from '../services/api';
import * as MPT from '../proptypes';
import * as Konstanter from '../constants';

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
import { PersonOperations } from '../ducks/person';
import { OrganisasjonOperations } from '../ducks/organisasjon';

class Journalforing extends Component {
  static propTypes = {
    match: PT.object.isRequired,
    hentJournalOppgave: PT.func.isRequired,
    sendNyFagsakTilJournalforing: PT.func.isRequired,
    sokFnrDnr: PT.func.isRequired,
    sokOrgnr: PT.func.isRequired,
    oppdaterFormFelt: PT.func.isRequired,
    journalforing: PT.object,
    journalpostID: PT.string,
    pdfDokument: PT.string,
    saksTyper: PT.array,
    saksListe: PT.array,
    journalforingSkjemaVerdier: PT.object,
    dokumentTittel: PT.arrayOf(MPT.Kodeverk).isRequired,
    vedleggsTitler: PT.arrayOf(MPT.Kodeverk).isRequired,
    settBrukerSomAvsender: PT.func.isRequired,
  };

  static defaultProps = {
    journalforing: {},
    journalpostID: 'DOC_321',
    pdfDokument: '',
    saksTyper: [],
    saksListe: [],
    journalforingSkjemaVerdier: {},
  };

  componentDidMount() {
    const { journalpostID } = this.props.match.params;
    this.props.hentJournalOppgave(journalpostID);
  }

  componentWillReceiveProps(nextProps) {
    const { erBrukerAvsender, brukersID } = nextProps.journalforingSkjemaVerdier;

    if (erBrukerAvsender) {
      const { brukersID, brukersNavn } = nextProps.journalforingSkjemaVerdier;
      this.props.settBrukerSomAvsender(brukersID, brukersNavn);
    }

    if (brukersID.length === Konstanter.ANTALL_TALL_I_DNR || brukersID.length === Konstanter.ANTALL_TALL_I_FNR) {
      this.props.hentRelevanteFagsaker(brukersID);
    }
  }

  knyttTilEksisterendeSak = () => {
    const { journalforingSkjemaVerdier: { knyttTilSaksID } } = this.props;

    return knyttTilSaksID !== undefined;
  }

  hentBruker = value => {
    const { sokFnrDnr, oppdaterFormFelt } = this.props;
    const targetFeltNavn = 'brukersNavn';
    if (value.length !== Konstanter.ANTALL_TALL_I_FNR && value.length !== Konstanter.ANTALL_TALL_I_DNR) { return; }

    sokFnrDnr(value).then(response => oppdaterFormFelt(targetFeltNavn, response.sammensattNavn));
  }

  hentAvsender = value => {
    const { sokOrgnr, sokFnrDnr, oppdaterFormFelt } = this.props;
    const targetFeltNavn = 'avsenderNavn';

    switch (value.length) {
      case Konstanter.ANTALL_TALL_I_ORGNR: {
        sokOrgnr(value).then(response => oppdaterFormFelt(targetFeltNavn, response.navn));
        break;
      }
      case Konstanter.ANTALL_TALL_I_FNR:
      case Konstanter.ANTALL_TALL_I_DNR: {
        sokFnrDnr(value).then(response => oppdaterFormFelt(targetFeltNavn, response.sammensattNavn));
        break;
      }
      default:
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
      journalforing, dokumentTittel, vedleggsTitler, saksTyper, journalforingSkjemaVerdier, saksListe, pdfDokument,
    } = this.props;

    const {
      knyttTilEksisterendeSak, opprettNyFagsakSubmit, hentAvsender, hentBruker,
    } = this;

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
                    sakstyper={saksTyper}
                    journalforingSkjemaVerdier={journalforingSkjemaVerdier}
                    hentAvsender={hentAvsender}
                    hentBruker={hentBruker}
                    dokumentTittel={dokumentTittel}
                    vedleggsTitler={vedleggsTitler}
                  />
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
  dokumentTittel: KodeverkSelectors.dokumenttitlerSelector(state),
  vedleggsTitler: KodeverkSelectors.vedleggstitlerSelector(state),
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
  saksListe: journalforingSelectors.JournalforingAlle(state).saksListe,
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
  oppdaterFormFelt: (feltNavn, verdi) => dispatch(change('journalforing', feltNavn, verdi)),
  sokFnrDnr: fnr => PersonOperations.hentPerson(fnr),
  sokOrgnr: orgnr => OrganisasjonOperations.hentOrganisasjon(orgnr),
  sendNyFagsakTilJournalforing: data => Api.sendNyFagsakTilJournalforing(data),
  hentRelevanteFagsaker: id => dispatch(journalforingOperations.sokFagsaker(id)),
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
    'knyttTilSaksID',
  ],
  updateUnregisteredFields: true,
  validate: Journalforing.validering,
  onSubmit: () => {},
})(Journalforing)));
