import { ReactElement, forwardRef, ReactNode, ComponentProps } from "react";
import { Controller, UseControllerProps } from "react-hook-form";
import * as Nav from "../../navFrontend";
import { getErrorMessage } from "./misc/mapFeilmelding";
import { RegisterHookFormProps } from "./misc/reacthookProps";

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

type SelectInnerComponentProps = ComponentProps<typeof Nav.Select> & RegisterHookFormProps;

const SelectInnerComponent = forwardRef<HTMLSelectElement, SelectInnerComponentProps>(
  ({ ...props }: SelectInnerComponentProps, _ref: any) => {
    return <Nav.Select {...props} children={props.children} />;
  }
);

const Select = forwardRef<HTMLSelectElement, SelectComponentProps & UseControllerProps>(
  (
    {
      name,
      readOnly,
      control,
      label,
      emptyFieldDisabled,
      onChange,
      children,
      className,
      size,
      ...rest
    }: SelectComponentProps & UseControllerProps,
    _ref: any
  ) => {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, formState }) => (
          <SelectInnerComponent
            {...field}
            {...rest}
            readOnly={readOnly}
            label={label}
            onChange={(event: any) => {
              field.onChange(event);
              if (onChange) onChange(event?.target?.value);
            }}
            error={getErrorMessage(field, formState)}
            size={size}
            className={className ?? ""}
          >
            <option disabled={emptyFieldDisabled} value="">
              Velg...
            </option>
            {children}
          </SelectInnerComponent>
        )}
      />
    );
  }
);

export default Select;
