import React, { Component } from 'react';
import PT from 'prop-types';
import { reduxForm, autofill, setSubmitFailed } from 'redux-form';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as Nav from '../utils/navFrontend';
import * as Api from '../services/api';
import * as MPT from '../proptypes';
import * as Konstanter from '../constants';

import { formatterDatoTilNorsk } from '../utils/dato';

import Sticky from '../hjelpekomponenter/sticky';

import Informasjon from '../felles-komponenter/journalforing/informasjon';
import EksisterendeSaker from '../felles-komponenter/journalforing/eksisterendeSaker';
import PDFDokument from '../felles-komponenter/journalforing/pdfdokument';
import OpprettNyFagSak from '../felles-komponenter/journalforing/opprettnyfagsak';

import JournalforingValidering from '../felles-komponenter/skjema/validering/journalforing';

import {
  journalforingOperations,
  journalforingSelectors,
} from '../ducks/journalforing/';
import {
  fagsakOperations,
  fagsakSelectors,
} from '../ducks/fagsaker';

import {
  KodeverkSelectors,
} from '../ducks/kodeverk/';

import {
  formSelectors,
} from '../ducks/form/';

import { PersonOperations } from '../ducks/person';
import { OrganisasjonOperations } from '../ducks/organisasjon';

import './journalforing.css';

class Journalforing extends Component {
  static propTypes = {
    match: PT.object.isRequired,
    hentJournalOppgave: PT.func.isRequired,
    hentRelevanteFagsaker: PT.func.isRequired,
    tilordeSak: PT.func.isRequired,
    opprettNySak: PT.func.isRequired,
    sokFnrDnr: PT.func.isRequired,
    sokOrgnr: PT.func.isRequired,
    history: PT.object.isRequired,
    autofyllFormFelt: PT.func.isRequired,
    triggeFeltFeil: PT.func.isRequired,
    journalforing: PT.object,
    journalpostID: PT.string,
    saksTyper: PT.array,
    fagsakListe: PT.array,
    journalforingSkjemaVerdier: PT.object,
    valgbareDokumentTitler: PT.arrayOf(MPT.Kodeverk).isRequired,
    valgbareVedleggsTitler: PT.arrayOf(MPT.Kodeverk).isRequired,
    settBrukerSomAvsender: PT.func.isRequired,
  };

  static defaultProps = {
    journalforing: {},
    journalpostID: '',
    saksTyper: [],
    fagsakListe: [],
    journalforingSkjemaVerdier: {},
  };

  componentDidMount() {
    const { journalpostID } = this.props.match.params;
    this.props.hentJournalOppgave(journalpostID);
  }

  /** Logikken nedenfor trigges av 2 situasjoner. Enten fordi sok
   * returnerte en ny ID (orgnr, fnr eller dnr) som det må gjøres oppslag på. Eller
   * fordi saksbehandler tastet inn en ID (orgnr, fnr eller dnr).
   * @param nextProps
   */
  componentWillReceiveProps(nextProps) {
    // For lesbarhet, gi alias til verdier som vil påvirke hvorvidt vi gjør nye kall til backend
    // for å hente via  /api/personer/ eller /api/organisasjoner
    const { brukerID: gammelBrukerIDFraStore, avsenderID: gammelAvsenderIDFraStore } = this.props.journalforing;
    const { brukerID: gammelBrukerIDFraSkjema, avsenderID: gammelAvsenderIDFraSkjema } = this.props.journalforingSkjemaVerdier;
    const { brukerID: nyBrukerIDFraStore, avsenderID: nyAvsenderIDFraStore } = nextProps.journalforing;
    const { brukerID: nyBrukerIDFraSkjema, avsenderID: nyAvsenderIDFraSkjema } = nextProps.journalforingSkjemaVerdier;

    // Sjekk om brukerID har endret seg enten i Store eller direkte i Redux Form.
    if (gammelBrukerIDFraStore !== nyBrukerIDFraStore) {
      this.hentBruker(nyBrukerIDFraStore);
    } else if (gammelBrukerIDFraSkjema !== nyBrukerIDFraSkjema) {
      this.hentBruker(nyBrukerIDFraSkjema);
    }

    // Sjekk om avsenderID har endret seg enten i Store eller direkte i Redux Form.
    if (gammelAvsenderIDFraStore !== nyAvsenderIDFraStore) {
      this.hentAvsender(nyAvsenderIDFraStore);
    } else if (gammelAvsenderIDFraSkjema !== nyAvsenderIDFraSkjema) {
      this.hentAvsender(nyAvsenderIDFraSkjema);
    }

    // Ved å kalle funksjonen 'settBrukerSomAvsender' oppdaterer vi Redux Form som deretter vil oppdatere
    // store ved post.
    const { erBrukerAvsender } = nextProps.journalforingSkjemaVerdier;

    if (erBrukerAvsender) {
      this.props.settBrukerSomAvsender(nyBrukerIDFraSkjema, nextProps.journalforingSkjemaVerdier.brukerNavn);
    }

    if (gammelBrukerIDFraSkjema === nyBrukerIDFraSkjema) { return; }

    // Hent fagsaker som er knyttet til brukeren, men bare dersom lengden matcher fnr eller dnr.
    if (nyBrukerIDFraSkjema.length === Konstanter.ANTALL_TALL_I_DNR || nyBrukerIDFraSkjema.length === Konstanter.ANTALL_TALL_I_FNR) {
      this.props.hentRelevanteFagsaker(nyBrukerIDFraSkjema);
    }
  }

  /** Vi ønsker bare å gjøre et søk dersom antall tegn matcher 11 (fnr og dnr).
   * derfor, sjekk dette før vi evt kaller sokFnrDnr.
   * @param value {string} Verdien vi ønsker å sjekke på.
   */
  hentBruker = value => {
    const { sokFnrDnr } = this.props;
    const { preAutofyll } = this;

    if (value.length !== Konstanter.ANTALL_TALL_I_FNR && value.length !== Konstanter.ANTALL_TALL_I_DNR) { return; }

    sokFnrDnr(value).then(({ sammensattNavn = '' }) => preAutofyll('brukerID', 'brukerNavn', sammensattNavn));
  };

  /** Vi ønsker bare å gjøre et søk dersom antall tegn matcher enten 9 (orgnr) eller 11 (fnr og dnr).
   * Avsender kan nemlig være både person og organisasjon.
   * Derfor, sjekk dette før vi evt kaller sokOrgnr eller sokFnrDnr.
   * @param value {string} Verdien vi ønsker å sjekke på.
   */
  hentAvsender = value => {
    const { sokOrgnr, sokFnrDnr } = this.props;
    const { preAutofyll } = this;

    if (value.length === Konstanter.ANTALL_TALL_I_DNR) {
      sokOrgnr(value).then(({ navn = '' }) => preAutofyll('avsenderID', 'avsenderNavn', navn));
    }

    if (value.length === Konstanter.ANTALL_TALL_I_FNR || value.length === Konstanter.ANTALL_TALL_I_DNR) {
      sokFnrDnr(value).then(({ sammensattNavn = '' }) => preAutofyll('avsenderID', 'avsenderNavn', sammensattNavn));
    }
  };

  /** Mellomfunksjon som fyller ut treffet i brukerNavn eller avsenderNavn,
   * uavhengig om faktisk verdi eller bare ''. I tillegg validerer skjemaet på disse feltene
   * for å sjekke at de er korrekt. For å validere på ikke-treff gjør vi en eksplissit validering
   * hvor vi antar at (1) noe er tastet inn i ID-feltet og (2) navn-feltet er tomt. Ergo fant vi ingenting og
   * kan vise feilmelding i ID-feltet.
   * @param opprinnelsesFelt {string} Det feltet som brukeren tastet inn (stort sett er dette ID-feltet)
   * @param verdiFelt {string} Feltet som den funnene verdien skal settes inn i.
   * @param verdi {string} Selve verdien som ble funnet.
   */
  preAutofyll = (opprinnelsesFelt, verdiFelt, verdi) => {
    const { autofyllFormFelt } = this.props;
    this.props.triggeFeltFeil(opprinnelsesFelt);
    autofyllFormFelt(verdiFelt, verdi);
  };

  overstyrSubmit = event => {
    event.preventDefault();
  };

  avbrytJournalforing = () => {
    this.props.history.push('/');
  };

  plukkJournalDocParams = () => {
    const { oppgaveID, journalpostID } = this.props.match.params;
    const { journalforing, journalforingSkjemaVerdier } = this.props;
    const { brukerID, avsenderID } = journalforing;
    const { dokumentTittel, vedleggsTitler = [] } = journalforingSkjemaVerdier;
    const jfdoc = {
      journalpostID,
      oppgaveID,
      brukerID,
      avsenderID,
      dokumenttittel: dokumentTittel,
      vedleggstitler: vedleggsTitler,
    };
    return jfdoc;
  };
  knyttTilEksisterendeSak = () => {
    const { journalforingSkjemaVerdier: { saksnummer }, tilordeSak } = this.props;
    // TODO validate response before redirect
    /* eslint-disable */
    const jfdoc = this.plukkJournalDocParams();
    jfdoc.saksnummer = saksnummer;
    console.log('jfdoc', jfdoc);
    //alert('Denne er ikke avklart / implementert.');
    /* eslint-enable */

    return (saksnummer) ? tilordeSak(jfdoc) : false;
  };

  opprettNyFagsakSubmit = event => {
    event.preventDefault();
    const { journalforingSkjemaVerdier, opprettNySak } = this.props;
    const {
      journalforingOppholdsLand, journalforingPeriodeFraOgMed, journalforingPeriodeTilOgMed,
    } = journalforingSkjemaVerdier;

    const fagsak = {
      type: 'EU_EOS',
      soknadsperiode: {
        fom: journalforingPeriodeFraOgMed,
        tom: journalforingPeriodeTilOgMed,
      },
      land: journalforingOppholdsLand,
    };
    const jfdoc = this.plukkJournalDocParams();
    jfdoc.fagsak = fagsak;
    opprettNySak(jfdoc).then(response => {
      // TODO validate response before redirect
      /* eslint-disable */
      console.log(response);
      //alert('Denne er ikke avklart / implementert.');
      /* eslint-enable */
    });
  };

  render() {
    const {
      journalforing, valgbareDokumentTitler, valgbareVedleggsTitler, journalforingSkjemaVerdier, fagsakListe,
    } = this.props;
    const {
      knyttTilEksisterendeSak, opprettNyFagsakSubmit, hentAvsender, hentBruker,
    } = this;

    const { journalpostID } = this.props.match.params;
    const { dokument = {} } = journalforing;
    const dokumentID = dokument.ID ? `${dokument.ID}` : undefined;

    return (
      <div className="journalforing">
        <h1>Journalføring</h1>
        <Nav.Container fluid>
          <form onSubmit={this.overstyrSubmit}>
            <Nav.Row>
              <Nav.Column xs="4">
                <Sticky>
                  <Nav.Panel className="journalforing__skjema">
                    <div className="journalforing__skjema__scroll">
                      <Informasjon
                        journalforing={journalforing}
                        journalforingSkjemaVerdier={journalforingSkjemaVerdier}
                        hentAvsender={hentAvsender}
                        hentBruker={hentBruker}
                        valgbareDokumentTitler={valgbareDokumentTitler}
                        valgbareVedleggsTitler={valgbareVedleggsTitler}
                      />
                      <EksisterendeSaker fagsakListe={fagsakListe} knyttTilEksisterendeSak={knyttTilEksisterendeSak} />
                      <OpprettNyFagSak opprettNyFagsakSubmit={opprettNyFagsakSubmit} />
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
  saksTyper: KodeverkSelectors.sakstyperSelector(state),
  pdfDokument: journalforingSelectors.JournalforingDokument(state).url,
  valgbareDokumentTitler: KodeverkSelectors.dokumenttitlerSelector(state),
  valgbareVedleggsTitler: KodeverkSelectors.vedleggstitlerSelector(state),
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
  autofyllFormFelt: (feltNavn, verdi) => dispatch(autofill('journalforing', feltNavn, verdi)),
  triggeFeltFeil: (...feltNavn) => dispatch(setSubmitFailed('journalforing', ...feltNavn)),
  sokFnrDnr: fnr => PersonOperations.hent(fnr),
  sokOrgnr: orgnr => OrganisasjonOperations.hent(orgnr),
  sendNyFagsakTilJournalforing: data => Api.Fagsaker.send(data),
  opprettNySak: data => Api.Journalforing.opprett(data),
  tilordeSak: data => Api.Journalforing.tilordne(data),
  hentRelevanteFagsaker: fnr => dispatch(fagsakOperations.sok(fnr)),
  settBrukerSomAvsender: (ID, navn) => {
    dispatch(autofill('journalforing', 'avsenderID', ID));
    dispatch(autofill('journalforing', 'avsenderNavn', navn));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(reduxForm({
  form: 'journalforing',
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  validate: JournalforingValidering,
  onSubmit: () => {},
})(Journalforing)));
