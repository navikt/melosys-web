import React, { useState } from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';

import * as Utils from '../../../utils';
import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import * as SkjemaUtils from '../utils';

import { landTekstFormat } from './utils';

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

function MultiLand(props) {
  const [inputVerdi, setInputVerdi] = useState('');
  const [internError, setInternError] = useState('');

  const reduxLeggTilLand = landkode => {
    const valgteLand = props.fields.getAll() || [];

    if (!landkode) {
      const e = new Error('landkode må inneholde verdi.');
      Utils.logger.error(e);
      throw e;
    }

    if (!valgteLand.includes(landkode)) {
      props.fields.push(landkode);
    }
  };

  const reduxSlettEttLand = landkode => {
    const index = props.fields.getAll().findIndex(item => item === landkode);
    return (index > -1 && props.fields.remove(index));
  };

  const finnFlereLand = verdi => (
    props.landkoder.filter(land => (
      landTekstFormat(land)
        .toLowerCase()
        .includes(verdi.toLowerCase())
    ))
  );

  const finnEttLand = verdi => {
    const landListe = finnFlereLand(verdi);
    return landListe.length === 1 ? landListe[0] : false;
  };

  const tomFeilmelding = () => {
    setInternError('');
  };

  const dynamiskTittel = () => {
    const count = props.fields ? props.fields.length : 0;
    return (count > 0 ? 'Legg til evt flere land:' : 'Legg til første land:');
  };

  /** ----------------------------------------------------------------------
   *                           EVENT HANDLERS
   * -----------------------------------------------------------------------
   */

  const slettLandHandler = (e, landkode) => {
    e.preventDefault();
    reduxSlettEttLand(landkode);
  };

  const fokusUtHandler = () => {
    if (!inputVerdi) {
      tomFeilmelding();
      return;
    }

    const landkodeObjekt = finnEttLand(inputVerdi);
    if (landkodeObjekt) {
      reduxLeggTilLand(landkodeObjekt.kode);
      tomFeilmelding();
      setInputVerdi('');
    } else {
      setInternError('Finner ikke landet du har skrevet inn.');
    }
  };

  const inputTastNedHandler = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      fokusUtHandler();
    }
  };

  const inputEndringHandler = e => {
    setInputVerdi(e.target.value);
  };

  const { meta, errorConfig } = props;
  const skjemaError = SkjemaUtils.mapReduxFormFeilTilNavFeil(meta, errorConfig);

  const feilObjekt = skjemaError || internError ? { feilmelding: `${(skjemaError && skjemaError.feilmelding) || ''} ${internError}` } : null;
  const valgteLand = props.fields.getAll() || [];
  const dynamiskFeltTittel = props.label || dynamiskTittel();

  const { dataListID, disabled, bredde } = props;
  return (
    <div className="landliste">
      {
        props.landkoder.length > 0 && valgteLand.map(land => <MultiLandEnkelt key={land} slettLandHandler={slettLandHandler} landObjekt={KV.kodeTilObjekt(land, props.landkoder)} />)
      }
      <div className="landliste__leggtil">
        <Nav.Input
          list={dataListID}
          disabled={disabled}
          label={dynamiskFeltTittel}
          bredde={bredde}
          feil={feilObjekt}
          className="landliste__linje__input"
          value={inputVerdi}
          onBlur={fokusUtHandler}
          onChange={inputEndringHandler}
          onKeyDown={inputTastNedHandler}
        />
        <Nav.Knapp htmlType="button" mini className="landliste__linje__knapp">Legg til</Nav.Knapp>
      </div>
    </div>
  );
}

MultiLand.propTypes = {
  dataListID: PT.string.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  label: PT.string,
  feil: PT.object,
  fields: PT.object.isRequired,
  meta: PT.object.isRequired,
  disabled: PT.bool,
  bredde: PT.string,
  errorConfig: PT.object,
};

MultiLand.defaultProps = {
  label: '',
  feil: {},
  disabled: false,
  bredde: 'XL',
  errorConfig: {},
};

export { MultiLand };

const MultiLandWrapper = props => (<FieldArray name={props.feltNavn} component={MultiLand} props={props} />);

MultiLandWrapper.propTypes = {
  feltNavn: PT.string.isRequired,
};

export default MultiLandWrapper;
