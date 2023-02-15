import React, { ReactNode } from "react";
import { Controller, UseControllerProps } from "react-hook-form";

import * as Utils from "../../../utils/dato";
import * as Nav from "../../../navFrontend";

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
  onChange?: (dato: string) => void;
}

type InnerDatovelgerComponentProps = DatovelgerComponentProps & RegisterHookFormProps;

const InnerDatovelgerComponent = React.forwardRef<HTMLSelectElement, InnerDatovelgerComponentProps>(
  ({ label, disabled, bredde, minDate, maxDate, feil, ...rest }: InnerDatovelgerComponentProps) => {
    return (
      <div className="skjemaelement__datovelger" {...rest}>
        <Datovelger
          label={<Nav.Typo.Element>{label}</Nav.Typo.Element>}
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
            onChange={(value: any) => {
              field.onChange(value);
              if (rest.onChange) rest.onChange(value);
            }}
          />
        )}
      />
    );
  }
);

export default DatovelgerV2;
