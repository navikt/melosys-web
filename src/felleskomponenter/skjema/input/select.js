import React from 'react';
import PT from 'prop-types';
import { Field } from 'redux-form';
import * as Nav from '../../../utils/navFrontend';
import * as SkjemaUtils from '../utils';

import '../skjema.css';

function SelectWrappedComponent({
  input,
  label,
  children,
  meta,
  emptyFieldDisabled,
  emptyFieldText,
  ...rest
}) {
  const { touched, active } = meta;
  const feil = (touched && !active) ? SkjemaUtils.mapReduxFormFeilTilNavFeil(meta) : undefined;

  const inputProps = {
    ...input,
    ...rest,
  };
  return (
    <Nav.Select label={label} feil={feil} {...inputProps}>
      <option disabled={emptyFieldDisabled} value="">{emptyFieldText}</option>
      {children}
    </Nav.Select>
  );
}

SelectWrappedComponent.defaultProps = {
  children: <option disabled value="0">ingen valg tilgjengelig</option>,
  input: undefined,
  meta: undefined,
  emptyFieldDisabled: true,
  emptyFieldText: '',
};

SelectWrappedComponent.propTypes = {
  label: PT.string.isRequired,
  children: PT.node,
  input: PT.object, // eslint-disable-line react/forbid-prop-types
  meta: PT.object, // eslint-disable-line react/forbid-prop-types
  emptyFieldDisabled: PT.bool,
  emptyFieldText: PT.string,
};

function Select({
  id, feltNavn, className, ...rest
}) {
  return (
    <Field
      name={feltNavn}
      className={className}
      id={id}
      component={SelectWrappedComponent}
      props={rest}
    />
  );
}

Select.defaultProps = {
  className: '',
  id: undefined,
};

Select.propTypes = {
  feltNavn: PT.string.isRequired,
  id: PT.string,
  className: PT.string,
};

export { SelectWrappedComponent };
export default Select;
