import { InputProps } from "nav-frontend-skjema";
import React, { useState } from "react";
import { Field } from "redux-form";
import * as Nav from "../../../navFrontend";
import * as SkjemaUtils from "../utils";

interface FellesInputFnrDnrOrgnrSaksnrProps {
  vedEndring: (sokStreng: string) => void;
  startTom?: boolean;
  meta: any;
  input: any;
  label: string;
}

const InnerFellesInputFnrDnrOrgnrSaksnr = ({
  vedEndring,
  startTom,
  ...rest
}: FellesInputFnrDnrOrgnrSaksnrProps & InputProps) => {
  const [inputVerdi, setInputVerdi] = useState<any>(startTom ? "" : rest.value);
  const {
    meta,
    meta: { touched, active },
    input,
  } = rest;

  const feil = touched && !active ? SkjemaUtils.mapReduxFormFeilTilNavFeil(meta) : undefined;

  const vedEndringAvInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const trimmetStreng = value.toUpperCase().replaceAll(" ", "");
    setInputVerdi(trimmetStreng);
    vedEndring(trimmetStreng);
  };

  return (
    <Nav.Input
      {...rest}
      onBlur={(event) => {
        input.onBlur(event);
        if (rest.onBlur) {
          rest.onBlur(event);
        }
      }}
      value={inputVerdi || ""}
      feil={rest.feil || feil}
      onChange={vedEndringAvInput}
    />
  );
};

export const FellesInputFnrDnrOrgnrSaksnr = ({ feltNavn = "", bredde = "fullbredde", className = "", ...rest }) => (
  <Field
    bredde={bredde}
    name={feltNavn}
    component={InnerFellesInputFnrDnrOrgnrSaksnr}
    className={className}
    props={{ ...rest }}
  />
);
