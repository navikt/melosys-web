import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { change } from 'redux-form';
import PT from 'prop-types';

import * as Skjema from '../skjema/';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes/';

import EnkeltDato from '../datoOmrade/enkeltDato';

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
  };

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
  };

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
      case 'avsendersNavn': { return journalforingSkjemaVerdier.avsenderFnrOrgnr !== ''; }
      case 'avsendersID': { return journalforingSkjemaVerdier.erBrukerAvsender; }
      default: return false;
    }
  };

  render() {
    const { journalforing, dokumentTittel, vedleggsTitler } = this.props;
    const { dokument = {} } = journalforing;
    const { spinner: { brukersNavn: visBrukerSpinner }, spinner: { avsenderNavn: visAvsenderSpinner } } = this.state;
    const { skalFeltetDisables } = this;

    return (
      <div className="informasjon">
        <Nav.Fieldset legend="Informasjon om brukeren">
          <Skjema.Input feltNavn="brukersID" label="Brukers personnummer eller D-nummer" onKeyUp={this.onKeyUp} />
          <Skjema.Input feltNavn="brukersNavn" label="Brukers navn" disabled />
          { visBrukerSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" /> }
          <Skjema.Checkbox feltNavn="erBrukerAvsender" label="Bruker er avsender" />
          <Skjema.Input feltNavn="avsendersID" label="Avsenders fnr, dnr eller orgnr" disabled={skalFeltetDisables('avsendersID')} onKeyUp={this.onKeyUp} />
          <Skjema.Input feltNavn="avsendersNavn" label="Avsenders navn eller firmanavn" disabled={skalFeltetDisables('avsendersNavn')} />
          { visAvsenderSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" /> }
        </Nav.Fieldset>
        <Nav.Fieldset legend="Informasjon om dokument">
          { dokument.url && <Link to={dokument.url} target="_blank" className="informasjon__dokumentlenke"><EnkeltDato dato={dokument.mottattDato} />: {dokument.tittel.term}</Link> }
          <Skjema.Select feltNavn="dokumentTittel" label="Tittel på hoveddokument">
            { dokumentTittel.map(tittel => <option key={uuid()} value={tittel.kode}>{tittel.term}</option>)}
          </Skjema.Select>
          <Skjema.ListeVelger feltNavn="vedleggsTitler" label="Titler på vedlegg" multiListe muligeValg={vedleggsTitler} />
        </Nav.Fieldset>
        <div className="informasjon__knapper">
          <Nav.Knapp>Avbryt</Nav.Knapp>
        </div>
      </div>
    );
  }
}

Informasjon.propTypes = {
  journalforing: MPT.Journalforing.isRequired,
  dokumentTittel: PT.array,
  vedleggsTitler: PT.array,
  journalforingSkjemaVerdier: PT.object,
  hentPerson: PT.func.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  oppdaterFormFelt: PT.func.isRequired,
};

Informasjon.defaultProps = {
  journalforingSkjemaVerdier: {},
  dokumentTittel: '',
  vedleggsTitler: [],
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
