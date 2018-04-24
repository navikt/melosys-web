import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Skjema from '../skjema/';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes/';
import * as Konstanter from '../../constants';

import './informasjon.css';
import { PersonSelectors } from '../../ducks/person';
import { OrganisasjonSelectors } from '../../ducks/organisasjon';

const uuid = require('uuid/v4');

/** Denne komponenten inneholder skjemafelter nødvendig for journalføringen
 * slik som informasjon om bruker, informasjon om dokument etc.
 */
class Informasjon extends Component {
  state = { spinner: {} };

  vedIDFeltTastOpp = event => {
    const { id, value } = event.target;
    const { hentBruker, hentAvsender } = this.props;
    const nummerAntallSomUtloserSok = [Konstanter.ANTALL_TALL_I_DNR, Konstanter.ANTALL_TALL_I_FNR, Konstanter.ANTALL_TALL_I_ORGNR];

    if (!nummerAntallSomUtloserSok.includes(value.length)) { return; }

    if (id === 'brukersID') {
      hentBruker(value, id);
    } else if (id === 'avsenderID') {
      hentAvsender(value, id);
    }
  };

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
  };

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
          <Skjema.Input feltNavn="brukersID" label="Brukers personnummer eller D-nummer" onKeyUp={this.vedIDFeltTastOpp} />
          <Skjema.Input feltNavn="brukersNavn" label="Brukers navn" disabled />
          { visBrukerSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" /> }
          <Skjema.Checkbox feltNavn="erBrukerAvsender" label="Bruker er avsender" />
          <Skjema.Input feltNavn="avsenderID" label="Avsender fødselsnummer eller orgnr" onKeyUp={this.vedIDFeltTastOpp} />
          <Skjema.Input feltNavn="avsenderNavn" label="Avsenders navn eller firmanavn" disabled={skalFeltetDisables('avsenderNavn')} />
          { visAvsenderSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" /> }
        </Nav.Fieldset>
        <Nav.Fieldset legend="Informasjon om dokument">
          <Link to="/dokumenttest.pdf" target="_blank" className="informasjon__dokumentlenke">26.04.2018: Kort navn på dokumentet</Link>
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
  hentBruker: PT.func.isRequired,
  hentAvsender: PT.func.isRequired,
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

});
export default connect(mapStateToProps, mapDispatchToProps)(Informasjon);
