import React, { ReactNode } from "react";
import { Field, WrappedFieldProps } from "redux-form";
import * as SkjemaUtils from "../utils";

import Datovelger from "../../datovelger/datovelger";

import "../skjema.css";

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
    meta: { error, touched, active },
  } = rest;

  const feil = error && touched && !active ? SkjemaUtils.mapReduxFormFeilTilNavFeil(rest.meta)?.feilmelding : undefined;

  const onDatoChange = (nyDato: Date) => input.onChange(nyDato?.toLocaleDateString());

  const inputValueAsDate = () => {
    if (!input.value) return undefined;
    const now = new Date();
    const date = input.value.split(/[./]+/);
    return new Date(date[2] || now.getFullYear(), date[1] - 1 || now.getMonth(), date[0] || now.getDate());
  };

  const inputProps = {
    ...input,
    ...rest,
  };

  return (
    <div className="skjemaelement__datovelger" {...inputProps}>
      <Datovelger
        label={label}
        onChange={onDatoChange}
        value={inputValueAsDate()}
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
