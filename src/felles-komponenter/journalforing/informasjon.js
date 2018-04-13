import React from 'react';
import { Link } from 'react-router-dom';

import * as Skjema from '../skjema/';
import * as Nav from '../../utils/navFrontend';

import './informasjon.css';

/** Denne komponenten inneholder skjemafelter nødvendig for journalføringen
 * slik som informasjon om bruker, informasjon om dokument etc.
 * @returns {*}
 * @constructor
 */
const Informasjon = () => {
  return (
    <div className="informasjon">
      <Nav.Fieldset legend="Informasjon om brukeren">
        <Skjema.Input feltNavn="brukersFnr" label="Brukers personnummer" />
        <Skjema.Input feltNavn="brukersNavn" label="Brukers etternavn" />
        <Skjema.Checkbox feltNavn="erBrukerAvsender" label="Bruker er avsender" />
        <Skjema.Input feltNavn="avsenderFnrOrgnr" label="Avsender fødselsnummmer / Organisasjonsnummer" />
        <Skjema.Input feltNavn="avsenderNavn" label="Avsender fornavn" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Informasjon om dokument">
        <Link to="/foo/bar.pdf" className="informasjon__dokumentlenke">26.04.2018: Kort navn på dokumentet</Link>
        <Skjema.Select feltNavn="dokumentKategori" label="Dokumentkategori">
          <option value="kategori1">Kategori 1</option>
          <option value="kategori2">Kategori 2</option>
          <option value="kategori3">Kategori 3</option>
        </Skjema.Select>
        <Skjema.Select feltNavn="saksType" label="Sakstype">
          <option value="kategori1">Kategori 1</option>
          <option value="kategori2">Kategori 2</option>
          <option value="kategori3">Kategori 3</option>
        </Skjema.Select>
        <Skjema.Select feltNavn="tittel" label="Tittel">
          <option value="kategori1">Kategori 1</option>
          <option value="kategori2">Kategori 2</option>
          <option value="kategori3">Kategori 3</option>
        </Skjema.Select>
        <Skjema.Select feltNavn="vedleggsTittel" label="Vedleggstittel / beskrivelse">
          <option value="kategori1">Kategori 1</option>
          <option value="kategori2">Kategori 2</option>
          <option value="kategori3">Kategori 3</option>
        </Skjema.Select>
      </Nav.Fieldset>
      <Skjema.Checkbox feltNavn="inneholderSensitivInfo" label="Inneholder sensitiv info" />
      <div className="informasjon__knapper">
        <Nav.Knapp>Åpne i Gosys</Nav.Knapp>
        <Nav.Knapp>Avbryt</Nav.Knapp>
      </div>
    </div>
  );
};

Informasjon.propTypes = {};

Informasjon.defaultProps = {};

export default Informasjon;
