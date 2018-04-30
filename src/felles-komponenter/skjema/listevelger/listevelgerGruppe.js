import React, { Component } from 'react';
import PT from 'prop-types';
import { Input as NavInput } from 'nav-frontend-skjema';

import './listevelger.css';

const uuid = require('uuid/v4');

const ListevelgerValgtListe = ({ listeObjekt, slettListe }) => (
  <div className="listevelger__linje">
    <div className="listevelger__linje__navn">{listeObjekt.term}</div><button className="listevelger__linje__knapp" onClick={e => slettListe(e, listeObjekt.kode)}>-</button>
  </div>
);

ListevelgerValgtListe.propTypes = {
  listeObjekt: PT.object.isRequired,
  slettListe: PT.func.isRequired,
};

class ListevelgerGruppe extends Component {
  state = { inputVerdi: undefined }

  onChange = event => {
    this.setState({ inputVerdi: event.target.value });
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
  }

  render() {
    const {
      fields,
      placeholder,
      feil,
      label,
      muligeValg,
    } = this.props;

    return (
      <div>
        <NavInput label={label} feil={feil} placeholder={placeholder} onChange={this.onChange} list={`dataliste-${fields.name}`} />
        <datalist id={`dataliste-${fields.name}`}>
          {muligeValg.map(valg => <option key={uuid()} value={valg.term} />)}
        </datalist>
        <button
          className="listevelger__linje__knapp listevelger__linje__knapp--leggtil"
          onClick={this.leggTilListeHandler}>+
        </button>
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
