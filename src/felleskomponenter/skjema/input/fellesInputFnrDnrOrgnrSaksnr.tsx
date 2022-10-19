import { InputProps } from "nav-frontend-skjema";
import React from "react";
import { Field } from "redux-form";
import {
  EnkelFellesInputFnrDnrOrgnrSaksnr,
  FellesInputFnrDnrOrgnrSaksnrProps,
} from "../../enkelFellesInputFnrDnrOrgnrSaksnr";

import * as SkjemaUtils from "../utils";

const InnerFellesInputFnrDnrOrgnrSaksnr = ({
  input,
  label,
  onBlur,
  onChange,
  ...rest
}: FellesInputFnrDnrOrgnrSaksnrProps & InputProps) => {
  const {
    meta,
    meta: { touched, active },
  } = rest;

  const feil = touched && !active ? SkjemaUtils.mapReduxFormFeilTilNavFeil(meta) : undefined;

  const innerBlur = (e: string) => {
    if (onBlur) onBlur(e);
    input.onBlur(e);
  };

  const innerChange = (e: string) => {
    if (onChange) onChange(e);
    input.onChange(e);
  };

  const inputProps = {
    ...input,
    ...rest,
    onBlur: innerBlur,
    onChange: innerChange,
  };

  return <EnkelFellesInputFnrDnrOrgnrSaksnr label={label} feil={feil || undefined} {...inputProps} />;
};

const FellesInputFnrDnrOrgnrSaksnr = ({ feltNavn = "", bredde = "fullbredde", className = "", ...rest }) => (
  <Field
    bredde={bredde}
    name={feltNavn}
    component={InnerFellesInputFnrDnrOrgnrSaksnr}
    className={className}
    props={{ ...rest }}
  />
);

export { InnerFellesInputFnrDnrOrgnrSaksnr };
export default FellesInputFnrDnrOrgnrSaksnr;
