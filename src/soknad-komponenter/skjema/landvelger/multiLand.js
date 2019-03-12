import React, { useState } from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import { kodeTilObjekt, landTekstFormat } from './LandVelger';

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
      onClick={e => slettLandHandler(e, KV.objektTilKode(landObjekt))}
    >Fjern
    </Nav.Knapp>
  </div>
);

MultiLandEnkelt.propTypes = {
  landObjekt: PT.object.isRequired,
  slettLandHandler: PT.func.isRequired,
};

const MultiLand = props => {
  const [inputVerdi, setInputVerdi] = useState('');
  const [error, setError] = useState(null);

  const reduxLeggTilLand = landKode => {
    const { fields } = props;
    const valgteLand = fields.getAll() || [];

    // Todo: Legg til logging.
    if (!landKode) throw new Error('landKode må inneholde verdi.');

    if (!valgteLand.includes(landKode)) {
      fields.push(landKode);
    }
  };

  const reduxSlettEttLand = landKode => {
    const index = props.fields.getAll().findIndex(item => item === landKode);
    return (index > -1 && props.fields.remove(index));
  };

  const finnFlereLand = verdi => {
    const { landkoder } = props;
    return landkoder.filter(land => (
      landTekstFormat(land)
        .toLowerCase()
        .includes(verdi.toLowerCase())
    ));
  };

  const finnEttLand = verdi => {
    const landListe = finnFlereLand(verdi);
    return landListe.length === 1 ? landListe[0] : false;
  };

  const tomFeilmelding = () => {
    setError(null);
  };

  const dynamiskTittel = () => {
    const { fields } = props;
    const count = fields ? fields.length : 0;
    return (count > 0 ? 'Legg til evt flere land:' : 'Legg til første land:');
  };

  /** ----------------------------------------------------------------------
   *                           EVENT HANDLERS
   * -----------------------------------------------------------------------
   */

  const slettLandHandler = (e, landKode) => {
    e.preventDefault();
    reduxSlettEttLand(landKode);
  };
  const fokusUtHandler = () => {
    if (!inputVerdi) {
      tomFeilmelding();
      return;
    }

    const landKodeObjekt = finnEttLand(inputVerdi);
    if (landKodeObjekt) {
      reduxLeggTilLand(landKodeObjekt.kode);
      setInputVerdi('');
      setError(null);
    } else {
      setError('Finner ikke landet du har skrevet inn.');
    }
  };

  const inputTastNedHandler = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      fokusUtHandler();
    }
  };


  const inputEndringHandler = e => {
    const { value } = e.target;
    setInputVerdi(value);
  };
  const {
    disabled,
    fields,
    meta,
    landkoder,
    label,
    dataListID,
  } = props;

  const { error: skjemaError = '' } = meta;
  const { error: internLandError = '' } = error;
  const feilObjekt = skjemaError || internLandError ? { feilmelding: `${skjemaError} ${internLandError}` } : null;
  const valgteLand = fields.getAll() || [];
  const dynamiskFeltTittel = label || dynamiskTittel();


  const innhold = (
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
  return innhold;
};

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
