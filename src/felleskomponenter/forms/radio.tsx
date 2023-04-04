import React from "react";
import { Controller, UseControllerProps } from "react-hook-form";

import * as Nav from "../../navFrontend";

import { RegisterHookFormProps } from "./support/reacthookProps";
import { getErrorMessage } from "./support/mapFeilmelding";

interface RadioComponentProps {
  className?: string;
  value?: string;
  label?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (value: any) => void;
  feil?: any;
}

type RadioInnerComponentProps = RadioComponentProps & RegisterHookFormProps;

const InnerRadioComponent = React.forwardRef<HTMLSelectElement, RadioInnerComponentProps>(
  ({ disabled, ...rest }: RadioInnerComponentProps, _ref: any) => {
    return (
      <Nav.Radio
        className={rest.className}
        label={rest.label}
        onChange={rest.onChange}
        onBlur={rest.onBlur}
        value={rest.value}
        name={rest.name}
        radioRef={rest.ref}
        feil={rest.feil}
        checked={rest.checked}
        disabled={disabled}
      />
    );
  }
);

type RadioProps = RadioComponentProps & UseControllerProps;

const Radio = React.forwardRef<HTMLSelectElement, RadioProps>(
  ({ name, control, checked, ...rest }: RadioProps, _ref: any) => {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, formState }) => (
          <InnerRadioComponent
            {...field}
            {...rest}
            checked={checked !== undefined ? checked : field.value === rest.value}
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

export default Radio;
