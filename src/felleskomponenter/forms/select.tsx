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
  ({ label, emptyFieldDisabled, disabled, children, ...rest }: SelectProps, _ref: any) => {
    return (
      <Nav.Select
        label={label}
        disabled={disabled}
        onChange={rest.onChange}
        onBlur={rest.onBlur}
        name={rest.name}
        value={rest.value}
        ref={rest.itemRef}
        feil={rest.feil}
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

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ name, control, ...rest }: SelectProps, _ref: any) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, formState }) => (
        <SelectInnerComponent
          {...field}
          label={rest.label}
          emptyFieldDisabled={rest.emptyFieldDisabled}
          disabled={rest.disabled}
          onChange={(event: any) => {
            field.onChange(event);
            if (rest.onChange) rest.onChange(event?.target?.value);
          }}
          feil={getErrorMessage(field, formState)}
        >
          {rest.children}
        </SelectInnerComponent>
      )}
    />
  );
});

export default Select;
