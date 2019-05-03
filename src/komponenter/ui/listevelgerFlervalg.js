/* eslint react/no-array-index-key:off */
import React, { Component } from 'react';
import PT from 'prop-types';
import Ikon from 'melosys-ikoner-assets';

import * as KV from '../../kodeverk';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes';

import './listevelgerFlervalg.css';

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
        <div className="knapp__ikon"><Ikon kind="minus" size="24" /></div>
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
  state = { valgteElementer: this.props.defaultElementer, inputVerdi: '', feilmelding: '' };

  vedEndring = event => {
    this.setState({ inputVerdi: event.target.value, feilmelding: '' });
  };

  vedTastNed = event => {
    if (event.key === 'Enter') { this.leggValgTilListe(event); }
  };

  kodeTilVerdi = kode => {
    const { muligeValg = [] } = this.props;
    const valgtKodeverkObjekt = muligeValg.find(item => KV.objektTilKode(item) === kode);
    return valgtKodeverkObjekt && KV.objektTilTerm(valgtKodeverkObjekt);
  };

  verdiTilKode = verdi => {
    const { muligeValg = [] } = this.props;
    const valgtKodeverkObjekt = muligeValg.find(item => KV.objektTilTerm(item) === verdi);
    return valgtKodeverkObjekt && KV.objektTilKode(valgtKodeverkObjekt);
  };

  erAlleredeLagtTil = verdi => {
    const { tillatFritekst } = this.props;
    const { valgteElementer = [] } = this.state;
    return !tillatFritekst && valgteElementer.some(valg => valg === verdi);
  };

  leggValgTilListe = e => {
    e.preventDefault();
    const { inputVerdi, valgteElementer } = this.state;
    const { verdiTilKode, erAlleredeLagtTil } = this;
    const { tillatFritekst, onChange } = this.props;

    const valg = tillatFritekst ? inputVerdi : verdiTilKode(inputVerdi);

    if (erAlleredeLagtTil(valg)) {
      this.setState({ feilmelding: 'Dette valget finnes allerede i listen.' });
      return false;
    }

    if (valg) {
      this.setState(prevState => ({ inputVerdi: '', valgteElementer: [...prevState.valgteElementer, valg], feilmelding: null }));
    } else {
      this.setState({ feilmelding: 'I dette feltet må du velge fra alternativene i nedtrekkslisten.' });
    }

    if (onChange) {
      onChange({ value: [...valgteElementer, valg] });
    }

    return true;
  };

  slettValgFraListe = index => {
    const { onChange } = this.props;

    const { valgteElementer } = this.state;

    if (onChange) {
      onChange({ value: valgteElementer.filter((element, i) => i !== index) });
    }

    this.setState(prevState => ({ valgteElementer: prevState.valgteElementer.filter((element, i) => i !== index) }));
  };

  oppdaterEksisterendeValg = (verdi, index) => {
    this.setState(prevState => ({
      valgteElementer: prevState.valgteElementer.map((element, i) => (
        i !== index ? element : { ...element, ...verdi }
      )),
    }));
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
    const internFeilmelding = this.state.feilmelding;
    const eksternFeilmelding = this.props.feil;
    const feilmeldingtekst = eksternFeilmelding || internFeilmelding;

    return feilmeldingtekst ? { feilmelding: feilmeldingtekst } : null;
  };

  render() {
    const {
      placeholder,
      label,
      muligeValg,
      disabled,
    } = this.props;

    const { valgteElementer } = this.state;

    const { byggValgtListe } = this;

    const feil = this.byggFeilmelding();

    const datalistID = uuid();

    return (
      <div className="listevelger">
        {byggValgtListe(valgteElementer)}
        <div className="listevelger__linje">
          <Nav.Input
            id={`listevelger-${datalistID}`}
            label={label}
            feil={feil}
            placeholder={placeholder}
            onChange={this.vedEndring}
            onKeyDown={this.vedTastNed}
            value={this.state.inputVerdi}
            list={datalistID}
            className="listevelger__linje__input"
            disabled={disabled}
          />
          <Nav.Knapp
            mini
            className="listevelger__linje__knapp listevelger__linje__knapp--leggtil"
            onClick={this.leggValgTilListe}
            disabled={disabled}
          >
            <div className="knapp__ikon"><Ikon kind="tilsette" size="24" /></div>
            <div className="knapp__tittel">Legg til</div>
          </Nav.Knapp>
        </div>
        <datalist id={datalistID}>
          {muligeValg.map(valg => <option key={uuid()} value={KV.objektTilTerm(valg)} />)}
        </datalist>
      </div>
    );
  }
}

ListevelgerFlervalg.propTypes = {
  className: PT.string,
  defaultElementer: PT.arrayOf(PT.string),
  disabled: PT.bool.isRequired,
  feil: PT.string,
  label: PT.string.isRequired,
  muligeValg: PT.arrayOf(MPT.Kodeverk).isRequired,
  onChange: PT.func,
  placeholder: PT.string,
  tillatFritekst: PT.bool.isRequired,
};

ListevelgerFlervalg.defaultProps = {
  className: '',
  defaultElementer: [],
  feil: undefined,
  onChange: undefined,
  placeholder: '',
};

export default ListevelgerFlervalg;
