import { Controller, UseControllerProps } from "react-hook-form";
import { forwardRef, ReactNode } from "react";

import * as Nav from "../../navFrontend";
import { getErrorMessage } from "./misc/mapFeilmelding";
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

type RadioProps = RadioGroupComponentProps & UseControllerProps;

const RadioGroup = forwardRef<HTMLSelectElement, RadioProps>(
  ({ name, control, legend, children, defaultValue, className, size, ...rest }: RadioProps, _ref: any) => {
    return (
      <Controller
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
  },
);

export default RadioGroup;
