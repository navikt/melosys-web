import React, { Component } from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';

import { kodeTilObjekt, landTekstFormat } from './';
import { kodeverkObjektTilKode } from '../../../kodeverk/kodeverk';

import * as MPT from '../../../proptypes';

import './landvelger.css';

const MultiLandEnkelt = ({ landObjekt, slettLandHandler }) => (
  <div className="landliste__linje">
    <div className="landliste__linje__navn">
      {landTekstFormat(landObjekt)}
    </div>
    <Nav.Knapp
      mini
      className="landliste__linje__knapp"
      onClick={e => slettLandHandler(e, kodeverkObjektTilKode(landObjekt))}
    >Fjern
    </Nav.Knapp>
  </div>
);

MultiLandEnkelt.propTypes = {
  landObjekt: PT.object.isRequired,
  slettLandHandler: PT.func.isRequired,
};

class MultiLand extends Component {
  state = {
    inputVerdi: '',
    error: null,
  };

  reduxLeggTilLand = landKode => {
    const { fields } = this.props;
    const valgteLand = fields.getAll() || [];

    // Todo: Legg til logging.
    if (!landKode) throw new Error('landKode må inneholde verdi.');

    if (!valgteLand.includes(landKode)) {
      fields.push(landKode);
    }
  };

  reduxSlettEttLand = landKode => {
    const index = this.props.fields.getAll().findIndex(item => item === landKode);
    return (index > -1 && this.props.fields.remove(index));
  };

  finnFlereLand = inputVerdi => {
    const { landkoder } = this.props;
    return landkoder.filter(land => (
      landTekstFormat(land)
        .toLowerCase()
        .includes(inputVerdi.toLowerCase())
    ));
  };

  finnEttLand = inputVerdi => {
    const landListe = this.finnFlereLand(inputVerdi);
    return landListe.length === 1 ? landListe[0] : false;
  };

  tomFeilmelding = () => {
    this.setState({ error: null });
  };

  dynamiskTittel = () => {
    const { fields } = this.props;
    const count = fields ? fields.length : 0;
    return (count > 0 ? 'Legg til evt flere land:' : 'Legg til første land:');
  };

  /** ----------------------------------------------------------------------
   *                           EVENT HANDLERS
   * -----------------------------------------------------------------------
   */

  slettLandHandler = (e, landKode) => {
    e.preventDefault();
    this.reduxSlettEttLand(landKode);
  };

  inputTastNedHandler = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.fokusUtHandler();
    }
  };

  fokusUtHandler = () => {
    const { inputVerdi } = this.state;

    if (!inputVerdi) {
      this.tomFeilmelding();
      return;
    }

    const landKodeObjekt = this.finnEttLand(inputVerdi);
    if (landKodeObjekt) {
      this.reduxLeggTilLand(landKodeObjekt.kode);
      this.setState({ inputVerdi: '', error: null });
    } else {
      this.setState({ error: 'Finner ikke landet du har skrevet inn.' });
    }
  };

  inputEndringHandler = e => {
    const inputVerdi = e.target.value;
    this.setState({ inputVerdi });
  };

  render() {
    const {
      fokusUtHandler,
      inputEndringHandler,
      inputTastNedHandler,
      slettLandHandler,
    } = this;

    const {
      disabled,
      fields,
      meta,
      landkoder,
      label,
      dataListID,
    } = this.props;

    const { inputVerdi } = this.state;
    const { error: skjemaError = '' } = meta;
    const { error: internLandError = '' } = this.state;

    const feilObjekt = skjemaError || internLandError ? { feilmelding: `${skjemaError} ${internLandError}` } : null;
    const valgteLand = fields.getAll() || [];
    const dynamiskFeltTittel = label || this.dynamiskTittel();

    return (
      <div className="landliste">
        {
          landkoder.length > 0 && valgteLand.map(land => <MultiLandEnkelt key={land} slettLandHandler={slettLandHandler} landObjekt={kodeTilObjekt(land, landkoder)} />)
        }
        <div className="landliste__leggtil">
          <Nav.Input
            list={dataListID}
            disabled={disabled}
            label={dynamiskFeltTittel}
            bredde="XL"
            feil={feilObjekt}
            className="landliste__linje__input"
            value={inputVerdi}
            onBlur={fokusUtHandler}
            onChange={inputEndringHandler}
            onKeyDown={inputTastNedHandler}
          />
          <Nav.Knapp mini className="landliste__linje__knapp">Legg til</Nav.Knapp>
        </div>
      </div>
    );
  }
}

MultiLand.propTypes = {
  dataListID: PT.string.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  label: PT.string,
  feil: PT.object,
  fields: PT.object.isRequired,
  meta: PT.object.isRequired,
  disabled: PT.bool,
};

MultiLand.defaultProps = {
  label: '',
  feil: {},
  disabled: false,
};

const MultiLandWrapper = props => (<FieldArray name={props.feltNavn} component={MultiLand} props={props} />);

MultiLandWrapper.propTypes = {
  feltNavn: PT.string.isRequired,
};

export default MultiLandWrapper;
