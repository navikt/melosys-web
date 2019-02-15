/* eslint react/no-array-index-key:off */
import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import Melosysikon from '../../../felles-komponenter/melosysikon';
import { kodeverkObjektTilTerm, kodeverkObjektTilKode } from '../../../utils/kodeverk';

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
      <Nav.Knapp mini className="listevelger__linje__knapp" onClick={slettElement}>
        <div className="knapp__ikon"><Melosysikon kind="minus" size="24" /></div>
        <div className="knapp__tittel">Fjern</div>
      </Nav.Knapp>
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
  state = { inputVerdi: '', feilmelding: '' };

  vedEndring = event => {
    this.setState({ inputVerdi: event.target.value, feilmelding: '' });
  };

  vedTastNed = event => {
    if (event.key === 'Enter') { this.leggValgTilListe(event); }
  };

  kodeTilVerdi = kode => {
    const { muligeValg = [] } = this.props;
    const valgtKodeverkObjekt = muligeValg.find(item => kodeverkObjektTilKode(item) === kode);
    return valgtKodeverkObjekt && kodeverkObjektTilTerm(valgtKodeverkObjekt);
  };

  verdiTilKode = verdi => {
    const { muligeValg = [] } = this.props;
    const valgtKodeverkObjekt = muligeValg.find(item => kodeverkObjektTilTerm(item) === verdi);
    return valgtKodeverkObjekt && kodeverkObjektTilKode(valgtKodeverkObjekt);
  };

  erAlleredeLagtTil = verdi => {
    const { fields, tillatFritekst } = this.props;
    const alleValg = fields.getAll() || [];
    return !tillatFritekst && alleValg.some(valg => valg === verdi);
  };

  leggValgTilListe = e => {
    e.preventDefault();
    const { inputVerdi } = this.state;
    const { verdiTilKode, erAlleredeLagtTil } = this;
    const { fields, tillatFritekst } = this.props;

    const valg = tillatFritekst ? inputVerdi : verdiTilKode(inputVerdi);

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
  };

  slettValgFraListe = index => {
    const { fields } = this.props;
    fields.remove(index);
  };

  oppdaterEksisterendeValg = (verdi, index) => {
    const { fields } = this.props;
    fields.remove(index);
    fields.insert(index, verdi);
  };

  byggValgtRedigerbartElement = (verdi, index) => (
    <ListevelgerValgtElement
      key={index}
      label={verdi}
      slettElement={() => this.slettValgFraListe(index)}
      oppdaterElement={event => this.oppdaterEksisterendeValg(event.target.value, index)}
      tillatFritekst
    />);

  byggValgtElement = (verdi, index) => (
    <ListevelgerValgtElement
      key={index}
      label={verdi}
      slettElement={() => this.slettValgFraListe(index)}
    />);

  byggValgtListe = eksisterendeValg => {
    const {
      byggValgtElement,
      byggValgtRedigerbartElement,
    } = this;

    const { tillatFritekst } = this.props;

    return eksisterendeValg.map((verdi, index) => {
      const lesbarVerdi = tillatFritekst ? verdi : this.kodeTilVerdi(verdi);
      return tillatFritekst ? byggValgtRedigerbartElement(verdi, index) : byggValgtElement(lesbarVerdi, index);
    });
  };

  byggFeilmelding = () => {
    const { error } = this.props.meta;
    const { feilmelding } = this.state;
    const feilmeldingTekst = error || feilmelding;

    return feilmeldingTekst ? { feilmelding: feilmeldingTekst } : null;
  };

  render() {
    const {
      fields,
      placeholder,
      label,
      muligeValg,
      disabled,
    } = this.props;

    const { byggValgtListe } = this;

    const alleFelter = fields.getAll() || [];
    const feil = this.byggFeilmelding();

    return (
      <div>
        {byggValgtListe(alleFelter)}
        <div className="listevelger__linje">
          <Nav.Input
            id={`listevelger-${fields.name}`}
            label={label}
            feil={feil}
            placeholder={placeholder}
            onChange={this.vedEndring}
            onKeyDown={this.vedTastNed}
            value={this.state.inputVerdi}
            list={`dataliste-${fields.name}`}
            className="listevelger__linje__input"
            disabled={disabled}
          />
          <Nav.Knapp
            mini
            className="listevelger__linje__knapp listevelger__linje__knapp--leggtil"
            onClick={this.leggValgTilListe}
            disabled={disabled}
          >
            <div className="knapp__ikon"><Melosysikon kind="tilsette" size="24" /></div>
            <div className="knapp__tittel">Legg til</div>
          </Nav.Knapp>
        </div>
        <datalist id={`dataliste-${fields.name}`}>
          {muligeValg.map(valg => <option key={uuid()} value={kodeverkObjektTilTerm(valg)} />)}
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
  disabled: PT.bool.isRequired,
};

ListevelgerFlervalg.defaultProps = {
  placeholder: '',
};

export default ListevelgerFlervalg;
