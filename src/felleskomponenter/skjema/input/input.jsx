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

function Input({ feltNavn, bredde = "fullbredde", className = "", normalize = (value) => value, ...rest }) {
  return (
    <Field
      bredde={bredde}
      name={feltNavn}
      normalize={normalize}
      component={InnerInputComponent}
      className={className}
      props={{ ...rest }}
    />
  );
}

Input.propTypes = {
  bredde: PT.string,
  feltNavn: PT.string.isRequired,
  className: PT.string,
  normalize: PT.func,
};

Input.defaultProps = {
  bredde: "fullbredde",
  className: "",
  normalize: (value) => value,
};

export { InnerInputComponent };
export default Input;
