import React from 'react';
import PT from 'prop-types';
import { Field } from 'redux-form';
import * as Nav from '../../../utils/navFrontend';
import '../skjema.css';

function SelectWrappedComponent({
  input,
  label,
  children,
  meta,
  ...rest
}) {
  const feil = meta.error ? { feilmelding: meta.error } : undefined;
  const inputProps = {
    ...input,
    ...rest,
  };
  return (
    <Nav.Select label={label} feil={feil} {...inputProps}>
      <option />
      {children}
    </Nav.Select>
  );
}

SelectWrappedComponent.defaultProps = {
  children: <option disabled value="0">ingen valg tilgjengelig</option>,
  input: undefined,
  meta: undefined,
};

SelectWrappedComponent.propTypes = {
  label: PT.string.isRequired,
  children: PT.node,
  input: PT.object, // eslint-disable-line react/forbid-prop-types
  meta: PT.object, // eslint-disable-line react/forbid-prop-types
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
