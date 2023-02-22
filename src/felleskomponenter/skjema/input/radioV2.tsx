import React from "react";
import { Controller, UseControllerProps } from "react-hook-form";

import * as Nav from "../../../navFrontend";

import "../skjema.css";
import { RegisterHookFormProps } from "../reacthookProps";

interface RadioComponentProps {
  className?: string;
  forhandsvalgt?: boolean;
  value?: string;
  label?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (value: any) => void;
  onChangeRadio?: () => void;
  feil?: any;
}

type RadioInnerComponentProps = RadioComponentProps & RegisterHookFormProps;

const InnerRadioComponent = React.forwardRef<HTMLSelectElement, RadioInnerComponentProps>(
  ({ forhandsvalgt, disabled, checked, ...rest }: RadioInnerComponentProps, _ref: any) => {
    return (
      <Nav.Radio
        className={rest.className}
        label={rest.label}
        checked={checked}
        onChange={rest.onChange}
        disabled={disabled}
        feil={rest.feil}
        onBlur={rest.onBlur}
        value={rest.value}
        name={rest.name}
        radioRef={rest.ref}
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
      render={({ field }) => (
        <InnerRadioComponent
          {...field}
          {...rest}
          onChange={(event: any) => {
            field.onChange(event);
            if (rest.onChange) rest.onChange(event?.target?.value);
            if (rest.onChangeRadio) rest.onChangeRadio();
          }}
        />
      )}
    />
  );
});

export default Radio;
