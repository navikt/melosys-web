import React, { Component } from 'react';
import PT from 'prop-types';
import classnames from 'classnames';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import { kodeTilObjekt, landTekstFormat } from './LandVelger';

import './landvelger.css';

class EnkeltLandPure extends Component {
  state = {
    inputVerdi: '',
    error: null,
  };

  componentDidMount = () => {
    const { value } = this.props;
    const { landkoder } = this.props;
    const landkodeObjekt = value && kodeTilObjekt(value, landkoder);
    const inputVerdi = landkodeObjekt ? landTekstFormat(landkodeObjekt) : '';
    this.setInputVerdi(inputVerdi);
  };
  setInputVerdi = verdi => {
    this.setState({ inputVerdi: verdi });
  };
  oppdaterLand = landkode => {
    if (!landkode) throw new Error('landkode må inneholde verdi.');
    const { onChange } = this.props;
    onChange(landkode);
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
      this.tomFeilmelding();
      return;
    }

    const landkodeObjekt = this.finnEttLand(inputVerdi);

    if (landkodeObjekt) {
      this.oppdaterLand(landkodeObjekt.kode);
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
      label, bredde, className, disabled,
    } = this.props;

    const { inputVerdi } = this.state;
    const { error: landError = '' } = this.state;
    const feilObjekt = landError ? { feilmelding: `${landError}` } : null;

    const cl = classnames({ landliste__linje__input: true, [className]: true });

    return (
      <div>
        <Nav.Input
          list="alleLand"
          label={label}
          bredde={bredde}
          feil={feilObjekt}
          className={cl}
          value={inputVerdi}
          onBlur={fokusUtHandler}
          onFocus={fokusInnHandler}
          onChange={inputEndringHandler}
          onKeyDown={inputTastNedHandler}
          disabled={disabled}
        />
      </div>
    );
  }
}

EnkeltLandPure.propTypes = {
  className: PT.string,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  value: PT.string.isRequired,
  onChange: PT.func.isRequired,
  bredde: PT.string,
  label: PT.string,
  feil: PT.string,
  disabled: PT.bool,
};

EnkeltLandPure.defaultProps = {
  className: '',
  label: '',
  feil: '',
  bredde: 'fullbredde',
  disabled: false,
};

export default EnkeltLandPure;
