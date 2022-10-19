import { InputProps } from "nav-frontend-skjema";
import React, { useState } from "react";
import * as Nav from "../../navFrontend";

export interface FellesInputFnrDnrOrgnrSaksnrProps {
  label: React.ReactNode;
  feil?: string;
  meta?: any;
  input?: any;
  onChange?: (sokStreng: string) => void;
  vedEndring?: (sokStreng: string) => void;
  onBlur?: (sokStreng: string) => void;
}

const EnkelFellesInputFnrDnrOrgnrSaksnr = ({
  label,
  feil,
  onBlur,
  vedEndring,
  ...rest
}: FellesInputFnrDnrOrgnrSaksnrProps & InputProps) => {
  const [inputVerdi, setInputVerdi] = useState<string>(rest?.input?.value || "");

  const hentTrimmetStrengFraEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
    const trimmetStreng = event.target.value.toUpperCase().replaceAll(" ", "") || "";
    setInputVerdi(trimmetStreng);
    return trimmetStreng;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = hentTrimmetStrengFraEvent(event);
    if (rest?.onChange) {
      rest?.onChange(value);
    }
    if (vedEndring) {
      vedEndring(value);
    }
  };

  const handleBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = hentTrimmetStrengFraEvent(event);
    if (onBlur) {
      onBlur(value);
    }
  };

  return (
    <Nav.Input label={label} value={inputVerdi} feil={feil} onChange={handleChange} onBlur={handleBlur} {...rest} />
  );
};

export default EnkelFellesInputFnrDnrOrgnrSaksnr;
