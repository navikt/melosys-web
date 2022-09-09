import { InputProps } from "nav-frontend-skjema";
import React, { useEffect, useState } from "react";
import { Field } from "redux-form";
import * as Nav from "../../../navFrontend";
import * as SkjemaUtils from "../utils";

interface FellesInputFnrDnrOrgnrSaksnrProps {
  vedEndring: (sokStreng: string) => void;
  feil?: string;
  meta?: any;
  input?: any;
}

const InnerFellesInputFnrDnrOrgnrSaksnr = ({ vedEndring, ...rest }: FellesInputFnrDnrOrgnrSaksnrProps & InputProps) => {
  const {
    meta,
    meta: { touched, active },
  } = rest;

  const feil = touched && !active ? SkjemaUtils.mapReduxFormFeilTilNavFeil(meta) : undefined;

  return <EnkelFellesInputFnrDnrOrgnrSaksnr {...rest} feil={rest.feil || feil} vedEndring={vedEndring} />;
};

const EnkelFellesInputFnrDnrOrgnrSaksnr = ({
  vedEndring,
  feil,
  ...rest
}: FellesInputFnrDnrOrgnrSaksnrProps & InputProps) => {
  const [inputVerdi, setInputVerdi] = useState<any>(rest.input.value ? rest.input.value : "");
  const { input } = rest;

  useEffect(() => {
    setInputVerdi(input.value);
  }, [input.value]);

  const vedEndringAvInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const trimmetStreng = value.toUpperCase().replaceAll(" ", "");
    setInputVerdi(trimmetStreng);
    if (vedEndring) {
      vedEndring(trimmetStreng);
    }
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
      feil={feil}
      onChange={vedEndringAvInput}
    />
  );
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

export { InnerFellesInputFnrDnrOrgnrSaksnr, EnkelFellesInputFnrDnrOrgnrSaksnr };
export default FellesInputFnrDnrOrgnrSaksnr;
