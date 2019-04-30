import React from 'react';
import PT from 'prop-types';
import { Field } from 'redux-form';
import { connect } from 'react-redux';

import * as Nav from '../../../utils/navFrontend';

import { normaliserInputDato } from '../../../utils/dato';

import { formSelectors } from '../../../ducks/form';

import '../skjema.css';

/** Komponenten nedenfor tar imot errorMessage (og alle andre props). ErrorMessage gjøres om til
 * objekt som NAV-Input-komponenten forventer. Før den settes inn i Nav.Input.
 */
function InnerInputComponent({
  input, label, feltNavn, hentFeltFeil, ...rest
}) {
  const feltFeil = hentFeltFeil(feltNavn);
  const feltFeilmelding = feltFeil ? feltFeil.melding : null;
  const feil = feltFeilmelding ? { feilmelding: feltFeilmelding } : undefined;
  const inputProps = { ...input, ...rest };
  return !rest.hidden && <Nav.Input label={label} feil={feil} {...inputProps} />;
}

InnerInputComponent.propTypes = {
  label: PT.string.isRequired,
  bredde: PT.string,
  meta: PT.object,
  input: PT.object,
  feltNavn: PT.string.isRequired,
  hentFeltFeil: PT.func.isRequired,
};

InnerInputComponent.defaultProps = {
  bredde: undefined,
  meta: undefined,
  input: undefined,
};

const mapStateToProps = state => ({
  hentFeltFeil: feltNavn => formSelectors.SoknadErrorsSelector(state)[feltNavn],
});

const ConnectedInnerInputComponent = connect(mapStateToProps, () => ({}))(InnerInputComponent);

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
      component={ConnectedInnerInputComponent}
      placeholder={placeholderTekst}
      props={{ ...rest, feltNavn }}
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
