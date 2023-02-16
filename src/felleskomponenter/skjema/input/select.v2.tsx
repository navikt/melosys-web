import React from "react";
import { Controller, UseControllerProps } from "react-hook-form";
import * as Nav from "../../../navFrontend";

import "../skjema.css";
import { RegisterHookFormProps } from "../reacthookProps";

interface SelectComponentProps extends Nav.SelectProps {
  label?: string;
  emptyFieldDisabled?: boolean;
  emptyFieldText?: string;
  disabled?: boolean;
  children: React.ReactNode | React.ReactNode[];
  onChange?: (value: any) => void;
}

type SelectInnerComponentProps = SelectComponentProps & RegisterHookFormProps;

const SelectInnerComponent = React.forwardRef<HTMLSelectElement, SelectInnerComponentProps>(
  ({ label, emptyFieldDisabled, emptyFieldText, disabled, children, ...rest }: SelectProps, _ref: any) => {
    return (
      <Nav.Select
        label={label}
        disabled={disabled}
        onChange={rest.onChange}
        onBlur={rest.onBlur}
        name={rest.name}
        value={rest.value}
        ref={rest.itemRef}
      >
        <option disabled={emptyFieldDisabled} value="">
          {emptyFieldText}
        </option>
        {children}
      </Nav.Select>
    );
  }
);

type SelectProps = SelectComponentProps & UseControllerProps;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ name, control, ...rest }: SelectProps, _ref: any) => {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <SelectInnerComponent
            {...field}
            label={rest.label}
            emptyFieldText={rest.emptyFieldText}
            emptyFieldDisabled={rest.emptyFieldDisabled}
            disabled={rest.disabled}
            onChange={(event: any) => {
              field.onChange(event);
              if (rest.onChange) rest.onChange(event?.target?.value);
            }}
          >
            {rest.children}
          </SelectInnerComponent>
        )}
      />
    );
  }
);

export default Select;
