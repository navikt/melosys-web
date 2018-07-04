import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { change } from 'redux-form';
import PT from 'prop-types';

import * as Skjema from '../skjema/';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes/';
import * as Konstanter from '../../constants';

import * as Api from '../../services/api';

import { PersonOperations, PersonSelectors } from '../../ducks/person';
import { OrganisasjonOperations, OrganisasjonSelectors } from '../../ducks/organisasjon';
import { formSelectors } from '../../ducks/form';

import './informasjon.css';
import { KodeverkSelectors } from '../../ducks/kodeverk'

/** Denne komponenten inneholder skjemafelter nødvendig for journalføringen
 * slik som informasjon om bruker, informasjon om dokument etc.
 */
class Informasjon extends Component {
  state = { spinner: {} };

  componentWillReceiveProps(nextProps) {
    const { brukerID: gammelBrukerID, avsenderID: gammelAvsenderID, erBrukerAvsender: gammelErBrukerAvsender } = this.props.journalforingSkjemaVerdier;
    const { brukerID = '', avsenderID = '', erBrukerAvsender, brukerNavn } = nextProps.journalforingSkjemaVerdier;

    if ((gammelBrukerID !== brukerID)) {
      this.hentOgVisBruker(brukerID);
    }

    if (gammelAvsenderID !== avsenderID) {
      this.hentOgVisAvsender(avsenderID);
    }

    if ((gammelErBrukerAvsender !== erBrukerAvsender)) {
      if (erBrukerAvsender) {
        this.kopierBrukerTilAvsender(brukerID, brukerNavn);
      } else {
        this.tomAvsender();
      }
    }
  }

  erGyldigBrukerID = verdi => (verdi.length === Konstanter.ANTALL_TALL_I_DNR || verdi.length === Konstanter.ANTALL_TALL_I_FNR);

  erGyldigAvsenderID = verdi => (
    verdi.length === Konstanter.ANTALL_TALL_I_ORGNR ||
    verdi.length === Konstanter.ANTALL_TALL_I_DNR || verdi.length === Konstanter.ANTALL_TALL_I_FNR
  );

  /** Vi ønsker kun å gjøre et søk på brukerID dersom antall tegn matcher 11 (fnr og dnr).
   * derfor, sjekk dette før vi evt kaller sokFnrDnr.
   * @param brukerID {string} Verdien vi ønsker å sjekke på.
   */
  hentOgVisBruker = brukerID => {
    if (brukerID.length !== Konstanter.ANTALL_TALL_I_FNR && brukerID.length !== Konstanter.ANTALL_TALL_I_DNR) { return; }

    const { sokFnrDnr, settFeltInnhold, brukerBleFunnetCallback } = this.props;
    const { erBrukerAvsender } = this.props.journalforingSkjemaVerdier;
    const { kopierBrukerTilAvsender } = this;

    this.toggleSpinner('brukerNavn');
    sokFnrDnr(brukerID)
      .then(({ sammensattNavn = '' }) => {
        if (!sammensattNavn) { return; }
        brukerBleFunnetCallback(brukerID);
        settFeltInnhold('brukerNavn', sammensattNavn);
        if (erBrukerAvsender) {
          kopierBrukerTilAvsender(brukerID, sammensattNavn);
        }
      });
  };

  kopierBrukerTilAvsender = (
    brukerID = this.props.journalforingSkjemaVerdier.brukerID,
    sammensattNavn = this.props.journalforingSkjemaVerdier.sammensattNavn
  ) => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold('avsenderID', brukerID);
    settFeltInnhold('avsenderNavn', sammensattNavn);
  }

  tomAvsender = () => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold('avsenderID', '');
    settFeltInnhold('avsenderNavn', '');
  }

  /** Vi ønsker kun å gjøre et søk på avsenderID dersom antall tegn matcher enten 9 (orgnr) eller 11 (fnr og dnr).
   * Avsender kan nemlig være både person og organisasjon.
   * Derfor, sjekk dette før vi evt kaller sokOrgnr eller sokFnrDnr.
   * @param value {string} Verdien vi ønsker å sjekke på.
   */
  hentOgVisAvsender = value => {
    const { sokOrgnr, sokFnrDnr, settFeltInnhold } = this.props;

    this.toggleSpinner('avsenderNavn');

    if (value.length === Konstanter.ANTALL_TALL_I_ORGNR) {
      sokOrgnr(value).then(({ navn = '' }) => settFeltInnhold('avsenderNavn', navn));
    }

    if (value.length === Konstanter.ANTALL_TALL_I_FNR || value.length === Konstanter.ANTALL_TALL_I_DNR) {
      sokFnrDnr(value).then(({ sammensattNavn = '' }) => settFeltInnhold('avsenderNavn', sammensattNavn));
    }
  };

  sjekkBruker = verdi => {
    const { erGyldigBrukerID, hentOgVisBruker, tomAvsender } = this;
    const { settFeltInnhold } = this.props;
    const { erBrukerAvsender } = this.props.journalforingSkjemaVerdier;

    if (erGyldigBrukerID(verdi)) {
      hentOgVisBruker(verdi);
    } else {
      settFeltInnhold('brukerNavn', '');
      if (erBrukerAvsender) { tomAvsender(); }
    }
  }

  sjekkAvsender = verdi => {
    const { erGyldigAvsenderID, hentOgVisAvsender } = this;
    const { settFeltInnhold } = this.props;

    if (erGyldigAvsenderID(verdi)) {
      hentOgVisAvsender(verdi);
    } else {
      settFeltInnhold('avsenderNavn', '');
    }
  }

  IDFeltTastOppHandler = event => {
    const { id: opprinneligFeltID, value } = event.target;

    if (opprinneligFeltID === 'brukerID') { this.sjekkBruker(value); }
    if (opprinneligFeltID === 'avsenderID') { this.sjekkAvsender(value); }
  };

  erBrukerAvsenderHandler = event => {
    console.log(event.target.value);
  }


  /** Toggle spinneren av og på. Når spinner skjules, sett en timeout på 500ms.
   * Dette sikrer at spinneren ikke bare flasher dersom kallet til API går raskt. Dataene vises.
   * umiddelbart fra payload, men spinneren har en levetid på minimum 500 ms som gir brukeren
   * tid til å tolke grensesnittet, dvs spinneren.
   * @param navn {String} Navnet på spinneren
   */
  toggleSpinner = navn => {
    this.setState({ spinner: { ...this.state.spinner, [navn]: true } });

    setTimeout(() => {
      this.setState({ spinner: { ...this.state.spinner, [navn]: false } });
    }, 1000);
  };

  /** Noen felter skal disables dersom andre felter er fylt inn eller andre
   * forutsetninger for disabling er tilstede.
   * @param feltNavn {string} Navnet på feltet som skal disables.
   * @returns {boolean} Hvorvidt feltet skal disables eller ikke
   */
  skalFeltetDisables = feltNavn => {
    const { journalforingSkjemaVerdier } = this.props;

    switch (feltNavn) {
      case 'avsenderNavn': { return journalforingSkjemaVerdier.avsenderID !== ''; }
      case 'avsenderID': { return journalforingSkjemaVerdier.erBrukerAvsender; }
      default: return false;
    }
  };

  render() {
    const {
      valgbareDokumentTitler, valgbareVedleggsTitler, journalpostID, dokumentID,
    } = this.props;
    const { spinner: { brukersNavn: visBrukerSpinner }, spinner: { avsenderNavn: visAvsenderSpinner } } = this.state;
    const { skalFeltetDisables, erBrukerAvsenderHandler } = this;

    const dokumentURI = Api.Dokumenter.pdfURI(journalpostID, dokumentID);

    return (
      <div className="informasjon">
        <Nav.Fieldset legend="Informasjon om brukeren">
          <Skjema.Input feltNavn="brukerID" label="Brukers fnr eller dnr:" onKeyUp={this.IDFeltTastOppHandler} />
          <Skjema.Input feltNavn="brukerNavn" label="Brukers navn:" disabled />
          { visBrukerSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" /> }
        </Nav.Fieldset>
        <Nav.Fieldset legend="Informasjon om dokument">
          <Skjema.Checkbox feltNavn="erBrukerAvsender" label="Bruker er avsender" onClick={erBrukerAvsenderHandler} />
          <Skjema.Input feltNavn="avsenderID" label="Avsenders fnr, dnr eller orgnr:" disabled={skalFeltetDisables('avsenderID')} onKeyUp={this.IDFeltTastOppHandler} />
          <Skjema.Input feltNavn="avsenderNavn" label="Avsenders navn eller firmanavn:" disabled={skalFeltetDisables('avsenderNavn')} />
          { visAvsenderSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" /> }
          <Skjema.Input feltNavn="mottattDato" label="Registrert dato:" disabled />
          <Link to={dokumentURI} target="_blank" className="informasjon__dokumentlenke">Åpne dokument i nytt vindu</Link>
          <Skjema.ListeVelger
            feltNavn="dokumentTittel"
            label="Tittel på hoveddokument:"
            placeholder="(velg eller skriv inn egen tittel)"
            muligeValg={valgbareDokumentTitler}
          />
          <Skjema.ListeVelger
            feltNavn="vedleggsTitler"
            label="Titler på vedlegg:"
            gruppe
            tillatFritekst
            muligeValg={valgbareVedleggsTitler}
            placeholder="(Velg eller skriv inn egen tittel)"
          />
        </Nav.Fieldset>
      </div>
    );
  }
}

Informasjon.propTypes = {
  valgbareDokumentTitler: PT.arrayOf(MPT.Kodeverk),
  valgbareVedleggsTitler: PT.arrayOf(MPT.Kodeverk),
  journalforingSkjemaVerdier: PT.object, // TODO: Vurdere MPT.
  brukerBleFunnetCallback: PT.func.isRequired,
  journalpostID: PT.string,
  dokumentID: PT.string,
  sokFnrDnr: PT.func.isRequired,
  sokOrgnr: PT.func.isRequired,
  settFeltInnhold: PT.func.isRequired,
};

Informasjon.defaultProps = {
  journalforingSkjemaVerdier: {},
  valgbareDokumentTitler: [],
  valgbareVedleggsTitler: [],
  journalpostID: '',
  dokumentID: '',
};

const mapStateToProps = state => ({
  person: PersonSelectors.personSelector(state),
  organisasjon: OrganisasjonSelectors.organisasjonSelector(state),
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
  valgbareDokumentTitler: KodeverkSelectors.dokumenttitlerSelector(state),
  valgbareVedleggsTitler: KodeverkSelectors.vedleggstitlerSelector(state),
});

const mapDispatchToProps = dispatch => ({
  sokFnrDnr: fnr => PersonOperations.hent(fnr),
  sokOrgnr: orgnr => OrganisasjonOperations.hent(orgnr),
  settFeltInnhold: (feltNavn, verdi) => dispatch(change('journalforing', feltNavn, verdi)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Informasjon);
