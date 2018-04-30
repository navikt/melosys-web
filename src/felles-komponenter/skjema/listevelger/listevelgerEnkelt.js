import React from 'react';
import PT from 'prop-types';
import { Input as NavInput } from 'nav-frontend-skjema';

import './listevelger.css';

const uuid = require('uuid/v4');

/** Enkeltlisten representerer ETT listevalg. Dersom den er en del av en array, dvs at
 * bruker kan gjøre inn flere valg, så er ListevelgerEnkeltListe komponenten inne i FieldArray.
 */
const ListevelgerEnkelt = ({
  input,
  label,
  errorMessage,
  muligeValg,
  placeholder,
  meta, // eslint-disable-line no-unused-vars
  ...rest
}) => {
  const feil = errorMessage ? { feilmelding: errorMessage[0] } : undefined;
  const inputProps = {
    ...input,
    ...rest,
  };

  return (
    <div>
      <NavInput label={label} feil={feil} placeholder={placeholder} {...input} list={`dataliste-${inputProps.name}`} />
      <datalist id={`dataliste-${inputProps.name}`}>
        {muligeValg.map(valg => <option key={uuid()} value={valg.term} />)}
      </datalist>
    </div>
  );
};

ListevelgerEnkelt.defaultProps = {
  children: <option disabled value="0">ingen valg tilgjengelig</option>,
  input: undefined,
  errorMessage: undefined,
  muligeValg: [],
  placeholder: '',
  meta: undefined,
};

ListevelgerEnkelt.propTypes = {
  label: PT.string.isRequired,
  children: PT.node,
  input: PT.object,
  errorMessage: PT.object,
  muligeValg: PT.array,
  placeholder: PT.string,
  meta: PT.object,
};

export default ListevelgerEnkelt;
