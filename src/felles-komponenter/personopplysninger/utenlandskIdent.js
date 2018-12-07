import React from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';

import * as Skjema from '../skjema';
import Landvelger from '../skjema/landvelger';
import * as Nav from '../../utils/navFrontend';

const UtenlandskIdentLinje = ({ indeks, remove }) => (
  <div className="utenlandskIdent__linje">
    <Skjema.Input bredde="S" feltNavn={`utenlandskIdent[${indeks}].ident`} label="Utenlandsk ID" />
    <Landvelger feltNavn={`utenlandskIdent[${indeks}].landKode`} label="Land" />
    <Nav.Knapp mini onClick={() => remove(indeks)}>Slett</Nav.Knapp>
  </div>
);

UtenlandskIdentLinje.propTypes = {
  indeks: PT.number.isRequired,
  remove: PT.func.isRequired,
};

const UtenlandskIdentWrapper = props => {
  const { fields } = props;
  const { push, remove } = fields;
  const linjer = props.fields.getAll() || [];

  /* eslint react/no-array-index-key:off */
  return (
    <div className="utenlandskIdent__wrapper">
      { linjer.map((linje, indeks) => <UtenlandskIdentLinje key={indeks} indeks={indeks} remove={remove} />) }
      <Nav.Knapp mini className="utenlandskIdent__leggtil" onClick={() => push({ ident: '', landKode: '' })}>Legg til flere ID</Nav.Knapp>
    </div>
  );
};

UtenlandskIdentWrapper.propTypes = {
  fields: PT.object.isRequired,
};

const utenlandskIdent = props => (
  <div className="utenlandskIdent">
    <FieldArray name="utenlandskIdent" component={UtenlandskIdentWrapper} props={props} />
  </div>
);

export default utenlandskIdent;
