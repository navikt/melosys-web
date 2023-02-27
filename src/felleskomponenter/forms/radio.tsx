import React from "react";
import { Controller, UseControllerProps } from "react-hook-form";

import * as Nav from "../../navFrontend";

import { RegisterHookFormProps } from "./reacthookProps";

interface RadioComponentProps {
  className?: string;
  forhandsvalgt?: boolean;
  value?: string;
  label?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (value: any) => void;
  feil?: boolean;
}

type RadioInnerComponentProps = RadioComponentProps & RegisterHookFormProps;

const InnerRadioComponent = React.forwardRef<HTMLSelectElement, RadioInnerComponentProps>(
  ({ forhandsvalgt, disabled, ...rest }: RadioInnerComponentProps, _ref: any) => {
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
      />
    );
  }
);

type RadioProps = RadioComponentProps & UseControllerProps;

const Radio = React.forwardRef<HTMLSelectElement, RadioProps>(({ name, control, ...rest }: RadioProps, _ref: any) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, formState }) => (
        <InnerRadioComponent
          {...field}
          {...rest}
          checked={field.value === rest.value}
          onChange={(event: any) => {
            field.onChange(event);
            if (rest.onChange) rest.onChange(event?.target?.value);
          }}
          feil={(formState.errors?.[field.name]?.message as any)?.melding}
        />
      )}
    />
  );
});

export default Radio;
