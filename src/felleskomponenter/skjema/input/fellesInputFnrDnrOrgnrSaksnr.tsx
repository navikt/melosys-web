import { InputProps } from "nav-frontend-skjema";
import React from "react";
import { Field } from "redux-form";
import EnkelFellesInputFnrDnrOrgnrSaksnr, {
  FellesInputFnrDnrOrgnrSaksnrProps,
} from "../inputFnrDnrOrgnr/EnkelFellesInputFnrDnrOrgnrSaksnr";
import * as SkjemaUtils from "../utils";

const InnerFellesInputFnrDnrOrgnrSaksnr = ({ vedEndring, ...rest }: FellesInputFnrDnrOrgnrSaksnrProps & InputProps) => {
  const {
    meta,
    meta: { touched, active },
  } = rest;

  const feil = touched && !active ? SkjemaUtils.mapReduxFormFeilTilNavFeil(meta) : undefined;

  return <EnkelFellesInputFnrDnrOrgnrSaksnr {...rest} feil={rest.feil || feil} vedEndring={vedEndring} />;
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
