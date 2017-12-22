import React from 'react';
import PT from 'prop-types';
import { CustomField } from 'react-redux-form-validation';

import * as Nav from '../../../utils/navFrontend';
import { normaliserInputDato } from '../../../utils/dato';
import '../skjema.css';

/** Komponenten nedenfor tar imot errorMessage (og alle andre props). ErrorMessage gjøres om til
 * objekt som NAV-Input-komponenten forventer. Før den settes inn i Nav.Input.
 */
function InnerInputComponent({
  input, label, errorMessage, ...rest
}) {
  const feil = errorMessage ? { feilmelding: errorMessage[0] } : undefined;
  const inputProps = { ...input, ...rest };
  return <Nav.Input label={label} feil={feil} {...inputProps} />;
}

InnerInputComponent.propTypes = {
  label: PT.string.isRequired,
  bredde: PT.string,
  errorMessage: PT.arrayOf(PT.node),
  meta: PT.object, // eslint-disable-line react/forbid-prop-types
  input: PT.object, // eslint-disable-line react/forbid-prop-types
};

InnerInputComponent.defaultProps = {
  bredde: undefined,
  errorMessage: undefined,
  meta: undefined,
  input: undefined,
};

function Input({
  feltNavn, bredde, datoFelt, ...rest
}) {
  const normaliserDatoFunksjon = datoFelt ? normaliserInputDato : null;
  return (
    <CustomField
      bredde={bredde}
      name={feltNavn}
      errorClass="skjemaelement--harFeil"
      normalize={normaliserDatoFunksjon}
      customComponent={<InnerInputComponent {...rest} />}
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
