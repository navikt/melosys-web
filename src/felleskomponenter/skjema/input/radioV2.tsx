import React from "react";
import { Controller, UseControllerProps } from "react-hook-form";

import * as Nav from "../../../navFrontend";

import "../skjema.css";
import { RegisterHookFormProps } from "../reacthookProps";
import { BOOLSK_STRING } from "../../../constants";

interface RadioComponentProps {
  className?: string;
  forhandsvalgt?: boolean;
  value?: string;
  label?: string;
  disabled?: boolean;
  checked?: boolean;
  onChangeRadio?: () => void;
  feil?: any;
}

type RadioInnerComponentProps = RadioComponentProps & RegisterHookFormProps;

const normaliserReduxBoolean = (valg: string) => {
  if (valg === BOOLSK_STRING.SANN) {
    return true;
  }
  if (valg === BOOLSK_STRING.USANN) {
    return false;
  }
  return valg;
};
const InnerRadioComponent = React.forwardRef<HTMLSelectElement, RadioInnerComponentProps>(
  ({ forhandsvalgt, disabled, checked, onChangeRadio, ...rest }: RadioInnerComponentProps, _ref: any) => {
    return (
      <Nav.Radio
        className={rest.className}
        label={rest.label}
        checked={checked}
        onChange={() => {
          if (onChangeRadio) onChangeRadio();
          rest.onChange(normaliserReduxBoolean(rest.value));
        }}
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
    <Controller name={name} control={control} render={({ field }) => <InnerRadioComponent {...field} {...rest} />} />
  );
});

export default Radio;
