import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';

import { kodeTilObjekt, landTekstFormat } from './';

import './landvelger.css';

const MultiLandEnkelt = ({ landObjekt, slettLandHandler }) => (
  <div className="landliste__linje">
    <div className="landliste__linje__navn">
      {landTekstFormat(landObjekt)}
    </div>
    <Nav.Knapp mini className="landliste__linje__knapp" onClick={e => slettLandHandler(e, landObjekt.kode)}>Fjern</Nav.Knapp>
  </div>
);

MultiLandEnkelt.propTypes = {
  landObjekt: PT.object.isRequired,
  slettLandHandler: PT.func.isRequired,
};

const MultiLand = props => {
  const {
    alleLand,
    feil,
    fokusUtHandler,
    inputVerdi,
    inputEndringHandler,
    inputTastNedHandler,
    label,
    valgteLand,
    slettLandHandler,
  } = props;

  return (
    <div className="landliste">
      {
        valgteLand.map(land => <MultiLandEnkelt key={land} slettLandHandler={slettLandHandler} landObjekt={kodeTilObjekt(land, alleLand)} />)
      }
      <div className="landliste__linje">
        <Nav.Input
          list="alleLand"
          label={label}
          bredde="XL"
          feil={feil}
          className="landliste__linje__input"
          value={inputVerdi}
          onBlur={fokusUtHandler}
          onChange={inputEndringHandler}
          onKeyDown={inputTastNedHandler}
        />
        <Nav.Knapp mini className="landliste__linje__knapp--leggtil">Legg til</Nav.Knapp>
      </div>
    </div>
  );
};

MultiLand.propTypes = {
  fokusUtHandler: PT.func.isRequired,
  inputEndringHandler: PT.func.isRequired,
  inputTastNedHandler: PT.func.isRequired,
  slettLandHandler: PT.func.isRequired,
  alleLand: PT.array.isRequired,
  inputVerdi: PT.string.isRequired,
  valgteLand: PT.array,
  label: PT.string,
  feil: PT.object,
};

MultiLand.defaultProps = {
  label: '',
  feil: {},
  valgteLand: [],
  inputVerdi: '',
};

export default MultiLand;
