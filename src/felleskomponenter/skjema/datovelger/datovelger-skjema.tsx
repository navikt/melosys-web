import React, { ReactNode } from "react";
import { Field, WrappedFieldProps } from "redux-form";
import * as SkjemaUtils from "../utils";

import Datovelger from "../../datovelger/datovelger";

import "../skjema.css";
import { norskStringTilDate } from "../../../utils/dato";

interface InnerDatovelgerProps {
  label: ReactNode;
  disabled?: boolean;
  bredde?: string;
}

function InnerDatovelgerComponent({
  input,
  label,
  bredde,
  disabled,
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
        value={norskStringTilDate(input.value)}
        feil={feil}
        bredde={bredde}
        disabled={disabled}
      />
    </div>
  );
}

interface DatovelgerProps extends InnerDatovelgerProps {
  feltNavn: string;
}

function DatovelgerSkjema({ feltNavn, label, disabled = false, bredde = "fullbredde", ...rest }: DatovelgerProps) {
  return (
    <Field
      name={feltNavn}
      disabled={disabled}
      component={InnerDatovelgerComponent}
      props={{ label, bredde, disabled, ...rest }}
    />
  );
}

export default DatovelgerSkjema;
