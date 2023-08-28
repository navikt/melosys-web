import { ReactElement, forwardRef, ReactNode } from "react";
import { Controller, UseControllerProps } from "react-hook-form";
import * as Nav from "../../navFrontend";

import { RegisterHookFormProps } from "./misc/reacthookProps";
import { getErrorMessage } from "./misc/mapFeilmelding";

interface SelectComponentProps extends Nav.SelectProps {
  label?: string | ReactElement;
  emptyFieldDisabled?: boolean;
  disabled?: boolean;
  children: ReactNode | ReactNode[];
  onChange?: (value: any) => void;
}

type SelectInnerComponentProps = SelectComponentProps & RegisterHookFormProps;

const SelectInnerComponent = forwardRef<HTMLSelectElement, SelectInnerComponentProps>(
  (
    {
      label,
      emptyFieldDisabled,
      disabled,
      children,
      onChange,
      onBlur,
      name,
      value,
      itemRef,
      feil,
      ...rest
    }: SelectProps,
    _ref: any
  ) => {
    return (
      <Nav.Select
        label={label}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        name={name}
        value={value}
        ref={itemRef}
        feil={feil}
        {...rest}
      >
        <option disabled={emptyFieldDisabled} value="">
          Velg...
        </option>
        {children}
      </Nav.Select>
    );
  }
);

type SelectProps = SelectComponentProps & UseControllerProps;

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ name, control, label, emptyFieldDisabled, disabled, onChange, children, ...rest }: SelectProps, _ref: any) => {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, formState }) => (
          <SelectInnerComponent
            {...field}
            label={label}
            emptyFieldDisabled={emptyFieldDisabled}
            disabled={disabled}
            onChange={(event: any) => {
              field.onChange(event);
              if (onChange) onChange(event?.target?.value);
            }}
            feil={getErrorMessage(field, formState)}
            {...rest}
          >
            {children}
          </SelectInnerComponent>
        )}
      />
    );
  }
);

export default Select;
