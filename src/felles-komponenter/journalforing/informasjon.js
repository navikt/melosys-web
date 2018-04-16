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
  onKeyUp = event => {
    const { oppdaterAvsenderNavn, oppdaterBrukersNavn } = this.props;
    const { id, value } = event.target;
    if (!value || !value.length) {
      return;
    }
    switch (id) {
      case 'brukersFnr':
        if (value.length === 11) {
          this.props.hentPerson(value).then(response => oppdaterBrukersNavn(response.sammensattNavn));
        } else {
          oppdaterBrukersNavn('');
        }
        break;
      case 'avsenderFnrOrgnr':
        if (value.length === 9) {
          this.props.hentOrganisasjon(value).then(response => oppdaterAvsenderNavn(response.navn));
        } else if (value.length === 11) {
          this.props.hentPerson(value).then(response => oppdaterAvsenderNavn(response.sammensattNavn));
        } else {
          oppdaterAvsenderNavn('');
        }
        break;
      default:
        break;
    }
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
    const { skalFeltetDisables } = this;

    return (
      <div className="informasjon">
        <Nav.Fieldset legend="Informasjon om brukeren">
          <Skjema.Input feltNavn="brukersFnr" label="Brukers personnummer eller D-nummer" onKeyUp={this.onKeyUp} />
          <Skjema.Input feltNavn="brukersNavn" label="Brukers navn" disabled />
          <Skjema.Checkbox feltNavn="erBrukerAvsender" label="Bruker er avsender" />
          <Skjema.Input feltNavn="avsenderFnrOrgnr" label="Avsender fødselsnummer eller orgnr" onKeyUp={this.onKeyUp} />
          <Skjema.Input feltNavn="avsenderNavn" label="Avsenders navn eller firmanavn" disabled={skalFeltetDisables('avsenderNavn')} />
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
  oppdaterAvsenderNavn: PT.func.isRequired,
  oppdaterBrukersNavn: PT.func.isRequired,
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
  oppdaterAvsenderNavn: navn => dispatch(change('journalforing', 'avsenderNavn', navn)),
  oppdaterBrukersNavn: navn => dispatch(change('journalforing', 'brukersNavn', navn)),
});
export default connect(mapStateToProps, mapDispatchToProps)(Informasjon);
