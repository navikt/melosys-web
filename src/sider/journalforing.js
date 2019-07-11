/* eslint no-alert:off, consistent-return:off */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { reduxForm, autofill, setSubmitFailed, change, getFormSyncErrors } from 'redux-form';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../kodeverk';
import * as Utils from '../utils';
import * as Nav from '../utils/navFrontend';
import * as Api from '../services/api';
import { JOURNALFORING_HENSIKT, ANTALL_TALL_I_ORGNR } from '../constants';

import * as Person from '../soknad-komponenter/skjema/validering/generisk/person';

import Sticky from '../hjelpekomponenter/sticky';
import withErrorHandling from '../hoc/withErrorHandling';
import Informasjon from '../soknad-komponenter/journalforing/informasjon';
import EksisterendeSaker from '../soknad-komponenter/journalforing/eksisterendeSaker';
import PDFDokument from '../soknad-komponenter/journalforing/pdfdokument';
import OpprettNyFagSak from '../soknad-komponenter/journalforing/opprettnyfagsak';
import { queryParamLogger } from '../utils/queryParamLogger';

import { journalforingValidering, erSkjemaGyldig } from '../soknad-komponenter/skjema/validering/journalforing';
import {
  journalforingOperations,
  journalforingSelectors,
} from '../ducks/journalforing/';
import { formSelectors } from '../ducks/form/';
import './journalforing.css';
import { OrganisasjonOperations } from '../ducks/organisasjoner';
import { PersonOperations } from '../ducks/personer';
import * as oppgaverOperations from '../ducks/oppgaver/operations';
import * as MPT from '../proptypes';
import { sokOperations, sokSelectors } from '../ducks/sok';

class Journalforing extends Component {
  state = {
    valgtDokumentID: -1,
  };
  async componentDidMount() {
    const { journalpostID } = this.props.match.params;
    queryParamLogger(this.props.location, 'kilde', 'GOSYS');
    await this.props.hentJournalOppgave(journalpostID);
  }

  async componentWillUnmount() {
    await this.props.resetJournalforingState();
  }
  onChangeVedlegg = e => {
    const { value: valgtDokumentID } = e.target;
    this.setState({ valgtDokumentID });
  };

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

  mapVedleggsTittlerTilVedlegg = titler => titler.map(tittel => ({ dokumentID: null, tittel }));

  /** Ikke all informasjon som vises i skjemaet skal sendes tilbake til backend. Et eksempel på det er dato som
   * settes inn i skjemaet kun til info - ikke til endring - slik som feks navn på bruker.
   * Derfor må vi bygge opp og evt vaske et nytt objekt som kan sendes til backend.
   *
   * @returns {object} Objektet som skal sendes videre som payload.
   */
  vaskDokumentInformasjon = intensjon => {
    /* eslint-disable no-console */
    console.assert(intensjon, { message: 'intensjon må ha verdi' });
    /* eslint-enable no-console */
    const { oppgaveID, journalpostID } = this.props.match.params;
    const {
      journalforingSkjemaVerdier,
      journalforing: { hoveddokument = {} },
    } = this.props;
    const {
      brukerID, avsenderID, arbeidsgiverID,
      opprettnysak_behandlingstype: behandlingstypeKode,
      representantID, representantKontaktPerson, avsenderNavn, hoveddokumentTittel, vedleggsTitler,
      skalTilordnes,
    } = journalforingSkjemaVerdier;

    const { dokumentID } = hoveddokument;
    const vedlegg = this.mapVedleggsTittlerTilVedlegg(vedleggsTitler);

    // Data for /tilordne i.e KNYTT
    let journalPostData = {
      avsenderID,
      avsenderNavn,
      brukerID,
      dokumentID,
      hoveddokumentTittel,
      journalpostID,
      oppgaveID,
      vedlegg,
      skalTilordnes,
    };
    // /opprett har i tillegg arbeidsgiverID og representantID
    if (intensjon === JOURNALFORING_HENSIKT.OPPRETT) {
      journalPostData = Object.assign(journalPostData, {
        arbeidsgiverID, behandlingstypeKode, representantID, representantKontaktPerson: Utils.verdiSomNullable(representantKontaktPerson),
      });
    }
    return journalPostData;
  };

  /** Når saksbehandler klikker "knytt til eksisterende sak" skal det åpnes for validering av
   * relevante felter før saken tilordnes (sendes til API) og saksbehandler returneres til forsiden.
   * @returns {boolean}
   */
  knyttTilEksisterendeSak = async () => {
    /* eslint no-unreachable:off */
    const {
      journalforingSkjemaVerdier: { saksnummer, behandlingstype: behandlingstypeKode, ingenVurdering }, tilordneSak, history, settJournalforingHensikt, settFeilFelt,
    } = this.props;

    const { resetSkjemaFelterForOpprettFagsak } = this;

    const vasketJournalforing = this.vaskDokumentInformasjon(JOURNALFORING_HENSIKT.KNYTT);
    const journalforingData = {
      saksnummer, behandlingstypeKode, ingenVurdering, ...vasketJournalforing,
    };

    await settJournalforingHensikt(JOURNALFORING_HENSIKT.KNYTT);

    this.touchAll(this.props.errors);

    // Tøm den delen av skjema som ikke skal brukes.
    resetSkjemaFelterForOpprettFagsak();

    if (!erSkjemaGyldig(this.props.journalforingSkjemaVerdier, JOURNALFORING_HENSIKT.KNYTT)) {
      settFeilFelt('avsenderNavn', 'vedleggsTitler', 'saksnummer', 'behandlingstype');
      return false;
    }
    const response = await tilordneSak(journalforingData);
    if (response.ok) {
      this.props.hentOppgaveOversikt();
      history.push('/');
    }
  };

  /** Når saksbehandler klikker "opprett sak" skal det åpnes for validering av
   * relevante felter før ny sak opprettes (sendes til API) og saksbehandler returneres til forsiden.
   * @returns {boolean}
   */
  opprettFagsak = async () => {
    const {
      journalforingSkjemaVerdier, opprettNySak, history, settJournalforingHensikt, settFeilFelt,
    } = this.props;

    const { resetSkjemaFelterForEksisterendeSaker } = this;
    const {
      journalforingSoknadsland, journalforingPeriodeFraOgMed, journalforingPeriodeTilOgMed,
    } = journalforingSkjemaVerdier;

    await settJournalforingHensikt(JOURNALFORING_HENSIKT.OPPRETT);

    this.touchAll(this.props.errors);

    // Tøm den delen av skjema som ikke skal brukes.
    resetSkjemaFelterForEksisterendeSaker();

    if (!erSkjemaGyldig(this.props.journalforingSkjemaVerdier, JOURNALFORING_HENSIKT.OPPRETT)) {
      settFeilFelt('journalforingPeriodeFraOgMed', 'journalforingPeriodeTilOgMed', 'journalforingSoknadsland');
      return false;
    }

    const fagsak = {
      sakstype: MKV.Koder.sakstyper.EU_EOS,
      soknadsperiode: {
        fom: Utils.dato.formatterDatoTilISO(journalforingPeriodeFraOgMed),
        tom: Utils.dato.formatterDatoTilISO(journalforingPeriodeTilOgMed),
      },
      land: journalforingSoknadsland,
    };

    const vasketJournalforing = this.vaskDokumentInformasjon(JOURNALFORING_HENSIKT.OPPRETT);
    const journalforingData = {
      ...vasketJournalforing,
      fagsak,
    };
    const response = await opprettNySak(journalforingData);
    if (response.ok) {
      this.props.hentOppgaveOversikt();
      history.push('/');
    }
  };
  /** Vi ønsker kun å gjøre et søk på brukerID dersom det er et gyldig FNR eller DNR.
   * Derfor, sjekk dette før vi evt kaller sokFnrDnr.
   * @param brukerID {string} Verdien vi ønsker å sjekke på.
   */
  hentOgVisBruker = async brukerID => {
    if (!Person.erGyldigFnr(brukerID) && !Person.erGyldigDnr(brukerID)) { return; }

    const { sokFnrDnr, settFeltInnhold, hentFagsakListe } = this.props;
    settFeltInnhold('brukerNavn', '');
    const response = await sokFnrDnr(brukerID);
    if (!response.data) { return false; }
    const { sammensattNavn = '' } = response.data;
    if (!sammensattNavn) { return false; }
    settFeltInnhold('brukerNavn', sammensattNavn);
    await hentFagsakListe(brukerID);
    return { brukerID, sammensattNavn };
  };

  /** Vi ønsker kun å gjøre et søk på avsenderID dersom antall tegn matcher enten 9 (orgnr) eller er et gyldig FNR || DNR.
   * Avsender kan være både person og organisasjon.
   * @param value {string} Verdien vi ønsker å sjekke på.
   */
  hentOgVisAvsender = async value => {
    const { sokOrgnr, sokFnrDnr, settFeltInnhold } = this.props;

    if (!value) { return; }

    if (value.length === ANTALL_TALL_I_ORGNR) {
      settFeltInnhold('avsenderNavn', '');
      const response = await sokOrgnr(value);
      if (!response.data) { return false; }
      const { navn = '' } = response.data;
      settFeltInnhold('avsenderNavn', navn);
    }

    if (Person.erGyldigFnr(value) || Person.erGyldigDnr(value)) {
      settFeltInnhold('avsenderNavn', '');
      const response = await sokFnrDnr(value);
      if (!response.data) { return false; }
      const { sammensattNavn = '' } = response.data;
      settFeltInnhold('avsenderNavn', sammensattNavn);
    }
  };


  hentOgVisRepresentant = async value => {
    const { sokOrgnr, settFeltInnhold } = this.props;

    if (!value) { return; }

    if (value.length === ANTALL_TALL_I_ORGNR) {
      settFeltInnhold('representantNavn', '');
      const response = await sokOrgnr(value);
      if (!response.data) { return false; }
      const { navn = '' } = response.data;
      settFeltInnhold('representantNavn', navn);
    }
  };

  touchAll = (alleFeil = {}) => {
    this.props.touch(...Object.keys(alleFeil));
  };

  resetSkjemaFelterForOpprettFagsak = () => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold('journalforingPeriodeFraOgMed', '');
    settFeltInnhold('journalforingPeriodeTilOgMed', '');
    settFeltInnhold('representantID', '');
    settFeltInnhold('journalforingSoknadsland', []);
  };

  resetSkjemaFelterForEksisterendeSaker = () => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold('saksnummer', '');
    settFeltInnhold('behandlingstype', '');
  };

  velgDokumentID = () => {
    const { valgtDokumentID } = this.state;
    const {
      journalforing: { hoveddokument = {} },
    } = this.props;
    if (valgtDokumentID === -1 && !hoveddokument.dokumentID) return null;
    if (valgtDokumentID === -1 && hoveddokument.dokumentID) return hoveddokument.dokumentID;
    return valgtDokumentID;
  };

  render() {
    const {
      journalforing: { vedlegg = [], hoveddokument = {} },
      fagsakListe,
    } = this.props;
    const {
      knyttTilEksisterendeSak, opprettFagsak, hentOgVisAvsender, hentOgVisBruker, hentOgVisRepresentant,
    } = this;
    const { journalpostID } = this.props.match.params;
    const { dokumentID: hoveddokumentID, tittel: hoveddokumentTittel = 'Hoveddokument' } = hoveddokument;

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
                      <Informasjon
                        journalpostID={journalpostID}
                        dokumentID={hoveddokumentID}
                        dokumentTittel={hoveddokumentTittel}
                        vedlegg={vedlegg}
                        hentOgVisAvsender={hentOgVisAvsender}
                        hentOgVisBruker={hentOgVisBruker}
                      />
                      <EksisterendeSaker
                        behandlingstyper={MKV.KTObjects.behandlinger.typer}
                        fagsakListe={fagsakListe}
                        knyttTilEksisterendeSak={knyttTilEksisterendeSak}
                      />
                      <OpprettNyFagSak
                        sakstyper={MKV.KTObjects.sakstyper}
                        behandlingstyper={MKV.KTObjects.behandlinger.typer}
                        opprettFagsak={opprettFagsak}
                        hentOgVisRepresentant={hentOgVisRepresentant}
                      />
                      <div className="journalforing__fotknapper">
                        <Nav.Knapp onClick={this.avbrytJournalforing}>Avbryt</Nav.Knapp>
                      </div>
                    </div>
                  </Nav.Panel>
                </Sticky>
              </Nav.Column>
              <Nav.Column xs="8">
                {vedlegg.length > 0 &&
                  <Nav.Panel>
                    <Nav.Select
                      className="journalforing__dokument_visning"
                      name="journalforing_pdf_dokumenter"
                      label="Dokumentvisning"
                      defaultValue={hoveddokumentID}
                      onChange={this.onChangeVedlegg}>
                      <option key={hoveddokumentID} value={hoveddokumentID}>{hoveddokumentTittel}</option>
                      {vedlegg.map(elem => <option key={elem.dokumentID} value={elem.dokumentID}>{elem.tittel}</option>)}
                    </Nav.Select>
                  </Nav.Panel>
                }
                {this.velgDokumentID() && <Nav.Panel><PDFDokument journalpostID={journalpostID} dokumentID={this.velgDokumentID()} /></Nav.Panel>}
              </Nav.Column>
            </Nav.Row>
          </form>
        </Nav.Container>
      </div>
    );
  }
}

Journalforing.propTypes = {
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  history: PT.object.isRequired,
  hentJournalOppgave: PT.func.isRequired,
  hentFagsakListe: PT.func.isRequired,
  hentOppgaveOversikt: PT.func.isRequired,
  tilordneSak: PT.func.isRequired,
  opprettNySak: PT.func.isRequired,
  settFeltInnhold: PT.func.isRequired,
  settFeilFelt: PT.func.isRequired,
  settJournalforingHensikt: PT.func.isRequired,
  journalforing: MPT.Journalforing,
  journalforingSkjemaVerdier: MPT.JournalforingSkjemaVerdier,
  fagsakListe: PT.array,
  valid: PT.bool.isRequired,
  sokFnrDnr: PT.func.isRequired,
  sokOrgnr: PT.func.isRequired,
  errors: PT.object.isRequired,
  touch: PT.func.isRequired,
  resetJournalforingState: PT.func.isRequired,
};

Journalforing.defaultProps = {
  journalforing: {},
  fagsakListe: [],
  journalforingSkjemaVerdier: {},
};
const mapStateToProps = state => ({
  journalforing: journalforingSelectors.JournalforingAlle(state),
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
  fagsakListe: sokSelectors.FagsakSokSelector(state),
  errors: getFormSyncErrors(KV.Form.JOURNALFORING)(state),
  initialValues: {
    behandlingstype: null,
    brukerID: journalforingSelectors.JournalforingAlle(state).brukerID,
    erBrukerAvsender: journalforingSelectors.JournalforingAlle(state).erBrukerAvsender,
    avsenderID: journalforingSelectors.JournalforingAlle(state).avsenderID,
    arbeidsgiverID: null,
    representantID: '',
    mottattDato: Utils.dato.formatterDatoTilNorsk(journalforingSelectors.JournalforingAlle(state).mottattDato),
    hoveddokumentTittel: journalforingSelectors.JournalforingHovedDokument(state).tittel,
    vedleggsTitler: [],
    sakstype: MKV.Koder.sakstyper.EU_EOS,
    opprettnysak_behandlingstype: MKV.Koder.behandlinger.typer.SOEKNAD,
    ingenVurdering: false,
    skalTilordnes: false,
  },
});

const mapDispatchToProps = dispatch => ({
  hentJournalOppgave: journalpostID => dispatch(journalforingOperations.hent(journalpostID)),
  hentFagsakListe: fnr => dispatch(sokOperations.sok(fnr)),
  settFeltInnhold: (feltNavn, verdi) => dispatch(autofill(KV.Form.JOURNALFORING, feltNavn, verdi)),
  settFeilFelt: (...feltNavn) => (setSubmitFailed(KV.Form.JOURNALFORING, ...feltNavn)),
  settJournalforingHensikt: journalforingHensikt => dispatch(change(KV.Form.JOURNALFORING, 'journalforingHensikt', journalforingHensikt)),
  opprettNySak: data => Api.Journalforing.opprett(data),
  hentOppgaveOversikt: () => dispatch(oppgaverOperations.oversikt()),
  tilordneSak: data => Api.Journalforing.tilordne(data),
  resetJournalforingState: () => dispatch(journalforingOperations.resetJournalforing()),
  sokFnrDnr: fnr => dispatch(PersonOperations.hent(fnr)),
  sokOrgnr: orgnr => dispatch(OrganisasjonOperations.hent(orgnr)),
});

const kontekster = [
  { navn: 'journalforing', melding: 'Det har oppstått en feil: Kunne ikke hente journalforing.' },
];

const form = {
  form: KV.Form.JOURNALFORING,
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  validate: journalforingValidering,
  onSubmit: () => {},
};

export default withErrorHandling(kontekster, withRouter(connect(mapStateToProps, mapDispatchToProps)(reduxForm(form)(Journalforing))));
