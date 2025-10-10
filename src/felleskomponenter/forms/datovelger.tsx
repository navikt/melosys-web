import { ReactNode, forwardRef } from "react";
import { Controller, UseControllerProps } from "react-hook-form";

import * as Utils from "../../utils/dato";

import PlainDatovelger from "../datovelger";

import { RegisterHookFormProps } from "./misc/reacthookProps";
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
      />
    </div>
  );
}

type DatovelgerProps = DatovelgerComponentProps & UseControllerProps;

const Datovelger = forwardRef<HTMLSelectElement, DatovelgerProps>(
  ({ name, control, ...rest }: DatovelgerProps, _ref: any) => {
    return (
      <Controller
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
            onChange={(value: any) => {
              field.onChange(value || "");
              if (rest.onChange) rest.onChange(value);
            }}
            feil={getErrorMessage(field, formState)}
          />
        )}
      />
    );
  },
);

export default Datovelger;
