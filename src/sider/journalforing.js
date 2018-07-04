/* eslint no-alert:off, consistent-return:off */
import React, { Component } from 'react';
import PT from 'prop-types';
import { reduxForm, autofill, setSubmitFailed, change } from 'redux-form';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import * as Nav from '../utils/navFrontend';
import * as Api from '../services/api';
import * as Konstanter from '../constants';
import Sticky from '../hjelpekomponenter/sticky';

import withErrorHandling from '../hoc/withErrorHandling';
import { formatterDatoTilNorsk, formatterDatoTilISO } from '../utils/dato';
import Informasjon from '../felles-komponenter/journalforing/informasjon';
import EksisterendeSaker from '../felles-komponenter/journalforing/eksisterendeSaker';
import PDFDokument from '../felles-komponenter/journalforing/pdfdokument';
import OpprettNyFagSak from '../felles-komponenter/journalforing/opprettnyfagsak';

import { journalforingValidering, erSkjemaGyldig } from '../felles-komponenter/skjema/validering/journalforing';
import {
  journalforingOperations,
  journalforingSelectors,
} from '../ducks/journalforing/';
import {
  fagsakOperations,
  fagsakSelectors,
} from '../ducks/fagsaker';
import { formSelectors } from '../ducks/form/';
import './journalforing.css';

class Journalforing extends Component {
  static propTypes = {
    match: PT.object.isRequired,
    history: PT.object.isRequired,
    hentJournalOppgave: PT.func.isRequired,
    hentFagsakListe: PT.func.isRequired,
    tilordneSak: PT.func.isRequired,
    opprettNySak: PT.func.isRequired,
    settFeltInnhold: PT.func.isRequired,
    settFeilFelt: PT.func.isRequired,
    settJournalforingHensikt: PT.func.isRequired,
    journalforing: PT.object,
    journalforingSkjemaVerdier: PT.object,
    fagsakListe: PT.array,
    valid: PT.bool.isRequired,
  };

  static defaultProps = {
    journalforing: {},
    fagsakListe: [],
    journalforingSkjemaVerdier: {},
  };

  componentDidMount() {
    const { journalpostID } = this.props.match.params;
    this.props.hentJournalOppgave(journalpostID);
  }

  componentWillReceiveProps(nextProps) {
    const { brukerID } = nextProps.journalforingSkjemaVerdier;
  }

  /** Handlers for de 2 individuelle knappene "knytt til sak" og "opprett ny sak" er egne
   * funksjoner. Allikevel trenger vi en default handler som Redux Form hekter på gjennom <form onsubmit="" .../>
   * @param event
   */
  overstyrSubmit = event => {
    event.preventDefault();
  };

  /** Selv om saksbehandler velger å avbryte journalføringsoppgaven vil den fortsatt ligge
   * i "Mine Oppgaver"-listen. Vi trenger derfor ikke å gi noen melding til backend om at
   * noe er avbrutt - kun redirecte til forsiden.
   */
  avbrytJournalforing = () => {
    this.props.history.push('/');
  };

  /** Ikke all informasjon som vises i skjemaet skal sendes tilbake til backend. Et eksempel på det er dato som
   * settes inn i skjemaet kun til info - ikke til endring.
   * Derfor må vi bygge opp og evt vaske et nytt objekt som kan sendes til backend.
   *
   * @returns {object} Objektet som skal sendes videre som payload.
   */
  vaskDokumentInformasjon = () => {
    const { oppgaveID, journalpostID } = this.props.match.params;
    const {
      journalforingSkjemaVerdier,
      journalforing: { dokument = {} },
    } = this.props;
    const {
      brukerID, avsenderID, avsenderNavn, dokumentTittel, vedleggsTitler = [],
    } = journalforingSkjemaVerdier;

    const { ID: dokumentID } = dokument;

    return {
      journalpostID,
      oppgaveID,
      brukerID,
      avsenderID,
      avsenderNavn,
      dokumentID,
      dokumenttittel: dokumentTittel,
      vedleggstitler: vedleggsTitler,
    };
  };

  /** Når saksbehandler klikker "knytt til eksisterende sak" skal det åpnes for validering av
   * relevante felter før saken tilordnes (sendes til API) og saksbehandler returneres til forsiden.
   * @returns {boolean}
   */
  knyttTilEksisterendeSak = () => {
    /* eslint no-unreachable:off */
    const {
      journalforingSkjemaVerdier: { saksnummer }, tilordneSak, history, settJournalforingHensikt, settFeilFelt,
    } = this.props;

    const { resetOpprettFagsakFelter } = this;

    const vasketJournalforing = { ...this.vaskDokumentInformasjon(), saksnummer };

    resetOpprettFagsakFelter();

    settJournalforingHensikt(Konstanter.JOURNALFORING_HENSIKT.KNYTT);

    // Manuell sjekk på validering og hensikt for å omgå race condition via props.
    if (!erSkjemaGyldig(this.props.journalforingSkjemaVerdier, Konstanter.JOURNALFORING_HENSIKT.KNYTT)) {
      settFeilFelt('vedleggsTitler', 'saksnummer');
      return false;
    }

    /* eslint-disable */
    alert('Denne funksjonen er ikke implementert ennå.');
    return;
    /* eslint-enable */

    tilordneSak(vasketJournalforing).then(response => {
      if (response.length === 0) {
        history.push('/');
      }
    });
  };

  brukerBleFunnetCallback = fnr => {
    console.log('brukerBleFunnetCallback', fnr)
    this.props.hentFagsakListe(fnr);
  }

  /** Når saksbehandler klikker "opprett sak" skal det åpnes for validering av
   * relevante felter før ny sak opprettes (sendes til API) og saksbehandler returneres til forsiden.
   * @returns {boolean}
   */
  opprettFagsak = () => {
    /* eslint no-unreachable:off */
    const {
      journalforingSkjemaVerdier, opprettNySak, history, settJournalforingHensikt, settFeilFelt,
    } = this.props;

    const { resetEksisterendeSakerFelter } = this;

    const {
      journalforingOppholdsLand, journalforingPeriodeFraOgMed, journalforingPeriodeTilOgMed,
    } = journalforingSkjemaVerdier;

    resetEksisterendeSakerFelter();

    settJournalforingHensikt(Konstanter.JOURNALFORING_HENSIKT.OPPRETT);

    // Manuell sjekk på validering og hensikt for å omgå race condition via props.
    if (!erSkjemaGyldig(this.props.journalforingSkjemaVerdier, Konstanter.JOURNALFORING_HENSIKT.OPPRETT)) {
      settFeilFelt('journalforingPeriodeFraOgMed', 'journalforingPeriodeTilOgMed', 'journalforingOppholdsLand');
      return false;
    }

    const fagsak = {
      soknadsperiode: {
        fom: formatterDatoTilISO(journalforingPeriodeFraOgMed),
        tom: formatterDatoTilISO(journalforingPeriodeTilOgMed),
      },
      land: journalforingOppholdsLand,
    };

    const journalforingData = { ...this.vaskDokumentInformasjon(), fagsak };

    /* eslint-disable */
    alert('Denne funksjonen er ikke implementert ennå.');
    return;
    /* eslint-enable */

    opprettNySak(journalforingData).then(response => {
      if (response.length === 0) {
        history.push('/');
      }
    });
  };

  resetOpprettFagsakFelter = () => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold('journalforingPeriodeFraOgMed', '');
    settFeltInnhold('journalforingPeriodeTilOgMed', '');
    settFeltInnhold('journalforingOppholdsLand', []);
  };

  resetEksisterendeSakerFelter = () => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold('saksnummer', '');
  };

  render() {
    const {
      journalforing: { dokument = {} },
      fagsakListe,
    } = this.props;

    const {
      knyttTilEksisterendeSak, opprettFagsak, brukerBleFunnetCallback,
    } = this;

    const { journalpostID } = this.props.match.params;
    const { ID: dokumentID } = dokument;

    return (
      <div className="journalforing">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="4">
              <h1>Journalføring</h1>
            </Nav.Column>
          </Nav.Row>
          <form onSubmit={this.overstyrSubmit}>
            <Nav.Row>
              <Nav.Column xs="4">
                <Sticky>
                  <Nav.Panel className="journalforing__skjema">
                    <div className="journalforing__skjema__scroll">
                      <Informasjon journalpostID={journalpostID} dokumentID={dokumentID} brukerBleFunnetCallback={brukerBleFunnetCallback} />
                      <EksisterendeSaker fagsakListe={fagsakListe} knyttTilEksisterendeSak={knyttTilEksisterendeSak} />
                      <OpprettNyFagSak opprettFagsak={opprettFagsak} />
                      <div className="journalforing__fotknapper">
                        <Nav.Knapp onClick={this.avbrytJournalforing}>Avbryt</Nav.Knapp>
                      </div>
                    </div>
                  </Nav.Panel>
                </Sticky>
              </Nav.Column>
              <Nav.Column xs="8">
                { dokumentID && <Nav.Panel><PDFDokument journalpostID={journalpostID} dokumentID={dokumentID} /></Nav.Panel> }
              </Nav.Column>
            </Nav.Row>
          </form>
        </Nav.Container>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  journalforing: journalforingSelectors.JournalforingAlle(state),
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
  fagsakListe: fagsakSelectors.FagsakSokSelector(state),
  initialValues: {
    brukerID: journalforingSelectors.JournalforingAlle(state).brukerID,
    erBrukerAvsender: journalforingSelectors.JournalforingAlle(state).erBrukerAvsender,
    avsenderID: journalforingSelectors.JournalforingAlle(state).avsenderID,
    mottattDato: formatterDatoTilNorsk(journalforingSelectors.JournalforingDokument(state).mottattDato),
    dokumentTittel: journalforingSelectors.JournalforingDokument(state).tittel,
    vedleggsTitler: [],
  },
});

const mapDispatchToProps = dispatch => ({
  hentJournalOppgave: journalpostID => dispatch(journalforingOperations.hent(journalpostID)),
  hentFagsakListe: fnr => dispatch(fagsakOperations.sok(fnr)),
  settFeltInnhold: (feltNavn, verdi) => dispatch(autofill('journalforing', feltNavn, verdi)),
  settFeilFelt: (...feltNavn) => dispatch(setSubmitFailed('journalforing', ...feltNavn)),
  settJournalforingHensikt: journalforingHensikt => dispatch(change('journalforing', 'journalforingHensikt', journalforingHensikt)),
  opprettNySak: data => Api.Journalforing.opprett(data),
  tilordneSak: data => Api.Journalforing.tilordne(data),
});

const kontekster = [
  { navn: 'journalforing', melding: 'Det har oppstått en feil: Kunne ikke hente journalforing.' },
];

const form = {
  form: 'journalforing',
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  validate: journalforingValidering,
  onSubmit: () => {},
};

export default withErrorHandling(kontekster, withRouter(connect(mapStateToProps, mapDispatchToProps)(reduxForm(form)(Journalforing))));
