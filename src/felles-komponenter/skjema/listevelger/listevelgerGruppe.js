/* eslint react/no-array-index-key:off */
import React, { Component } from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';

import './listevelger.css';

const uuid = require('uuid/v4');

/** Dette er komponent for ett enkeltvalg. Inneholder et ikon, navnet på valget
 * og en sletteknapp.
 */
const ListevelgerValgtRedigerbartElement = ({ label, slettElement, oppdaterElement }) => (
  <div className="listevelger__linje">
    <div className="listevelger__innhold">
      <Nav.Input value={label} label="" className="listevelger__linje__input" onChange={oppdaterElement} onKeyDown={event => (event.key === 'Enter') && event.preventDefault()} />
    </div>
    <button className="listevelger__linje__knapp" onClick={slettElement}>-</button>
  </div>
);

ListevelgerValgtRedigerbartElement.propTypes = {
  label: PT.string.isRequired,
  slettElement: PT.func.isRequired,
  oppdaterElement: PT.func.isRequired,
};

/** Dette er komponent for ett enkeltvalg. Inneholder et ikon, navnet på valget
 * og en sletteknapp.
 */
const ListevelgerValgtElement = ({ label, slettElement }) => (
  <div className="listevelger__linje">
    <div className="listevelger__innhold">
      <div className="listevelger__linje__input" >{label}</div>
    </div>
    <button className="listevelger__linje__knapp" onClick={slettElement}>-</button>
  </div>
);

ListevelgerValgtElement.propTypes = {
  label: PT.string.isRequired,
  slettElement: PT.func.isRequired,
  oppdaterElement: PT.func.isRequired,
};

/** Komponenten lar brukeren legge til flere valg, men da kun ett valg pr liste.
 * For hvert nye valg legges dette til som en FieldArray i Redux Form.
 */
class ListevelgerGruppe extends Component {
  state = { inputVerdi: '', feilmelding: '' }

  onChange = event => {
    this.setState({ inputVerdi: event.target.value });
  }

  onKeyDown = event => {
    if (event.key === 'Enter') { this.leggTilListeHandler(event); }
  }

  finnesVerdienBlantMuligeValg = verdi => {
    const { muligeValg = [] } = this.props;
    return muligeValg.some(item => item.term === verdi);
  }

  leggTilListeHandler = e => {
    e.preventDefault();
    const { inputVerdi } = this.state;
    const { finnesVerdienBlantMuligeValg } = this;
    const { fields } = this.props;

    if (finnesVerdienBlantMuligeValg(inputVerdi)) {
      fields.push(inputVerdi);
      this.setState({ inputVerdi: '', feilmelding: null });
    } else {
      this.setState({ feilmelding: 'I dette feltet må du velge fra alternativene i nedtrekkslisten.' });
    }
  }

  slettElement = index => {
    const { fields } = this.props;
    fields.remove(index);
  }

  oppdaterElement = (verdi, index) => {
    const { fields } = this.props;
    fields.remove(index);
    fields.insert(index, verdi);
  }

  byggValgtRedigerbartElement = (verdi, index) => (
    <ListevelgerValgtRedigerbartElement
      key={index}
      label={verdi}
      slettElement={() => this.slettElement(index)}
      oppdaterElement={event => this.oppdaterElement(event.target.value, index)}
    />);

  byggValgtElement = (verdi, index) => (
    <ListevelgerValgtElement
      key={index}
      label={verdi}
      slettElement={() => this.slettElement(index)}
    />);

  byggFeilmelding = () => {
    const { error } = this.props.meta;
    const { feilmelding } = this.state;
    let feilmeldingTekst;

    if (error) {
      feilmeldingTekst = error;
    } else {
      feilmeldingTekst = feilmelding;
    }

    return feilmeldingTekst ? { feilmelding: feilmeldingTekst } : null;
  }

  render() {
    const {
      fields,
      placeholder,
      label,
      muligeValg,
      tillatFritekst,
    } = this.props;

    const {
      byggValgtElement,
      byggValgtRedigerbartElement,
    } = this;

    const alleFelter = fields.getAll() || [];
    const feil = this.byggFeilmelding();

    return (
      <div>
        {
          alleFelter.map((verdi, index) => (tillatFritekst ? byggValgtRedigerbartElement(verdi, index) : byggValgtElement(verdi, index)))
        }
        <label htmlFor={`listevelger-${fields.name}`}>{label}
          <div className="listevelger__linje">
            <Nav.Input
              id={`listevelger-${fields.name}`}
              label=""
              feil={feil}
              placeholder={placeholder}
              onBlur={this.onBlur}
              onFocus={this.onFocus}
              onChange={this.onChange}
              onKeyDown={this.onKeyDown}
              value={this.state.inputVerdi}
              list={`dataliste-${fields.name}`}
              className="listevelger__linje__input"
            />
            <button
              className="listevelger__linje__knapp listevelger__linje__knapp--leggtil"
              onClick={this.leggTilListeHandler}>+
            </button>
          </div>
        </label>
        <datalist id={`dataliste-${fields.name}`}>
          {muligeValg.map(valg => <option key={uuid()} value={valg.term} />)}
        </datalist>
      </div>
    );
  }
}

ListevelgerGruppe.propTypes = {
  fields: PT.object.isRequired,
  label: PT.string.isRequired,
  meta: PT.object.isRequired,
  muligeValg: PT.array.isRequired,
  tillatFritekst: PT.bool.isRequired,
  placeholder: PT.string,
};

ListevelgerGruppe.defaultProps = {
  placeholder: '',
};

export default ListevelgerGruppe;
