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
  skalFeltetDisables = feltNavn => {
    const { journalforingSkjemaVerdier } = this.props;

    switch (feltNavn) {
      case 'avsenderNavn': { return journalforingSkjemaVerdier.avsenderFnrOrgnr !== ''; }
      default: return false;
    }
  }

  render() {
    const { sakstyper } = this.props;
    const { skalFeltetDisables } = this;

    return (
      <div className="informasjon">
        <Nav.Fieldset legend="Informasjon om brukeren">
          <Skjema.Input feltNavn="brukersFnr" label="Brukers personnummer" />
          <Skjema.Input feltNavn="brukersNavn" label="Brukers etternavn" disabled />
          <Skjema.Checkbox feltNavn="erBrukerAvsender" label="Bruker er avsender" />
          <Skjema.Input feltNavn="avsenderFnrOrgnr" label="Avsender fødselsnummmer / Organisasjonsnummer" />
          <Skjema.Input feltNavn="avsenderNavn" label="Avsender fornavn" disabled={skalFeltetDisables('avsenderNavn')} />
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
          <Nav.Knapp>Åpne i Gosys</Nav.Knapp>
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
