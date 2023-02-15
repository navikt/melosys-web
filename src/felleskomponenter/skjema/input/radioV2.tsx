import React from "react";
import { Controller, UseControllerProps } from "react-hook-form";

import * as Nav from "../../../navFrontend";

import "../skjema.css";
import { RegisterHookFormProps } from "../reacthookProps";

interface RadioComponentProps {
  forhandsvalgt?: boolean;
  value?: string;
  label?: string;
  disabled?: boolean;
}

type RadioInnerComponentProps = RadioComponentProps & RegisterHookFormProps;

const InnerRadioComponent = React.forwardRef<HTMLSelectElement, RadioInnerComponentProps>(
  ({ forhandsvalgt, disabled, ...rest }: RadioInnerComponentProps) => {
    const gjeldendeFeltVerdi = rest.value;
    const radioButtonVerdi = rest.value;

    return (
      <Nav.Radio
        label={rest.label}
        onChange={rest.onChange}
        onBlur={rest.onBlur}
        value={rest.value}
        name={rest.name}
        checked={gjeldendeFeltVerdi === radioButtonVerdi || forhandsvalgt}
        ref={rest.ref}
      />
    );
  }
);

type RadioProps = RadioComponentProps & UseControllerProps;

const Radio = React.forwardRef<HTMLSelectElement, RadioProps>(({ name, control, ...rest }: RadioProps) => {
  return (
    <Controller name={name} control={control} render={({ field }) => <InnerRadioComponent {...field} {...rest} />} />
  );
});

export default Radio;
