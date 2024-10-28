import PT from "prop-types";
import { Field } from "redux-form";
import * as Nav from "../../../navFrontend";
import * as SkjemaUtils from "../utils";

function InnerTextAreaComponent({ label, placeholder, maxLength, input, meta, onChange, ...rest }) {
  const { touched, active } = meta;
  const feil = touched && !active ? SkjemaUtils.mapReduxFormFeilTilNavFeil(meta) : undefined;

  const innerOnChange = (e) => {
    if (onChange) onChange(e);
    input.onChange(e);
  };

  const inputProps = { ...input, ...rest, feil, onChange: innerOnChange };

  return (
    <Nav.Textarea
      textareaClass="skjemaelement__input input--fullbredde"
      label={label}
      maxLength={maxLength || 500}
      placeholder={placeholder}
      {...inputProps}
    />
  );
}

InnerTextAreaComponent.propTypes = {
  label: PT.node,
  placeholder: PT.string,
  maxLength: PT.number,
  meta: PT.object, // eslint-disable-line react/forbid-prop-types
  input: PT.object, // eslint-disable-line react/forbid-prop-types
  onChange: PT.func,
};

InnerTextAreaComponent.defaultProps = {
  meta: undefined,
  input: undefined,
  maxLength: undefined,
  label: undefined,
  placeholder: undefined,
  onChange: undefined,
};

function Textarea({ feltNavn, ...rest }) {
  return <Field name={feltNavn} component={InnerTextAreaComponent} props={rest} />;
}

Textarea.propTypes = {
  feltNavn: PT.string,
};

Textarea.defaultProps = {
  feltNavn: undefined,
};

export default Textarea;
