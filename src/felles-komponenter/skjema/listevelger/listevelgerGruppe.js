import React, { Component } from 'react';
import PT from 'prop-types';
import { Input as NavInput } from 'nav-frontend-skjema';
import Icon from 'nav-frontend-ikoner-assets';

import './listevelger.css';

const uuid = require('uuid/v4');

const ListevelgerValgtListe = ({ label, slettElement }) => (
  <div className="listevelger__linje">
    <div className="listevelger__innhold">
      <Icon kind="vedlegg" size={16} />
      <div className="listevelger__innhold__label">{label}</div>
    </div>
    <button className="listevelger__linje__knapp" onClick={slettElement}>-</button>
  </div>
);

ListevelgerValgtListe.propTypes = {
  label: PT.string.isRequired,
  slettElement: PT.func.isRequired,
};

class ListevelgerGruppe extends Component {
  state = { inputVerdi: '' }

  onChange = event => {
    this.setState({ inputVerdi: event.target.value });
  }

  onKeyDown = event => {
    if (event.key === 'Enter') { this.leggTilListeHandler(event); }
  }

  /** Håndterer klikk på pluss-knappen ved liste dersom brukeren har valgt et liste manuelt.
   *
   * @param e
   */
  leggTilListeHandler = e => {
    e.preventDefault();
    const { inputVerdi } = this.state;
    const { fields } = this.props;

    fields.push(inputVerdi);
    this.setState({ inputVerdi: '' });
  }

  slettFraListen = index => {
    const { fields } = this.props;
    fields.remove(index);
  }

  render() {
    const {
      fields,
      placeholder,
      feil,
      label,
      muligeValg,
    } = this.props;

    const alleFelter = fields.getAll() || [];

    return (
      <div>
        <label htmlFor={`listevelger-${fields.name}`}>{label}</label>
        {
          alleFelter.map((verdi, index) => <ListevelgerValgtListe key={uuid()} label={verdi} slettElement={() => this.slettFraListen(index)} />)
        }
        <div className="listevelger__linje">
          <NavInput
            id={`listevelger-${fields.name}`}
            label=""
            feil={feil}
            placeholder={placeholder}
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
  muligeValg: PT.array.isRequired,
  placeholder: PT.string,
  feil: PT.string,
};

ListevelgerGruppe.defaultProps = {
  placeholder: '',
  feil: undefined,
};

export default ListevelgerGruppe;
