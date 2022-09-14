import { InputProps } from "nav-frontend-skjema";
import React, { useEffect, useState } from "react";
import * as Nav from "../../navFrontend";

export interface FellesInputFnrDnrOrgnrSaksnrProps {
  vedEndring: (sokStreng: string) => void;
  feil?: string;
  meta?: any;
  input?: any;
}

const EnkelFellesInputFnrDnrOrgnrSaksnr = ({
  vedEndring,
  feil,
  ...rest
}: FellesInputFnrDnrOrgnrSaksnrProps & InputProps) => {
  const [inputVerdi, setInputVerdi] = useState<any>(rest.input && rest.input.value ? rest.input.value : "");
  const { input } = rest;

  useEffect(() => {
    if (input) {
      setInputVerdi(input.value);
    }
  }, [input]);

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
        if (input && input.onBlur) {
          input.onBlur(event);
        }
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

export default EnkelFellesInputFnrDnrOrgnrSaksnr;
