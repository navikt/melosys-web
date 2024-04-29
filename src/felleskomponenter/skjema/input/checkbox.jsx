import PT from "prop-types";
import { submit, Field } from "redux-form";
import { Checkbox as NavCheckbox } from "@navikt/ds-react";
import "../skjema.css";
import * as Utils from "../../../utils";

function InnerCheckboxComponent({ input, meta, label, submitOnChange, onClick, disabled, className }) {
  const feil = meta.error && meta.touched && !meta.active ? meta.error : undefined;

  const onChange = (...args) => {
    if (submitOnChange) {
      setTimeout(() => meta.dispatch(submit(meta.form)), 0);
    }
    return input.onChange && input.onChange.apply(this, args);
  };

  return (
    <NavCheckbox
      feil={feil}
      checked={input.value}
      onClick={onClick}
      {...input}
      onChange={onChange}
      disabled={disabled}
      className={className}
      id={Utils._uuid()}
    >
      {label}
    </NavCheckbox>
  );
}

InnerCheckboxComponent.propTypes = {
  label: PT.node.isRequired,
  errorMessage: PT.arrayOf(PT.string),
  submitOnChange: PT.bool,
  input: PT.object, // eslint-disable-line react/forbid-prop-types
  meta: PT.object, // eslint-disable-line react/forbid-prop-types
  onClick: PT.func,
  disabled: PT.bool,
  className: PT.string,
};

InnerCheckboxComponent.defaultProps = {
  errorMessage: undefined,
  submitOnChange: false,
  onClick: () => {},
  // Vil alltid bli overskrevet av CustomField
  input: {},
  meta: {},
  disabled: false,
  className: undefined,
};

function Checkbox({ feltNavn, className = "", ...rest }) {
  return (
    <Field
      name={feltNavn}
      className={className}
      errorClass="skjemaelement--harFeil"
      component={InnerCheckboxComponent}
      props={rest}
    />
  );
}

Checkbox.propTypes = {
  feltNavn: PT.string.isRequired,
  className: PT.string,
};

Checkbox.defaultProps = {
  className: undefined,
};

export default Checkbox;
