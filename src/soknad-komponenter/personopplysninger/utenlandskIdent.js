import React from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';

import * as Skjema from '../skjema';
import Landvelger from '../skjema/landvelger';
import * as Nav from '../../utils/navFrontend';

const UtenlandskIdentLinje = ({ indeks, remove, disabled }) => (
  <div className="utenlandskIdent__linje">
    <Skjema.Input disabled={disabled} bredde="S" feltNavn={`utenlandskIdent[${indeks}].ident`} label="Utenlandsk ID" />
    <Landvelger disabled={disabled} feltNavn={`utenlandskIdent[${indeks}].landkode`} label="Land" />
    <Nav.Knapp disabled={disabled} mini onClick={() => remove(indeks)}>Slett</Nav.Knapp>
  </div>
);

UtenlandskIdentLinje.propTypes = {
  indeks: PT.number.isRequired,
  remove: PT.func.isRequired,
  disabled: PT.bool.isRequired,
};

const UtenlandskIdentWrapper = props => {
  const { disabled, fields } = props;
  const { push, remove } = fields;
  const linjer = props.fields.getAll() || [];
  /* eslint react/no-array-index-key:off */
  return (
    <div className="utenlandskIdent__wrapper">
      { linjer.map((linje, indeks) => <UtenlandskIdentLinje key={indeks} indeks={indeks} remove={remove} disabled={disabled} />) }
      <Nav.Knapp disabled={disabled} mini className="utenlandskIdent__leggtil" onClick={() => push({ ident: '', landkode: '' })}>LEGG TIL FLERE ID-ER</Nav.Knapp>
    </div>
  );
};

UtenlandskIdentWrapper.propTypes = {
  disabled: PT.bool.isRequired,
  fields: PT.object.isRequired,
};

const utenlandskIdent = props => (
  <div className="utenlandskIdent">
    <FieldArray name="utenlandskIdent" component={UtenlandskIdentWrapper} props={props} />
  </div>
);

export default utenlandskIdent;
