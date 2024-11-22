import { ComponentProps, forwardRef } from "react";
import { Controller, UseControllerProps } from "react-hook-form";
import * as Nav from "../../navFrontend";

import { RegisterHookFormProps } from "./misc/reacthookProps";
import { getErrorMessage } from "./misc/mapFeilmelding";

type InputInnerComponentProps = ComponentProps<typeof Nav.TextField> & RegisterHookFormProps;

const InputInnerComponent = ({ ...props }: InputInnerComponentProps) => {
  return <Nav.TextField {...props} />;
};

type InputProps = Omit<ComponentProps<typeof Nav.TextField>, "onChange"> &
  UseControllerProps & {
    onChange?: (value: string) => void;
  };

const Input = forwardRef<HTMLInputElement, InputProps>(({ name, control, error, ...rest }: InputProps, _ref: any) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, formState }) => (
        <InputInnerComponent
          {...field}
          {...rest}
          onChange={(event: any) => {
            field.onChange(event);
            if (rest.onChange) rest.onChange(event?.target?.value);
          }}
          error={error ?? getErrorMessage(field, formState)}
        />
      )}
    />
  );
});

export default Input;
