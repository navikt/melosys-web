import { ChangeEvent, ComponentProps, useState } from "react";
import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

type InputProps = Omit<ComponentProps<typeof Nav.TextField>, "onChange" | "onBlur">;

export type FellesInputFnrDnrOrgnrSaksnrProps = InputProps & {
  value?: string;
  onChange?: (ident: string) => void;
  onBlur?: (ident: string) => void;
  redigerbart: boolean;
};

const EnkelFellesInputFnrDnrOrgnrSaksnr = ({
  label,
  error,
  onChange,
  onBlur,
  redigerbart,
  ...props
}: FellesInputFnrDnrOrgnrSaksnrProps) => {
  const [inputVerdi, setInputVerdi] = useState<string>(props?.value || "");

  const hentTrimmetStrengFraEvent = (event: ChangeEvent<HTMLInputElement>) => {
    const trimmetStreng = event.target.value.toUpperCase().replaceAll(" ", "") || "";
    setInputVerdi(trimmetStreng);
    return trimmetStreng;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = hentTrimmetStrengFraEvent(event);
    if (onChange) {
      onChange(value);
    }
  };

  const handleBlur = (event: ChangeEvent<HTMLInputElement>) => {
    const value = hentTrimmetStrengFraEvent(event);
    if (onBlur) {
      onBlur(value);
    }
  };

  return (
    <Nav.TextField
      readOnly={!redigerbart}
      label={label}
      value={inputVerdi}
      error={error}
      onChange={handleChange}
      onBlur={handleBlur}
      id={Utils._uuid()}
      {...props}
    />
  );
};

export default EnkelFellesInputFnrDnrOrgnrSaksnr;
