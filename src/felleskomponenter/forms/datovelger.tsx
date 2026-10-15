import { ReactNode } from "react";
import { Controller, FieldValues } from "react-hook-form";

import * as Utils from "../../utils/dato";

import PlainDatovelger from "../datovelger";

import { ReactHookFormControllerProps, RegisterHookFormProps } from "./misc/reacthookProps";
import { getErrorMessage } from "./misc/mapFeilmelding";

interface DatovelgerComponentProps {
  label?: ReactNode;
  readOnly?: boolean;
  bredde?: string;
  minDate?: Date;
  maxDate?: Date;
  feil?: string;
  onChange?: (dato: string) => void;
  className?: string;
  forhindreAutoUtfylling?: boolean;
  laasAar?: boolean;
}

type InnerDatovelgerComponentProps = DatovelgerComponentProps & RegisterHookFormProps;

function InnerDatovelgerComponent({
  label,
  readOnly,
  bredde,
  minDate,
  maxDate,
  feil,
  onChange,
  forhindreAutoUtfylling,
  laasAar,
  ...rest
}: InnerDatovelgerComponentProps) {
  return (
    <div {...rest}>
      <PlainDatovelger
        label={label}
        onChange={onChange}
        onBlur={rest.onBlur}
        value={Utils.norskStringTilDate(rest.value)}
        feil={feil}
        bredde={bredde}
        readOnly={readOnly}
        minDate={minDate}
        maxDate={maxDate}
        forhindreAutoUtfylling={forhindreAutoUtfylling}
        laasAar={laasAar}
      />
    </div>
  );
}

type DatovelgerProps<TFieldValues extends FieldValues = FieldValues> = DatovelgerComponentProps &
  ReactHookFormControllerProps<TFieldValues>;

function Datovelger<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  ...rest
}: DatovelgerProps<TFieldValues>) {
  return (
    <Controller<TFieldValues>
      name={name}
      control={control}
      render={({ field, formState }) => (
        <InnerDatovelgerComponent
          {...field}
          {...rest}
          label={rest.label}
          readOnly={rest.readOnly}
          bredde={rest.bredde}
          minDate={rest.minDate}
          maxDate={rest.maxDate}
          forhindreAutoUtfylling={rest.forhindreAutoUtfylling}
          laasAar={rest.laasAar}
          onChange={(value: string) => {
            field.onChange(value || "");
            if (rest.onChange) rest.onChange(value);
          }}
          feil={getErrorMessage(field, formState)}
        />
      )}
    />
  );
}

export default Datovelger;
