import React from 'react';
import PT from 'prop-types';
import classNames from 'classnames';
import { CustomField } from 'react-redux-form-validation';
import '../skjema.css';

function InnerInputComponent({
  label, feltNavn, children, errorMessage,
}) {
  return (
    <div className={classNames({ 'skjema--harFeil': errorMessage })}>
      <div className={classNames({ skjema__feilomrade: errorMessage })}>
        <label className="skjemaelement__label" htmlFor={feltNavn}>
          {label}
          {children}
          <div
            role="alert"
            aria-live="assertive"
            className="skjemaelement__feilmelding">
            {errorMessage}
          </div>
        </label>
      </div>
    </div>
  );
}

InnerInputComponent.propTypes = {
  label: PT.string.isRequired,
  feltNavn: PT.string.isRequired,
  children: PT.node,
  errorMessage: PT.arrayOf(PT.node),
};

InnerInputComponent.defaultProps = {
  children: undefined,
  errorMessage: null,
};

function RadioGruppe({ feltNavn, label, children }) {
  return (
    <CustomField
      name={feltNavn}
      customComponent={
        <InnerInputComponent label={label} feltNavn={feltNavn}>
          {children}
        </InnerInputComponent>
      }
    />
  );
}

RadioGruppe.propTypes = {
  feltNavn: PT.string.isRequired,
  label: PT.string.isRequired,
  children: PT.node,
};

RadioGruppe.defaultProps = {
  children: undefined,
};

export default RadioGruppe;
