import React from 'react';
import PT from 'prop-types';
import { touch, Field } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';

import '../skjema.css';

function InnerInputComponent({
  input,
  forhandsvalgt,
  meta, // eslint-disable-line no-unused-vars
  ...rest
}) {
  const inputProps = {
    ...input,
    ...rest,
  };
  const gjeldendeFeltVerdi = input.value;
  const radioButtonVerdi = rest.value;

  const feil = (meta.error && meta.touched && !meta.active) ? { feilmelding: meta.error } : undefined;

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
};

InnerInputComponent.propTypes = {
  input: PT.object, // eslint-disable-line react/forbid-prop-types
  meta: PT.object, // eslint-disable-line react/forbid-prop-types
  forhandsvalgt: PT.bool,
};

/** Redux støtter i utgangspunktet ikke boolske valg i
 * radioknapper. Det betyr at alle true/false settes som string
 * 'true'/'false'. Normaliser disse scenarioene, men returner alle andre
 * radioknapp-valg som urørt.
 */
const normaliserReduxBoolean = valg => {
  if (valg === 'true') { return true; }
  if (valg === 'false') { return false; }
  return valg;
};

function Radio({
  id, feltNavn, className, ...rest
}) {
  return (
    <Field
      name={feltNavn}
      className={className}
      id={id}
      component={InnerInputComponent}
      props={rest}
      normalize={normaliserReduxBoolean}
    />
  );
}

Radio.defaultProps = {
  className: '',
  id: undefined,
};

Radio.propTypes = {
  feltNavn: PT.string.isRequired,
  id: PT.string,
  className: PT.string,
};

export { InnerInputComponent };
export default Radio;
