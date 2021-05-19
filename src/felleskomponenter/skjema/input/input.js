import React from "react";
import PT from "prop-types";
import { Field } from "redux-form";

import * as Nav from "../../../utils/navFrontend";
import * as Utils from "../../../utils";

import { normaliserInputDato } from "../../../utils/dato";

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

function Input({ feltNavn, bredde = "fullbredde", datoFelt = false, feltType = undefined, ...rest }) {
  const hentNormalizer = () => {
    // TODO: Fjern datoFelt og tilhørende felter etter melosys.input.DATOFELT blir skrudd på
    if (datoFelt) return normaliserInputDato;

    switch (feltType) {
      case "desimal":
        return normalizeDecimal;
      case "heltall":
        return normalizeInt;
      default:
        return undefined;
    }
  };

  const placeholderTekst = datoFelt ? "ddmmåå" : null;

  return (
    <Field
      bredde={bredde}
      name={feltNavn}
      normalize={hentNormalizer()}
      component={InnerInputComponent}
      placeholder={placeholderTekst}
      props={{ ...rest }}
    />
  );
}

Input.propTypes = {
  bredde: PT.string,
  feltNavn: PT.string.isRequired,
  /**
   * @deprecated Blir fjernet når melosys.input.DATOFELT fjernes. For normalisering, bruk feltType i stedet.
   */
  datoFelt: PT.bool,
  feltType: PT.oneOf(["desimal", "heltall"]),
};

Input.defaultProps = {
  bredde: "fullbredde",
  datoFelt: false,
  feltType: undefined,
};

export { InnerInputComponent };
export default Input;
