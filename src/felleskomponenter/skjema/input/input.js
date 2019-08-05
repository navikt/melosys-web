import React from 'react';
import PT from 'prop-types';
import { Field } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';
import * as Utils from '../../../utils';

import { normaliserInputDato } from '../../../utils/dato';

import '../skjema.css';

/** Komponenten nedenfor tar imot errorMessage (og alle andre props). ErrorMessage gjøres om til
 * objekt som NAV-Input-komponenten forventer. Før den settes inn i Nav.Input.
 */
function InnerInputComponent({
  input, label, ...rest
}) {
  const { meta: { error, touched, active } } = rest;

  const feil = (error && touched && !active) ? { feilmelding: rest.meta.error } : undefined;
  /* Vi forventer at meta.error er en string eller et objekt */
  if (feil && Utils._isObject(feil.feilmelding)) feil.feilmelding = feil.feilmelding.melding;

  const inputProps = { ...input, ...rest };

  return !rest.hidden && <Nav.Input label={label} feil={feil} {...inputProps} />;
}

InnerInputComponent.propTypes = {
  label: PT.string.isRequired,
  bredde: PT.string,
  meta: PT.object,
  input: PT.object,
};

InnerInputComponent.defaultProps = {
  bredde: undefined,
  meta: undefined,
  input: undefined,
  feltFeil: {},
};


function Input({
  feltNavn, bredde, datoFelt, ...rest
}) {
  const normaliserDatoFunksjon = datoFelt ? normaliserInputDato : null;
  const placeholderTekst = datoFelt ? 'ddmmåå' : null;

  return (
    <Field
      bredde={bredde}
      name={feltNavn}
      normalize={normaliserDatoFunksjon}
      component={InnerInputComponent}
      placeholder={placeholderTekst}
      props={{ ...rest }}
    />
  );
}

Input.propTypes = {
  bredde: PT.string,
  feltNavn: PT.string.isRequired,
  datoFelt: PT.bool,
};

Input.defaultProps = {
  bredde: 'fullbredde',
  datoFelt: false,
};

export { InnerInputComponent };
export default Input;
