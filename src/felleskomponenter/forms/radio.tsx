import { Controller, UseControllerProps } from "react-hook-form";
import { forwardRef } from "react";

import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

import { RegisterHookFormProps } from "./misc/reacthookProps";
import { getErrorMessage } from "./misc/mapFeilmelding";

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

const InnerRadioComponent = forwardRef<HTMLSelectElement, RadioInnerComponentProps>(
  ({ ...props }: RadioInnerComponentProps, _ref: any) => {
    return (
      <Nav.Radio
        className={props.className}
        label={props.label}
        onChange={props.onChange}
        onBlur={props.onBlur}
        value={props.value}
        name={props.name}
        radioRef={props.ref}
        feil={props.feil}
        checked={props.checked}
        disabled={props.disabled}
        id={Utils._uuid()}
      />
    );
  }
);

type RadioProps = RadioComponentProps & UseControllerProps;

const Radio = forwardRef<HTMLSelectElement, RadioProps>(
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
