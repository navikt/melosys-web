import React, { Component } from 'react';
import PT from 'prop-types';
import { Field } from 'redux-form';

import * as Utils from '../../../utils';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import { kodeTilObjekt, landTekstFormat } from './LandVelger';

import './landvelger.css';

export class EnkeltLand extends Component {
  state = {
    inputVerdi: '',
    error: null,
  };

  componentDidMount = () => {
    const { value } = this.props.input;
    const { landkoder } = this.props;
    const landkodeObjekt = value && kodeTilObjekt(value, landkoder);
    const inputVerdi = landkodeObjekt ? landTekstFormat(landkodeObjekt) : '';
    this.setInputVerdi(inputVerdi);
  };

  setInputVerdi = verdi => {
    this.setState({ inputVerdi: verdi });
  };

  reduxOppdaterLand = landkode => {
    if (!landkode) {
      const e = new Error('landkode må inneholde verdi.');
      Utils.logger.error(e);
      throw e;
    }
    const { onChange } = this.props.input;
    onChange(landkode);

    if (this.props.onChange) {
      this.props.onChange(landkode);
    }
  };

  reduxFjernLand = () => {
    const { onChange } = this.props.input;
    onChange('');

    if (this.props.onChange) {
      this.props.onChange();
    }
  };

  fokusInnHandler = e => {
    e.target.select();
  };

  inputTastNedHandler = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.fokusUtHandler();
    }
  };

  /** Søk etter land inkluderer landkode, dvs dersom saksbehandler skriver inn hele teksten "Sverige (SE)".
   * så vil søket fortsatt returnere riktig treff, selv om den EGENTLIGE termen kun er "Sverige".
   * @param inputVerdi
   * @returns {*}
   */
  finnFlereLand = inputVerdi => {
    const { landkoder } = this.props;
    if (!inputVerdi) return [];
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

  fokusUtHandler = () => {
    const { inputVerdi } = this.state;

    if (!inputVerdi) {
      this.reduxFjernLand();
      this.tomFeilmelding();
      return;
    }

    const landkodeObjekt = this.finnEttLand(inputVerdi);

    if (landkodeObjekt) {
      this.reduxOppdaterLand(landkodeObjekt.kode);
      this.setState({ inputVerdi: landTekstFormat(landkodeObjekt), error: null });
    } else {
      this.setState({ error: 'Finner ikke landet du har skrevet inn.' });
    }
  };

  inputEndringHandler = e => {
    const inputVerdi = e.target.value;
    this.setState({ inputVerdi });
  };

  tomFeilmelding = () => {
    this.setState({ error: null });
  };

  render () {
    const {
      fokusInnHandler, fokusUtHandler, inputTastNedHandler, inputEndringHandler,
    } = this;

    const {
      label, meta, dataListID, disabled, bredde,
    } = this.props;

    const { inputVerdi } = this.state;

    let { error: skjemaError = '' } = meta;
    /* Vi forventer at meta.error er en string eller et objekt */
    if (Utils._isObject(skjemaError)) skjemaError = skjemaError.melding;
    const { error: landError = '' } = this.state;
    const feilObjekt = skjemaError || landError ? { feilmelding: `${skjemaError || ''} ${landError || ''}` } : null;

    return (
      <div>
        <Nav.Input
          disabled={disabled}
          list={dataListID}
          label={label}
          bredde={bredde}
          feil={feilObjekt}
          className="landliste__linje__input"
          value={inputVerdi}
          onBlur={fokusUtHandler}
          onFocus={fokusInnHandler}
          onChange={inputEndringHandler}
          onKeyDown={inputTastNedHandler}
        />
      </div>
    );
  }
}

EnkeltLand.propTypes = {
  dataListID: PT.string.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  meta: PT.object.isRequired,
  label: PT.string,
  feil: PT.string,
  input: PT.object.isRequired,
  disabled: PT.bool,
  bredde: PT.string,
  onChange: PT.func,
};

EnkeltLand.defaultProps = {
  label: '',
  feil: '',
  disabled: false,
  bredde: 'XL',
  onChange: null,
};

const EnkeltLandWrapper = props => (<Field name={props.feltNavn} component={EnkeltLand} props={props} />);

EnkeltLandWrapper.propTypes = {
  feltNavn: PT.string.isRequired,
};

export default EnkeltLandWrapper;
