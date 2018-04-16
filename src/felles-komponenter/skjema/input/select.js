import React from 'react';
import PT from 'prop-types';
import { Select as NavSelect } from 'nav-frontend-skjema';
import { CustomField } from 'react-redux-form-validation';
import '../skjema.css';

function InnerInputComponent({
  input,
  label,
  children,
  errorMessage,
  meta, // eslint-disable-line no-unused-vars
  ...rest
}) {
  const feil = errorMessage ? { feilmelding: errorMessage[0] } : undefined;
  const inputProps = {
    ...input,
    ...rest,
  };
  return (
    <NavSelect label={label} feil={feil} {...inputProps}>
      <option />
      {children}
    </NavSelect>
  );
}

InnerInputComponent.defaultProps = {
  children: <option disabled value="0">ingen valg tilgjengelig</option>,
  input: undefined,
  errorMessage: undefined,
  meta: undefined,
};

InnerInputComponent.propTypes = {
  label: PT.string.isRequired,
  children: PT.node,
  input: PT.object, // eslint-disable-line react/forbid-prop-types
  errorMessage: PT.object, // eslint-disable-line react/forbid-prop-types
  meta: PT.object, // eslint-disable-line react/forbid-prop-types
};

function Select({
  id, feltNavn, className, ...rest
}) {
  return (
    <CustomField
      name={feltNavn}
      errorClass="skjemaelement--harFeil"
      className={className}
      id={id}
      customComponent={<InnerInputComponent {...rest} />}
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

export default Select;
