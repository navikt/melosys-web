import { Controller, UseControllerProps } from "react-hook-form";
import { forwardRef } from "react";

import * as Nav from "../../navFrontend";

import { RegisterHookFormProps } from "./misc/reacthookProps";
import { getErrorMessage } from "./misc/mapFeilmelding";

interface CheckboxComponentProps {
  className?: string;
  value?: string;
  label?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (value: any) => void;
  feil?: any;
}

type CheckboxInnerComponentProps = CheckboxComponentProps & RegisterHookFormProps;

const InnerCheckboxComponent = forwardRef<HTMLSelectElement, CheckboxInnerComponentProps>(
  ({ disabled, ...rest }: CheckboxInnerComponentProps, _ref: any) => {
    return (
      <Nav.Checkbox
        className={rest.className}
        label={rest.label}
        onChange={rest.onChange}
        onBlur={rest.onBlur}
        value={rest.value}
        name={rest.name}
        checkboxRef={rest.ref}
        feil={rest.feil}
        checked={rest.checked}
        disabled={disabled}
      />
    );
  }
);

type CheckboxProps = CheckboxComponentProps & UseControllerProps;

const Checkbox = forwardRef<HTMLSelectElement, CheckboxProps>(
  ({ name, control, checked, ...rest }: CheckboxProps, _ref: any) => {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, formState }) => (
          <InnerCheckboxComponent
            {...field}
            {...rest}
            checked={checked !== undefined ? checked : field.value}
            onChange={(event: any) => {
              field.onChange(event);
              if (rest.onChange) rest.onChange(event?.target?.value);
            }}
            feil={getErrorMessage(field, formState)}
          />
        )}
      />
    );
  }
);

export default Checkbox;
