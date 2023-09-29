import { ReactNode, forwardRef } from "react";
import { Controller, UseControllerProps } from "react-hook-form";

import * as Utils from "../../utils/dato";

import PlainDatovelger from "../datovelger";

import { RegisterHookFormProps } from "./misc/reacthookProps";
import { getErrorMessage } from "./misc/mapFeilmelding";

interface DatovelgerComponentProps {
  label?: ReactNode;
  disabled?: boolean;
  bredde?: string;
  minDate?: Date;
  maxDate?: Date;
  feil?: string;
  onChange?: (dato: string) => void;
  className?: string;
}

type InnerDatovelgerComponentProps = DatovelgerComponentProps & RegisterHookFormProps;

const InnerDatovelgerComponent = forwardRef<HTMLSelectElement, InnerDatovelgerComponentProps>(
  (
    { label, disabled, bredde, minDate, maxDate, feil, onChange, ...rest }: InnerDatovelgerComponentProps,
    _ref: any
  ) => {
    return (
      <div {...rest}>
        <PlainDatovelger
          label={label && <b>{label}</b>}
          onChange={onChange}
          onBlur={rest.onBlur}
          value={Utils.norskStringTilDate(rest.value)}
          feil={feil}
          bredde={bredde}
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate}
        />
      </div>
    );
  }
);

type DatovelgerProps = DatovelgerComponentProps & UseControllerProps;

const Datovelger = forwardRef<HTMLSelectElement, DatovelgerProps>(
  ({ name, control, ...rest }: DatovelgerProps, _ref: any) => {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, formState }) => (
          <InnerDatovelgerComponent
            {...field}
            {...rest}
            label={rest.label}
            disabled={rest.disabled}
            bredde={rest.bredde}
            minDate={rest.minDate}
            maxDate={rest.maxDate}
            onChange={(value: any) => {
              field.onChange(value || "");
              if (rest.onChange) rest.onChange(value);
            }}
            feil={getErrorMessage(field, formState)}
          />
        )}
      />
    );
  }
);

export default Datovelger;
