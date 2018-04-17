import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { change } from 'redux-form';
import PT from 'prop-types';

import * as Skjema from '../skjema/';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes/';

import './informasjon.css';
import { PersonSelectors, PersonOperations } from '../../ducks/person';
import { OrganisasjonSelectors, OrganisasjonOperations } from '../../ducks/organisasjon';

const uuid = require('uuid/v4');

/** Denne komponenten inneholder skjemafelter nødvendig for journalføringen
 * slik som informasjon om bruker, informasjon om dokument etc.
 */
class Informasjon extends Component {
  state = { spinner: {} };

  onKeyUp = event => {
    const { id, value } = event.target;

    if (!value || !value.length) { return; }

    switch (id) {
      case 'brukersFnr':
        this.sjekkBrukersNavn(value);
        break;
      case 'avsenderFnrOrgnr':
        this.sjekkAvsendersNavn(value);
        break;
      default:
        break;
    }
  }

  sjekkBrukersNavn = verdi => {
    const { oppdaterFormFelt } = this.props;

    if (this.verdiErFnr(verdi)) {
      this.toggleSpinner('brukersNavn', true);
      this.props.hentPerson(verdi).then(response => {
        this.toggleSpinner('brukersNavn', false);
        oppdaterFormFelt('brukersNavn', response.sammensattNavn);
      });
    } else {
      oppdaterFormFelt('brukersNavn', '');
    }
  }

  sjekkAvsendersNavn = verdi => {
    const { oppdaterFormFelt } = this.props;

    if (this.verdiErOrgnr(verdi)) {
      this.toggleSpinner('avsenderNavn', true);
      this.props.hentOrganisasjon(verdi).then(response => {
        this.toggleSpinner('avsenderNavn', false);
        oppdaterFormFelt('avsenderNavn', response.navn);
      });
    } else if (this.verdiErFnr(verdi)) {
      this.toggleSpinner('avsenderNavn', true);
      this.props.hentPerson(verdi).then(response => {
        this.toggleSpinner('avsenderNavn', false);
        oppdaterFormFelt('avsenderNavn', response.sammensattNavn);
      });
    } else {
      oppdaterFormFelt('avsenderNavn', '');
    }
  }

  /** Hjelpefubnksjoner for å avgjøre om en gitt verdi kan være et fødselsnummer
   * eller et orgnummer.
   * TODO: Flyttes til utils ved anledning?
   * @param verdi
   * @returns {boolean}
   */
  verdiErFnr = verdi => (verdi.length === 11 && !Number.isNaN(verdi));
  verdiErOrgnr = verdi => (verdi.length === 9 && !Number.isNaN(verdi));

  /** Toggle spinneren av og på. Når spinner skjules, sett en timeout på 500ms.
   * Dette sikrer at spinneren ikke bare flasher dersom kallet til API går raskt. Dataene vises.
   * umiddelbart fra payload, men spinneren har en levetid på minimum 500 ms som gir brukeren
   * tid til å tolke grensesnittet, dvs spinneren.
   * @param navn {String} Navnet på spinneren
   * @param flagg {Boolean} Hvorvidt spinneren skal slåes på eller av.
   */
  toggleSpinner = (navn, flagg) => {
    const timeoutCount = flagg ? 0 : 500;
    setTimeout(() => {
      this.setState({ spinner: { ...this.state.spinner, [navn]: flagg } });
    }, timeoutCount);
  }

  /** Noen felter skal disables dersom andre felter er fylt inn eller andre
   * forutsetninger for disabling er tilstede.
   * @param feltNavn {string} Navnet på feltet som skal disables.
   * @returns {boolean} Hvorvidt feltet skal disables eller ikke
   */
  skalFeltetDisables = feltNavn => {
    const { journalforingSkjemaVerdier } = this.props;

    switch (feltNavn) {
      case 'avsenderNavn': { return journalforingSkjemaVerdier.avsenderFnrOrgnr !== ''; }
      case 'avsenderFnrOrgnr': { return journalforingSkjemaVerdier.erBrukerAvsender; }
      default: return false;
    }
  };


  render() {
    const { sakstyper } = this.props;
    const { spinner: { brukersNavn: visBrukerSpinner }, spinner: { avsenderNavn: visAvsenderSpinner } } = this.state;
    const { skalFeltetDisables } = this;

    return (
      <div className="informasjon">
        <Nav.Fieldset legend="Informasjon om brukeren">
          <Skjema.Input feltNavn="brukersFnr" label="Brukers personnummer eller D-nummer" onKeyUp={this.onKeyUp} />
          <Skjema.Input feltNavn="brukersNavn" label="Brukers navn" disabled />
          { visBrukerSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" /> }
          <Skjema.Checkbox feltNavn="erBrukerAvsender" label="Bruker er avsender" />
          <Skjema.Input feltNavn="avsenderFnrOrgnr" label="Avsender fødselsnummer eller orgnr" onKeyUp={this.onKeyUp} />
          <Skjema.Input feltNavn="avsenderNavn" label="Avsenders navn eller firmanavn" disabled={skalFeltetDisables('avsenderNavn')} />
          { visAvsenderSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" /> }
        </Nav.Fieldset>
        <Nav.Fieldset legend="Informasjon om dokument">
          <Link to="/foo/bar.pdf" className="informasjon__dokumentlenke">26.04.2018: Kort navn på dokumentet</Link>
          <Skjema.Select feltNavn="dokumentKategori" label="Dokumentkategori">
            <option value="ELEKTRONISK_DIALOG">Elektronisk dialog</option>
            <option value="ELEKTRONISK_SKJEMA">Elektronisk skjema</option>
            <option value="FORVALTNINGSBREV">Forvaltningsbrev</option>
          </Skjema.Select>
          <Skjema.Select feltNavn="saksType" label="Sakstype">
            {sakstyper.map(sakstype => (<option key={uuid()} value={sakstype.kode}>{sakstype.term}</option>))}
          </Skjema.Select>
          <Skjema.Select feltNavn="tittel" label="Tittel">
            <option value="STUDIEDOKUMENTASJON">Studiedokumentasjon</option>
            <option value="SOKNAD">Søknad</option>
            <option value="UNNTAK">Unntak</option>
          </Skjema.Select>
          <Skjema.Select feltNavn="vedleggsTittel" label="Vedleggstittel / beskrivelse">
            <option value="STUDIEDOKUMENTASJON">Studiedokumentasjon</option>
            <option value="SOKNAD">Søknad</option>
            <option value="UNNTAK">Unntak</option>
          </Skjema.Select>
        </Nav.Fieldset>
        <Skjema.Checkbox feltNavn="inneholderSensitivInfo" label="Inneholder sensitiv info" />
        <div className="informasjon__knapper">
          <Nav.Knapp>Avbryt</Nav.Knapp>
        </div>
      </div>
    );
  }
}

Informasjon.propTypes = {
  sakstyper: PT.arrayOf(MPT.Kodeverk),
  journalforingSkjemaVerdier: PT.object,
  hentPerson: PT.func.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  oppdaterFormFelt: PT.func.isRequired,
};

Informasjon.defaultProps = {
  sakstyper: [],
  journalforingSkjemaVerdier: {},
};
const mapStateToProps = state => ({
  person: PersonSelectors.personSelector(state),
  organisasjon: OrganisasjonSelectors.organisasjonSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentPerson: fnr => PersonOperations.hentPerson(fnr),
  hentOrganisasjon: orgnr => OrganisasjonOperations.hentOrganisasjon(orgnr),
  oppdaterFormFelt: (feltNavn, verdi) => dispatch(change('journalforing', feltNavn, verdi)),
});
export default connect(mapStateToProps, mapDispatchToProps)(Informasjon);
