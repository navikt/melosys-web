import { Field, WrappedFieldProps } from "redux-form";
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
  redigerbart,
  ...rest
}: FellesInputFnrDnrOrgnrSaksnrProps & WrappedFieldProps) => {
  const {
    meta,
    meta: { touched, active },
  } = rest;

  const feil = touched && !active ? SkjemaUtils.mapReduxFormFeilTilNavFeil(meta) : undefined;

  const innerBlur = (ident: string) => {
    if (onBlur) onBlur(ident);
    input.onBlur(ident);
  };

  const innerChange = (ident: string) => {
    if (onChange) onChange(ident);
    input.onChange(ident);
  };

  const inputProps = {
    ...input,
    ...rest,
    onBlur: innerBlur,
    onChange: innerChange,
  };

  return (
    <EnkelFellesInputFnrDnrOrgnrSaksnr
      label={label}
      error={feil || undefined}
      redigerbart={redigerbart}
      {...inputProps}
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

export { InnerFellesInputFnrDnrOrgnrSaksnr };
export default FellesInputFnrDnrOrgnrSaksnr;
