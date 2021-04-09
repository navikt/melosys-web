import React, { ReactNode, useState } from "react";
import { Field, WrappedFieldProps } from "redux-form";

import Datovelger from "../../datovelger/datovelger";

interface InnerDatovelgerProps extends WrappedFieldProps {
  label: ReactNode;
}

function InnerDatovelgerComponent({ input, label, ...rest }: InnerDatovelgerProps) {
  const [dato, setDato] = useState<Date>();

  const {
    meta: { error, touched, active },
  } = rest;

  const feil = error && touched && !active ? rest.meta.error.melding : undefined;

  const onDatoChange = (nyDato: Date) => {
    setDato(nyDato);
    input.onChange(nyDato?.toLocaleDateString());
  };

  const inputProps = {
    ...input,
    ...rest,
  };

  return (
    <div className="skjemaelement__datofelt" {...inputProps}>
      <Datovelger label={label} onChange={onDatoChange} value={dato} feil={feil} />
    </div>
  );
}

interface DatovelgerProps {
  label: ReactNode;
  feltNavn: string;
  disabled?: boolean;
}

function DatovelgerSkjema({ feltNavn, label, disabled = false, ...rest }: DatovelgerProps) {
  return <Field name={feltNavn} disabled={disabled} component={InnerDatovelgerComponent} props={{ label, ...rest }} />;
}

export default DatovelgerSkjema;
