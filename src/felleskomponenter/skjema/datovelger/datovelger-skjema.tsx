import React, { ReactNode } from "react";
import { Field, WrappedFieldProps } from "redux-form";
import * as SkjemaUtils from "../utils";

import Datovelger from "../../datovelger";

import "../skjema.css";
import * as Utils from "../../../utils/dato";

interface InnerDatovelgerProps {
  label: ReactNode;
  disabled?: boolean;
  bredde?: string;
  minDate?: Date;
  maxDate?: Date;
}

function InnerDatovelgerComponent({
  input,
  label,
  disabled,
  bredde,
  minDate,
  maxDate,
  ...rest
}: InnerDatovelgerProps & WrappedFieldProps) {
  const {
    meta: { touched, active },
  } = rest;

  const feil = touched && !active ? SkjemaUtils.mapReduxFormFeilTilNavFeil(rest.meta)?.feilmelding : undefined;

  const onDatoChange = (nyDato: Date) => input.onChange(nyDato?.toLocaleDateString());

  const inputProps = {
    ...input,
    ...rest,
  };

  return (
    <div className="skjemaelement__datovelger" {...inputProps}>
      <Datovelger
        label={label}
        onChange={onDatoChange}
        value={Utils.norskStringTilDate(input.value)}
        feil={feil}
        bredde={bredde}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  );
}

interface DatovelgerProps extends InnerDatovelgerProps {
  feltNavn: string;
}

function DatovelgerSkjema({
  feltNavn,
  label,
  disabled = false,
  bredde = "fullbredde",
  minDate,
  maxDate,
  ...rest
}: DatovelgerProps) {
  return (
    <Field
      name={feltNavn}
      disabled={disabled}
      component={InnerDatovelgerComponent}
      props={{ label, bredde, disabled, minDate, maxDate, ...rest }}
    />
  );
}

export default DatovelgerSkjema;
