import React, { ComponentProps, useState } from "react";
import * as Nav from "../../navFrontend";

type InputProps = Omit<ComponentProps<typeof Nav.Input>, "onChange" | "onBlur">;

export type FellesInputFnrDnrOrgnrSaksnrProps = InputProps & {
  value?: string;
  onChange?: (ident: string) => void;
  onBlur?: (ident: string) => void;
};

const EnkelFellesInputFnrDnrOrgnrSaksnr = ({
  label,
  feil,
  onChange,
  onBlur,
  ...props
}: FellesInputFnrDnrOrgnrSaksnrProps) => {
  const [inputVerdi, setInputVerdi] = useState<string>(props?.value || "");

  const hentTrimmetStrengFraEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
    const trimmetStreng = event.target.value.toUpperCase().replaceAll(" ", "") || "";
    setInputVerdi(trimmetStreng);
    return trimmetStreng;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = hentTrimmetStrengFraEvent(event);
    if (onChange) {
      onChange(value);
    }
  };

  const handleBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = hentTrimmetStrengFraEvent(event);
    if (onBlur) {
      onBlur(value);
    }
  };

  return (
    <Nav.Input label={label} value={inputVerdi} feil={feil} onChange={handleChange} onBlur={handleBlur} {...props} />
  );
};

export default EnkelFellesInputFnrDnrOrgnrSaksnr;
