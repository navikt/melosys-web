import React, { ReactNode } from "react";
import { Controller, UseControllerProps } from "react-hook-form";

import * as Utils from "../../../utils/dato";

import Datovelger from "../../datovelger";

import "../skjema.css";
import { RegisterHookFormProps } from "../reacthookProps";

interface DatovelgerComponentProps {
  label: ReactNode;
  disabled?: boolean;
  bredde?: string;
  minDate?: Date;
  maxDate?: Date;
  feil?: string;
}

type InnerDatovelgerComponentProps = DatovelgerComponentProps & RegisterHookFormProps;

const InnerDatovelgerComponent = React.forwardRef<HTMLSelectElement, InnerDatovelgerComponentProps>(
  ({ label, disabled, bredde, minDate, maxDate, feil, ...rest }: InnerDatovelgerComponentProps) => {
    return (
      <div className="skjemaelement__datovelger" {...rest}>
        <Datovelger
          label={label}
          onChange={(nyDato) => rest.onChange(Utils.dateTilNorskString(nyDato))}
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

const DatovelgerV2 = React.forwardRef<HTMLSelectElement, DatovelgerProps>(
  ({ name, control, ...rest }: DatovelgerProps) => {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <InnerDatovelgerComponent
            {...field}
            {...rest}
            label={rest.label}
            disabled={rest.disabled}
            bredde={rest.bredde}
            minDate={rest.minDate}
            maxDate={rest.maxDate}
          />
        )}
      />
    );
  }
);

export default DatovelgerV2;
