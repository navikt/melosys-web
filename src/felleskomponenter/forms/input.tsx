import { ReactElement, forwardRef } from "react";
import { Controller, UseControllerProps } from "react-hook-form";
import * as Nav from "../../navFrontend";

import { RegisterHookFormProps } from "./misc/reacthookProps";
import { getErrorMessage } from "./misc/mapFeilmelding";

interface InputComponentProps extends Nav.InputProps {
  label?: string | ReactElement;
  disabled?: boolean;
  onChange?: (value: any) => void;
}

type InputInnerComponentProps = InputComponentProps & RegisterHookFormProps;

const InputInnerComponent = forwardRef<HTMLInputElement, InputInnerComponentProps>(
  ({ label, disabled, ...rest }: InputProps, _ref: any) => {
    return (
      <Nav.Input
        {...rest}
        label={label}
        disabled={disabled}
        onChange={rest.onChange}
        name={rest.name}
        feil={rest.feil}
        ref={rest.itemRef}
      />
    );
  }
);

type InputProps = InputComponentProps & UseControllerProps;

const Input = forwardRef<HTMLInputElement, InputProps>(({ name, control, feil, ...rest }: InputProps, _ref: any) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, formState }) => (
        <InputInnerComponent
          {...field}
          {...rest}
          label={rest.label}
          disabled={rest.disabled}
          onChange={(event: any) => {
            field.onChange(event);
            if (rest.onChange) rest.onChange(event?.target?.value);
          }}
          feil={feil ?? getErrorMessage(field, formState)}
        />
      )}
    />
  );
});

export default Input;
