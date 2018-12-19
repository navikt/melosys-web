import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';

import { kodeverkObjektTilTerm } from '../../../utils/kodeverk';

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
  disabled,
  ...rest
}) => {
  const feil = (meta.invalid && meta.touched) ? { feilmelding: meta.error } : null;
  const inputProps = {
    ...input,
    ...rest,
  };

  return (
    <div>
      <Nav.Input
        label={label}
        feil={feil}
        placeholder={placeholder}
        className="listevelger__linje__input"
        list={`dataliste-${inputProps.name}`}
        value={inputProps.value}
        onChange={inputProps.onChange}
        onBlur={inputProps.onBlur}
        bredde={inputProps.bredde}
        disabled={disabled}
      />
      <datalist id={`dataliste-${inputProps.name}`}>
        {muligeValg.map(valg => <option key={uuid()} value={kodeverkObjektTilTerm(valg)} />)}
      </datalist>
    </div>
  );
};

ListevelgerEnkelt.propTypes = {
  label: PT.string.isRequired,
  disabled: PT.string.isRequired,
  children: PT.node,
  input: PT.object,
  errorMessage: PT.object,
  muligeValg: PT.array,
  placeholder: PT.string,
  tillatFritekst: PT.bool.isRequired,
  meta: PT.object,
};

ListevelgerEnkelt.defaultProps = {
  children: <option disabled value="0">ingen valg tilgjengelig</option>,
  input: undefined,
  errorMessage: undefined,
  muligeValg: [],
  placeholder: '',
  meta: undefined,
};

export default ListevelgerEnkelt;
