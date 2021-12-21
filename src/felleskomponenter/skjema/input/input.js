import React from "react";
import PT from "prop-types";
import { Field } from "redux-form";

import * as Nav from "../../../navFrontend";
import * as SkjemaUtils from "../utils";

import "../skjema.css";

/** Komponenten nedenfor tar imot errorMessage (og alle andre props). ErrorMessage gjøres om til
 * objekt som NAV-Input-komponenten forventer. Før den settes inn i Nav.Input.
 */
function InnerInputComponent({ input, label, onBlur, onChange, ...rest }) {
  const {
    meta,
    meta: { touched, active },
  } = rest;

  const feil = touched && !active ? SkjemaUtils.mapReduxFormFeilTilNavFeil(meta) : undefined;

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

  return !rest.hidden && <Nav.Input label={label} feil={feil || undefined} {...inputProps} />;
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

function Input({ feltNavn, bredde = "fullbredde", feltType = "", className = "", ...rest }) {
  const hentNormalizer = () => {
    switch (feltType) {
      case "desimal":
        return normalizeDecimal;
      case "heltall":
        return normalizeInt;
      default:
        return undefined;
    }
  };

  return (
    <Field
      bredde={bredde}
      name={feltNavn}
      normalize={hentNormalizer()}
      component={InnerInputComponent}
      className={className}
      props={{ ...rest }}
    />
  );
}

Input.propTypes = {
  bredde: PT.string,
  feltNavn: PT.string.isRequired,
  feltType: PT.oneOf(["desimal", "heltall", ""]),
  className: PT.string,
};

Input.defaultProps = {
  bredde: "fullbredde",
  feltType: "",
  className: "",
};

export { InnerInputComponent };
export default Input;
