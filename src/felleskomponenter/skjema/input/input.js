import React from "react";
import PT from "prop-types";
import { Field } from "redux-form";

import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";

import "../skjema.css";

/** Komponenten nedenfor tar imot errorMessage (og alle andre props). ErrorMessage gjøres om til
 * objekt som NAV-Input-komponenten forventer. Før den settes inn i Nav.Input.
 */
function InnerInputComponent({ input, label, onBlur, onChange, ...rest }) {
  const {
    meta: { error, touched, active },
  } = rest;

  const feil = error && touched && !active ? { feilmelding: rest.meta.error } : undefined;
  /* Vi forventer at meta.error er en string eller et objekt */
  if (feil && Utils._isObject(feil.feilmelding)) feil.feilmelding = feil.feilmelding.melding;

  const innerBlur = (e) => {
    if (onBlur) onBlur(e);
    input.onBlur(e);
  };

  const innerChange = (e) => {
    if (onChange) onChange(e);
    input.onChange(e);
  };

  const inputProps = {
    ...input,
    ...rest,
    onBlur: innerBlur,
    onChange: innerChange,
  };

  return !rest.hidden && <Nav.Input label={label} feil={feil} {...inputProps} />;
}

InnerInputComponent.propTypes = {
  label: PT.node.isRequired,
  bredde: PT.string,
  meta: PT.object,
  input: PT.object,
  onBlur: PT.func,
  onChange: PT.func,
};

InnerInputComponent.defaultProps = {
  bredde: undefined,
  meta: undefined,
  input: undefined,
  onBlur: undefined,
  onChange: undefined,
};

export const normalizeInt = (value, previousValue) => {
  if (value === "") return null;

  const isInt = value.match(/^\d+$/g) !== null;
  return isInt ? value : previousValue;
};
export const normalizeDecimal = (value, previousValue) => {
  if (value === "") return null;

  const valuePreferDot = value.replace(",", ".");
  const isIntOrDecimal = valuePreferDot.match(/^\d+([.]\d*)?$/g) !== null;

  return isIntOrDecimal ? valuePreferDot : previousValue;
};

export const begrensAntallTegn = (antallTegn) => (value) => {
  return antallTegn && value.length > antallTegn ? value.substr(0, antallTegn) : value;
};

function Input({ feltNavn, bredde = "fullbredde", normalize = undefined, ...rest }) {
  return (
    <Field bredde={bredde} name={feltNavn} normalize={normalize} component={InnerInputComponent} props={{ ...rest }} />
  );
}

Input.propTypes = {
  bredde: PT.string,
  feltNavn: PT.string.isRequired,
  feltType: PT.oneOf(["desimal", "heltall"]),
  normalize: PT.func,
};

Input.defaultProps = {
  bredde: "fullbredde",
  feltType: undefined,
  normalize: undefined,
};

export { InnerInputComponent };
export default Input;
