/* eslint react/no-array-index-key:off */
import React, { Component } from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';

import './listevelger.css';

const uuid = require('uuid/v4');

/** Dette er komponent for ett enkeltvalg. Inneholder et ikon, navnet på valget
 * og en sletteknapp.
 */
const ListevelgerValgtElement = ({ label, slettElement, oppdaterElement }) => (
  <div className="listevelger__linje">
    <div className="listevelger__innhold">
      <Nav.Input value={label} label="" className="listevelger__linje__input" onChange={oppdaterElement} onKeyDown={event => (event.key === 'Enter') && event.preventDefault()} />
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
  state = { inputVerdi: '', touched: false, active: false }

  onChange = event => {
    this.setState({ inputVerdi: event.target.value });
  }

  onKeyDown = event => {
    if (event.key === 'Enter') { this.leggTilListeHandler(event); }
  }

  onFocus = () => {
    this.setState({ touched: true, active: true });
  }

  onBlur = () => {
    this.setState({ touched: true, active: false });
  }

  leggTilListeHandler = e => {
    e.preventDefault();
    const { inputVerdi } = this.state;
    const { fields } = this.props;

    fields.push(inputVerdi);
    this.setState({ inputVerdi: '' });
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

  render() {
    const {
      fields,
      placeholder,
      label,
      meta,
      muligeValg,
    } = this.props;

    const alleFelter = fields.getAll() || [];
    const feil = (meta.invalid && (this.state.touched || meta.submitFailed) && !this.state.active) ? { feilmelding: meta.error } : null;

    return (
      <div>
        <label htmlFor={`listevelger-${fields.name}`}>{label}
          {
            alleFelter.map((verdi, index) => <ListevelgerValgtElement
              key={index}
              label={verdi}
              slettElement={() => this.slettElement(index)}
              oppdaterElement={event => this.oppdaterElement(event.target.value, index)}
            />)
          }
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
  placeholder: PT.string,
};

ListevelgerGruppe.defaultProps = {
  placeholder: '',
};

export default ListevelgerGruppe;
