/* eslint react/no-array-index-key:off */
import React, { Component } from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';

import './listevelger.css';

const uuid = require('uuid/v4');

/** Dette er komponent for ett enkeltvalg. Dersom tillatFritekst === true, vil Nav.Input brukes
 * slik at brukeren kan redigere innholdet i feltet også ETTER at det er lagt til.
 */
const ListevelgerValgtElement = ({
  label, slettElement, oppdaterElement, tillatFritekst,
}) => {
  const element = tillatFritekst ?
    <Nav.Input value={label} label="" className="listevelger__linje__input" onChange={oppdaterElement} onKeyDown={event => (event.key === 'Enter') && event.preventDefault()} />
    :
    <div className="listevelger__linje__input" >{label}</div>;

  return (
    <div className="listevelger__linje">
      <div className="listevelger__innhold">
        { element }
      </div>
      <button className="listevelger__linje__knapp" onClick={slettElement}>-</button>
    </div>
  );
};

ListevelgerValgtElement.propTypes = {
  label: PT.string.isRequired,
  slettElement: PT.func.isRequired,
  tillatFritekst: PT.bool,
  oppdaterElement: PT.func,
};

ListevelgerValgtElement.defaultProps = {
  oppdaterElement: () => {},
  tillatFritekst: false,
};

/** Komponenten lar brukeren legge til flere valg.
 * For hvert nye valg legges dette til som en FieldArray i Redux Form.
 */
class ListevelgerFlervalg extends Component {
  state = { inputVerdi: '', feilmelding: '' }

  vedEndring = event => {
    this.setState({ inputVerdi: event.target.value });
  }

  vedTastNed = event => {
    if (event.key === 'Enter') { this.leggTilValg(event); }
  }

  kodeTilVerdi = verdi => {
    const { muligeValg = [] } = this.props;
    const valgtKodeverkObjekt = muligeValg.find(item => item.term === verdi);
    return valgtKodeverkObjekt && valgtKodeverkObjekt.kode;
  }

  verdiTilKode = kode => {
    const { muligeValg = [] } = this.props;
    const valgtKodeverkObjekt = muligeValg.find(item => item.kode === kode);
    return valgtKodeverkObjekt && valgtKodeverkObjekt.term;
  }

  erAlleredeLagtTil = verdi => {
    const { fields } = this.props;
    const alleValg = fields.getAll();
    return alleValg.some(valg => valg === verdi);
  }

  leggTilValg = e => {
    e.preventDefault();
    const { inputVerdi } = this.state;
    const { kodeTilVerdi, erAlleredeLagtTil } = this;
    const { fields, tillatFritekst } = this.props;

    const valg = tillatFritekst ? inputVerdi : kodeTilVerdi(inputVerdi);

    if (erAlleredeLagtTil(valg)) {
      this.setState({ feilmelding: 'Dette valget finnes allerede i listen.' });
      return false;
    }

    if (valg) {
      fields.push(valg);
      this.setState({ inputVerdi: '', feilmelding: null });
    } else {
      this.setState({ feilmelding: 'I dette feltet må du velge fra alternativene i nedtrekkslisten.' });
    }

    return true;
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
    <ListevelgerValgtElement
      key={index}
      label={verdi}
      slettElement={() => this.slettElement(index)}
      oppdaterElement={event => this.oppdaterElement(event.target.value, index)}
      tillatFritekst
    />);

  byggValgtElement = (verdi, index) => (
    <ListevelgerValgtElement
      key={index}
      label={verdi}
      slettElement={() => this.slettElement(index)}
    />);

  byggValgtListe = alleFelter => {
    const {
      byggValgtElement,
      byggValgtRedigerbartElement,
    } = this;

    const { tillatFritekst } = this.props;

    return alleFelter.map((verdi, index) => {
      const verdiTilKode = tillatFritekst ? verdi : this.verdiTilKode(verdi);
      return tillatFritekst ? byggValgtRedigerbartElement(verdi, index) : byggValgtElement(verdiTilKode, index);
    });
  }

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
    } = this.props;

    const { byggValgtListe } = this;

    const alleFelter = fields.getAll() || [];
    const feil = this.byggFeilmelding();

    return (
      <div>
        {byggValgtListe(alleFelter)}
        <label htmlFor={`listevelger-${fields.name}`}>{label}
          <div className="listevelger__linje">
            <Nav.Input
              id={`listevelger-${fields.name}`}
              label=""
              feil={feil}
              placeholder={placeholder}
              onChange={this.vedEndring}
              onKeyDown={this.vedTastNed}
              value={this.state.inputVerdi}
              list={`dataliste-${fields.name}`}
              className="listevelger__linje__input"
            />
            <button
              className="listevelger__linje__knapp listevelger__linje__knapp--leggtil"
              onClick={this.leggTilValg}>+
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

ListevelgerFlervalg.propTypes = {
  fields: PT.object.isRequired,
  label: PT.string.isRequired,
  meta: PT.object.isRequired,
  muligeValg: PT.array.isRequired,
  tillatFritekst: PT.bool.isRequired,
  placeholder: PT.string,
};

ListevelgerFlervalg.defaultProps = {
  placeholder: '',
};

export default ListevelgerFlervalg;
