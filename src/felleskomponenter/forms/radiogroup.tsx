import { Controller, FieldValues } from "react-hook-form";
import { ReactNode } from "react";

import * as Nav from "../../navFrontend";
import { getErrorMessage } from "./misc/mapFeilmelding";
import { ReactHookFormControllerProps } from "./misc/reacthookProps";
import "./radiogroup.less";

interface RadioGroupComponentProps {
  className?: string;
  value?: string;
  label?: string | ReactNode;
  readOnly?: boolean;
  onChange?: (value: any) => void;
  feil?: any;
  children: ReactNode;
  legend: ReactNode;
  defaultValue?: any;
  size?: "small" | "medium" | undefined;
  hideLegend?: boolean;
}

type RadioProps<TFieldValues extends FieldValues = FieldValues> = RadioGroupComponentProps &
  ReactHookFormControllerProps<TFieldValues>;

function RadioGroup<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  legend,
  children,
  defaultValue,
  className,
  size,
  ...rest
}: RadioProps<TFieldValues>) {
  return (
    <Controller<TFieldValues>
      name={name}
      control={control}
      render={({ field, formState }) => (
        <Nav.RadioGroup
          {...rest}
          legend={legend}
          defaultValue={field.value ?? defaultValue}
          size={size}
          onChange={(value: any) => {
            field.onChange(value);
            if (rest.onChange) rest.onChange(value);
          }}
          error={getErrorMessage(field, formState)}
          className={`melosys-radiogroup ${className ?? ""}`}
          name={name}
        >
          {children}
        </Nav.RadioGroup>
      )}
    />
  );
}

export default RadioGroup;
