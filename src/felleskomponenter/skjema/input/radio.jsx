import PT from "prop-types";
import { touch, Field } from "redux-form";

import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";

import "../skjema.css";

function InnerInputComponent({
  input,
  forhandsvalgt,
  meta, // eslint-disable-line no-unused-vars
  onChange,
  ...rest
}) {
  const innerChange = (e) => {
    if (onChange) onChange(e);
    input.onChange(e);
  };
  const inputProps = {
    ...input,
    ...rest,
    onChange: innerChange,
  };
  const gjeldendeFeltVerdi = input.value;
  const radioButtonVerdi = rest.value;

  const feil = meta.error && meta.touched && !meta.active ? meta.error : undefined;

  return (
    <Nav.Radio
      {...inputProps}
      checked={gjeldendeFeltVerdi === radioButtonVerdi || forhandsvalgt}
      // Fikser fokus/markering feil i IE
      onBlur={() => {
        // slik at dette feltet valideres
        meta.dispatch(touch(meta.form, input.name));
      }}
      feil={feil}
      onFocus={() => {}}
    />
  );
}

InnerInputComponent.defaultProps = {
  input: undefined,
  meta: undefined,
  forhandsvalgt: false,
  onChange: undefined,
};

InnerInputComponent.propTypes = {
  input: PT.object, // eslint-disable-line react/forbid-prop-types
  meta: PT.object, // eslint-disable-line react/forbid-prop-types
  forhandsvalgt: PT.bool,
  onChange: PT.func,
};

/** Redux støtter i utgangspunktet ikke boolske valg i
 * radioknapper. Det betyr at alle true/false settes som string
 * 'true'/'false'. Normaliser disse scenarioene, men returner alle andre
 * radioknapp-valg som urørt.
 */
const normaliserReduxBoolean = (valg) => {
  if (valg === "true") {
    return true;
  }
  if (valg === "false") {
    return false;
  }
  return valg;
};

function Radio({ id = "", feltNavn, className = "", ...rest }) {
  return (
    <Field
      name={feltNavn}
      className={className}
      id={id || Utils._uuid()}
      component={InnerInputComponent}
      props={rest}
      normalize={normaliserReduxBoolean}
    />
  );
}

Radio.defaultProps = {
  className: "",
  id: "",
};

Radio.propTypes = {
  feltNavn: PT.string.isRequired,
  id: PT.string,
  className: PT.string,
};

export { InnerInputComponent };
export default Radio;
