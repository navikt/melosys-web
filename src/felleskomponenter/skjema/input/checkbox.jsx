import PT from "prop-types";
import { submit, Field } from "redux-form";
import "../skjema.css";
import * as Utils from "../../../utils";
import * as Nav from "../../../navFrontend";

function InnerCheckboxComponent({
  input = {},
  meta = {},
  label,
  submitOnChange = false,
  onClick = () => {},
  disabled = false,
  className,
}) {
  const feil = meta.error && meta.touched && !meta.active ? meta.error : undefined;

  const onChange = (...args) => {
    if (submitOnChange) {
      setTimeout(() => meta.dispatch(submit(meta.form)), 0);
    }
    return input.onChange && input.onChange.apply(this, args);
  };

  return (
    <Nav.Checkbox
      feil={feil}
      checked={input.value}
      onClick={onClick}
      {...input}
      onChange={onChange}
      readOnly={disabled}
      className={className}
      id={Utils._uuid()}
      size="small"
    >
      {label}
    </Nav.Checkbox>
  );
}

InnerCheckboxComponent.propTypes = {
  label: PT.node.isRequired,
  submitOnChange: PT.bool,
  input: PT.object, // eslint-disable-line react/forbid-prop-types
  meta: PT.object, // eslint-disable-line react/forbid-prop-types
  onClick: PT.func,
  disabled: PT.bool,
  className: PT.string,
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

export default Checkbox;
