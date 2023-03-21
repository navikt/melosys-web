import React, { ReactNode } from "react";
import { Controller, UseControllerProps } from "react-hook-form";

import * as Utils from "../../utils/dato";
import * as Nav from "../../navFrontend";

import PlainDatovelger from "../datovelger";

import { RegisterHookFormProps } from "./reacthookProps";

interface DatovelgerComponentProps {
  label?: ReactNode;
  disabled?: boolean;
  bredde?: string;
  minDate?: Date;
  maxDate?: Date;
  feil?: string;
  onChange?: (dato: string) => void;
}

type InnerDatovelgerComponentProps = DatovelgerComponentProps & RegisterHookFormProps;

const InnerDatovelgerComponent = React.forwardRef<HTMLSelectElement, InnerDatovelgerComponentProps>(
  (
    { label, disabled, bredde, minDate, maxDate, feil, onChange, ...rest }: InnerDatovelgerComponentProps,
    _ref: any
  ) => {
    return (
      <div {...rest}>
        <PlainDatovelger
          label={label && <Nav.Typo.Element>{label}</Nav.Typo.Element>}
          onChange={(nyDato) => onChange(Utils.dateTilNorskString(nyDato))}
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

const Datovelger = React.forwardRef<HTMLSelectElement, DatovelgerProps>(
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
            feil={(formState.errors?.[field.name]?.message as any)?.melding}
          />
        )}
      />
    );
  }
);

export default Datovelger;
