import React, { Component } from 'react';
import PT from 'prop-types';
import { Field } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes/';
import { landTekstFormat } from './index';

import './landvelger.css';

class EnkeltLand extends Component {
  state = {
    inputVerdi: '',
    error: null,
  }

  componentDidMount = () => {
    const { value } = this.props.input;
    const { finnEttLand } = this;
    const landKodeObjekt = value && finnEttLand(value);
    this.setState({ inputVerdi: landTekstFormat(landKodeObjekt) });
  }

  reduxOppdaterLand = landKode => {
    if (!landKode) throw new Error('landKode må inneholde verdi.');
    const { onChange } = this.props.input;
    onChange(landKode);
  };

  fokusInnHandler = e => {
    e.target.select();
  };

  inputTastNedHandler = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.enkeltLandFokusUtHandler();
    }
  }

  /** Søk etter land inkluderer landkode, dvs dersom saksbehandler skriver inn hele teksten "Sverige (SE)".
   * så vil søket fortsatt returnere riktig treff, selv om den EGENTLIGE termen kun er "Sverige".
   * @param inputVerdi
   * @returns {*}
   */
  finnLand = inputVerdi => {
    const { landkoder } = this.props;
    return landkoder.filter(land => (
      landTekstFormat(land)
        .toLowerCase()
        .includes(inputVerdi.toLowerCase())
    ));
  }

  finnEttLand = inputVerdi => {
    const landListe = this.finnLand(inputVerdi);
    return landListe.length === 1 ? landListe[0] : false;
  }

  fokusUtHandler = () => {
    const { inputVerdi } = this.state;

    if (!inputVerdi) {
      this.tomFeilmelding();
      return;
    }

    const landKodeObjekt = this.finnEttLand(inputVerdi);

    if (landKodeObjekt) {
      this.reduxOppdaterLand(landKodeObjekt.kode);
      this.setState({ inputVerdi: landTekstFormat(landKodeObjekt), error: null });
    } else {
      this.setState({ error: 'Finner ikke landet du har skrevet inn.' });
    }
  };

  inputEndringHandler = e => {
    const inputVerdi = e.target.value;
    this.setState({ inputVerdi });
  }

  tomFeilmelding = () => {
    this.setState({ error: null });
  }

  render () {
    const {
      fokusInnHandler, fokusUtHandler, inputTastNedHandler, inputEndringHandler,
    } = this;

    const {
      label, meta,
    } = this.props;

    const { inputVerdi } = this.state;
    const { error: skjemaError = '' } = meta;
    const { error: landError = '' } = this.state;
    const feilObjekt = skjemaError || landError ? { feilmelding: `${skjemaError} ${landError}` } : null;

    return (
      <div>
        <Nav.Input
          list="alleLand"
          label={label}
          bredde="XL"
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
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  meta: PT.object.isRequired,
  label: PT.string,
  feil: PT.string,
  input: PT.object.isRequired,
  disabled: PT.bool,
};

EnkeltLand.defaultProps = {
  label: '',
  feil: '',
  disabled: false,
};

const EnkeltLandWrapper = props => (<Field name={props.feltNavn} component={EnkeltLand} props={props} />);

EnkeltLandWrapper.propTypes = {
  feltNavn: PT.string.isRequired,
};

export default EnkeltLandWrapper;
