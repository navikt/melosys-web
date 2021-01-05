import React, { ChangeEventHandler } from 'react';
import PT from 'prop-types';
import { Field, WrappedFieldProps } from 'redux-form';
import * as Nav from '../../../utils/navFrontend';
import * as SkjemaUtils from '../utils';

import '../skjema.css';

interface SelectWrappedComponentBaseProps extends Nav.SelectProps {
  emptyFieldDisabled?: boolean,
  emptyFieldText?: string,
  onChange?: ChangeEventHandler<HTMLSelectElement>,
}

type SelectWrappedComponentProps = SelectWrappedComponentBaseProps & WrappedFieldProps;

function SelectWrappedComponent({
  input,
  label,
  children,
  meta,
  emptyFieldDisabled,
  emptyFieldText,
  onChange,
  ...rest
}: SelectWrappedComponentProps) {
  const { touched, active } = meta;
  const feil = (touched && !active) ? SkjemaUtils.mapReduxFormFeilTilNavFeil(meta) : undefined;

  const innerChange: ChangeEventHandler<HTMLSelectElement> = e => {
    if (onChange) onChange(e);
    input.onChange(e);
  };

  const inputProps = {
    ...input,
    ...rest,
    onChange: innerChange,
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
  onChange: () => {},
};

SelectWrappedComponent.propTypes = {
  label: PT.oneOfType([PT.string, PT.object]).isRequired,
  children: PT.node,
  input: PT.object, // eslint-disable-line react/forbid-prop-types
  meta: PT.object, // eslint-disable-line react/forbid-prop-types
  emptyFieldDisabled: PT.bool,
  emptyFieldText: PT.string,
  onChange: PT.func,
};

interface SelectProps extends SelectWrappedComponentBaseProps {
  id?: string,
  className?: string,
  feltNavn: string,
}

function Select({
  id, feltNavn, className, ...rest
}: SelectProps) {
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
