import { ChangeEventHandler } from "react";
import { Field, WrappedFieldProps } from "redux-form";
import * as Nav from "../../../navFrontend";
import * as SkjemaUtils from "../utils";
import * as Utils from "../../../utils";

import "../skjema.css";

interface SelectWrappedComponentBaseProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size" | "multiple"> {
  emptyFieldDisabled?: boolean;
  label?: string | React.ReactElement;
  children?: React.ReactNode;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  size?: "small" | "medium";
  className?: string;
  hideLabel?: boolean;
  error?: React.ReactNode;
  readonly?: boolean;
  errorId?: string;
  htmlSize?: number;
  id?: string;
}

type SelectWrappedComponentProps = SelectWrappedComponentBaseProps & WrappedFieldProps;

function SelectWrappedComponent({
  input,
  label,
  children = (
    <option disabled value="">
      ingen valg tilgjengelig
    </option>
  ),
  meta,
  emptyFieldDisabled = true,
  onChange,
  size,
  className,
  readonly,
  errorId,
  htmlSize,
  ...rest
}: SelectWrappedComponentProps) {
  const { touched, active } = meta;
  const feil = touched && !active ? SkjemaUtils.mapReduxFormFeilTilNavFeil(meta) : undefined;

  const innerChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    if (onChange) onChange(e);
    input.onChange(e);
  };

  const inputProps = {
    ...input,
    ...rest,
    onChange: innerChange,
  };

  return (
    <Nav.Select
      label={label}
      error={feil}
      id={inputProps.id ?? Utils._uuid()}
      size={size}
      className={className ?? ""}
      readOnly={readonly !== undefined && readonly}
      errorId={errorId}
      htmlSize={htmlSize}
      {...inputProps}
    >
      <option disabled={emptyFieldDisabled} value="">
        Velg...
      </option>
      {children}
    </Nav.Select>
  );
}

interface SelectProps extends SelectWrappedComponentBaseProps {
  id?: string;
  className?: string;
  feltNavn: string;
}

function Select({ id, feltNavn, className, ...rest }: SelectProps) {
  return <Field name={feltNavn} className={className} id={id} component={SelectWrappedComponent} props={rest} />;
}

export { SelectWrappedComponent };
export default Select;
