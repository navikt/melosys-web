import React from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';

import * as Skjema from '../skjema';
import Landvelger from '../skjema/landvelger';
import * as Nav from '../../utils/navFrontend';

const UtenlandskIDLinje = ({ indeks }) => (
  <div className="utenlandskID__linje">
    <Skjema.Input bredde="S" feltNavn={`utenlandskID[${indeks}].ID`} label="Utenlandsk ID" />
    <Landvelger feltNavn={`utenlandskID[${indeks}].landKode`} label="Land" />
  </div>
);

UtenlandskIDLinje.propTypes = {
  indeks: PT.number.isRequired,
};

const UtenlandskIDWrapper = props => {
  const linjer = props.fields.getAll() || [];

  /* eslint react/no-array-index-key:off */
  return (
    <div className="utenlandskID__wrapper">
      { linjer.map((linje, indeks) => <UtenlandskIDLinje key={indeks} indeks={indeks} />) }
      <Nav.Knapp className="utenlandskID__leggtil" onClick={() => props.fields.push({ ID: '', landKode: '' })}>Legg til flere ID</Nav.Knapp>
    </div>
  );
};

UtenlandskIDWrapper.propTypes = {
  fields: PT.object.isRequired,
};

const UtenlandskID = props => (
  <div className="utenlandskID">
    <FieldArray name="utenlandskID" component={UtenlandskIDWrapper} props={props} />
  </div>
);

export default UtenlandskID;
