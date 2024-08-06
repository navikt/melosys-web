import { ReactElement, forwardRef, ReactNode } from "react";
import { Controller, UseControllerProps } from "react-hook-form";
import * as Nav from "../../navFrontend";
import { getErrorMessage } from "./misc/mapFeilmelding";
import "./select.less";

interface SelectComponentProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size" | "multiple"> {
  label?: string | ReactElement;
  emptyFieldDisabled?: boolean;
  children: ReactNode | ReactNode[];
  onChange?: (value: any) => void;
  size?: "small" | "medium";
  className?: string;
  hideLabel?: boolean;
  error?: ReactNode;
  readOnly?: boolean;
  errorId?: string;
  htmlSize?: number;
  id?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectComponentProps & UseControllerProps>(
  ({ name, control, label, emptyFieldDisabled, onChange, children, className, size, ...rest }) => {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, formState }) => (
          <Nav.Select
            {...field}
            label={label}
            onChange={(event) => {
              field.onChange(event);
              if (onChange) onChange(event?.target?.value);
            }}
            error={getErrorMessage(field, formState)}
            size={size}
            className={`melosys-select ${className ?? ""}`}
            {...rest}
          >
            <option disabled={emptyFieldDisabled} value="">
              Velg...
            </option>
            {children}
          </Nav.Select>
        )}
      />
    );
  }
);

export default Select;
