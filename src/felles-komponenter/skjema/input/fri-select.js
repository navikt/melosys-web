import React from 'react';
import PT from 'prop-types';
import { Input as NavInput } from 'nav-frontend-skjema';
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
    <div>
      <NavInput label={label} feil={feil} {...inputProps} list="datalisten" />
      <datalist id="datalisten">
        {children}
      </datalist>
    </div>
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

const FriSelect = ({
  id, feltNavn, className, ...rest
}) => (
  <CustomField
    name={feltNavn}
    errorClass="skjemaelement--harFeil"
    className={className}
    id={id}
    customComponent={<InnerInputComponent {...rest} />}
  />
);

FriSelect.defaultProps = {
  className: '',
  id: undefined,
};

FriSelect.propTypes = {
  feltNavn: PT.string.isRequired,
  id: PT.string,
  className: PT.string,
};

export default FriSelect;
