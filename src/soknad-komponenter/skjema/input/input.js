import React from 'react';
import PT from 'prop-types';
import { Field } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';
import { normaliserInputDato } from '../../../utils/dato';
import '../skjema.css';

/** Komponenten nedenfor tar imot errorMessage (og alle andre props). ErrorMessage gjøres om til
 * objekt som NAV-Input-komponenten forventer. Før den settes inn i Nav.Input.
 */
function InnerInputComponent({
  input, label, ...rest
}) {
  const feil = (rest.meta.error && rest.meta.touched && !rest.meta.active) ? { feilmelding: rest.meta.error } : undefined;
  const inputProps = { ...input, ...rest };
  return !rest.hidden && <Nav.Input label={label} feil={feil} {...inputProps} />;
}

InnerInputComponent.propTypes = {
  label: PT.string.isRequired,
  bredde: PT.string,
  meta: PT.object, // eslint-disable-line react/forbid-prop-types
  input: PT.object, // eslint-disable-line react/forbid-prop-types
};

InnerInputComponent.defaultProps = {
  bredde: undefined,
  meta: undefined,
  input: undefined,
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
      props={rest}
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

export default Input;
