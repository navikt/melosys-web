import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PT from 'prop-types';

import * as Skjema from '../skjema/';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes/';

import './informasjon.css';

const uuid = require('uuid/v4');

/** Denne komponenten inneholder skjemafelter nødvendig for journalføringen
 * slik som informasjon om bruker, informasjon om dokument etc.
 */
class Informasjon extends Component {
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
  }

  /** Noen felter skal skjules dersom andre felter er fylt inn eller andre
   * forutsetninger for skjuling er tilstede.
   * @param feltNavn {string} Navnet på feltet som skal skjules.
   * @returns {boolean} Hvorvidt feltet skal disables eller ikke
   */
  skalFeltetVises = feltNavn => {
    const { journalforingSkjemaVerdier } = this.props;

    switch (feltNavn) {
      case 'avsenderNavn': { return journalforingSkjemaVerdier.erBrukerAvsender; }
      case 'avsenderFnrOrgnr': { return journalforingSkjemaVerdier.erBrukerAvsender; }
      default: return false;
    }
  }

  render() {
    const { sakstyper } = this.props;
    const { skalFeltetDisables, skalFeltetVises } = this;

    return (
      <div className="informasjon">
        <Nav.Fieldset legend="Informasjon om brukeren">
          <Skjema.Input feltNavn="brukersFnr" label="Brukers personnummer" />
          <Skjema.Input feltNavn="brukersNavn" label="Brukers navn" disabled />
          <Skjema.Checkbox feltNavn="erBrukerAvsender" label="Bruker er avsender" />
          <Skjema.Input feltNavn="avsenderFnrOrgnr" label="Avsender fødselsnummmer / Organisasjonsnummer" hidden={skalFeltetVises('avsenderFnrOrgnr')} />
          <Skjema.Input feltNavn="avsenderNavn" label="Avsenders navn" hidden={skalFeltetVises('avsenderNavn')} disabled={skalFeltetDisables('avsenderNavn')} />
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
};

Informasjon.defaultProps = {
  sakstyper: [],
  journalforingSkjemaVerdier: {},
};

export default Informasjon;
