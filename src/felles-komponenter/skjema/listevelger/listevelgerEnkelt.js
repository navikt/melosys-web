import React from 'react';
import PT from 'prop-types';
import { Input as NavInput } from 'nav-frontend-skjema';

import './listevelger.css';

const uuid = require('uuid/v4');

/** Enkeltlisten representerer ETT listevalg hvor brukeren kan velge fra listen eller skrive
 * inn sin egen verdi.
 */
const ListevelgerEnkelt = ({
  input,
  label,
  meta,
  muligeValg,
  placeholder,
  ...rest
}) => {
  const feil = meta.invalid ? { feilmelding: meta.error } : null;
  const inputProps = {
    ...input,
    ...rest,
  };

  return (
    <div>
      <NavInput
        label={label}
        feil={feil}
        placeholder={placeholder}
        className="listevelger__linje__input"
        list={`dataliste-${inputProps.name}`}
        {...input}
      />
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
