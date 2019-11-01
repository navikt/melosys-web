import React from 'react';
import PT from 'prop-types';
import classNames from 'classnames';
import { Field } from 'redux-form';
import * as Nav from '../../../utils/navFrontend';
import * as Utils from '../../../utils';

import '../skjema.css';

const RadioGruppeWrappedComponent = ({
  feltNavn, legend, label, children, meta,
}) => {
  const { error, touched, active } = meta;
  const skjemaError = Utils._isObject(meta.error) ? error.melding : error;
  const skalViseError = error && touched && !active;
  const errorMessage = skalViseError ? <div>{skjemaError}</div> : null;

  return (
    <Nav.Fieldset legend={legend || label} >
      <div className={classNames({ 'skjema__feilomrade--harFeil': skalViseError })}>
        <label className="skjemaelement__label" htmlFor={feltNavn}>
          {children}
          <div
            role="alert"
            aria-live="assertive"
            className="skjemaelement__feilmelding">
            {errorMessage}
          </div>
        </label>
      </div>
    </Nav.Fieldset>
  );
};

RadioGruppeWrappedComponent.propTypes = {
  feltNavn: PT.string.isRequired,
  children: PT.node.isRequired,
  meta: PT.object.isRequired,
  legend: PT.string.isRequired,
  label: PT.string.isRequired,
};


function RadioGruppe({ feltNavn, ...rest }) {
  return (
    <Field
      name={feltNavn}
      component={RadioGruppeWrappedComponent}
      props={{ feltNavn, ...rest }}
    />
  );
}

RadioGruppe.propTypes = {
  feltNavn: PT.string.isRequired,
  legend: PT.string,
  label: PT.string,
  children: PT.node,
};

RadioGruppe.defaultProps = {
  children: undefined,
  legend: '',
  label: '',
};

export { RadioGruppeWrappedComponent };
export default RadioGruppe;
