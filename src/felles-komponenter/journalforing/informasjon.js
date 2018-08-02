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

import * as Person from '../../felles-komponenter/skjema/validering/generisk/person';

import { PersonSelectors } from '../../ducks/person';
import { OrganisasjonSelectors } from '../../ducks/organisasjon';
import { formSelectors } from '../../ducks/form';
import { KodeverkSelectors } from '../../ducks/kodeverk';

import './informasjon.css';

/** Denne komponenten inneholder skjemafelter nødvendig for journalføringen
 * slik som informasjon om bruker, informasjon om dokument etc.
 */
class Informasjon extends Component {
  state = { spinner: {} };

  componentDidMount() {
    this.oppdaterFelter(this.props, true);
  }

  componentDidUpdate(prevProps) {
    this.oppdaterFelter(prevProps);
  }

  oppdaterFelter = (props, tvingOppdatering) => {
    const { brukerID: gammelBrukerID, avsenderID: gammelAvsenderID, erBrukerAvsender: gammelErBrukerAvsender } = props.journalforingSkjemaVerdier;
    const {
      brukerID = '', avsenderID = '', erBrukerAvsender, brukerNavn,
    } = this.props.journalforingSkjemaVerdier;
    const { hentOgVisBruker, hentOgVisAvsender } = this.props;
    const { kopierBrukerTilAvsender, tomAvsender } = this;

    if ((gammelBrukerID !== brukerID) || tvingOppdatering) {
      hentOgVisBruker(brukerID);
    }

    if ((gammelAvsenderID !== avsenderID) || tvingOppdatering) {
      hentOgVisAvsender(avsenderID);
    }

    if ((gammelErBrukerAvsender !== erBrukerAvsender) || tvingOppdatering) {
      if (erBrukerAvsender) {
        kopierBrukerTilAvsender(brukerID, brukerNavn);
      } else {
        tomAvsender();
      }
    }
  }

  erGyldigAvsenderID = verdi => (
    verdi.length === Konstanter.ANTALL_TALL_I_ORGNR ||
    verdi.length === Konstanter.ANTALL_TALL_I_DNR || verdi.length === Konstanter.ANTALL_TALL_I_FNR
  );

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

  sjekkBruker = verdi => {
    const { tomAvsender, kopierBrukerTilAvsender } = this;
    const { settFeltInnhold, hentOgVisBruker } = this.props;
    const { erBrukerAvsender } = this.props.journalforingSkjemaVerdier;

    if (Person.erGyldigFnr(verdi)) {
      this.toggleSpinner('avsenderNavn');
      hentOgVisBruker(verdi).then(response => {
        if (!response) return;
        const { brukerID, sammensattNavn } = response;
        if (erBrukerAvsender) { kopierBrukerTilAvsender(brukerID, sammensattNavn); }
      });
    } else {
      settFeltInnhold('brukerNavn', '');
      if (erBrukerAvsender) { tomAvsender(); }
    }
  }

  sjekkAvsender = verdi => {
    const { erGyldigAvsenderID } = this;
    const { settFeltInnhold, hentOgVisAvsender } = this.props;

    if (erGyldigAvsenderID(verdi)) {
      this.toggleSpinner('avsenderNavn');
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
    const { skalFeltetDisables } = this;

    const dokumentURI = Api.Dokumenter.pdfURI(journalpostID, dokumentID);

    return (
      <div className="informasjon">
        <Nav.Fieldset legend="Informasjon om brukeren">
          <Skjema.Input feltNavn="brukerID" label="Brukers fnr eller dnr:" onKeyUp={this.IDFeltTastOppHandler} />
          <Skjema.Input feltNavn="brukerNavn" label="Brukers navn:" disabled />
          { visBrukerSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" /> }
        </Nav.Fieldset>
        <Nav.Fieldset legend="Informasjon om dokument">
          <Skjema.Checkbox feltNavn="erBrukerAvsender" label="Bruker er avsender" />
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
  hentOgVisBruker: PT.func.isRequired,
  hentOgVisAvsender: PT.func.isRequired,
  journalpostID: PT.string,
  dokumentID: PT.string,
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
  settFeltInnhold: (feltNavn, verdi) => dispatch(change('journalforing', feltNavn, verdi)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Informasjon);
