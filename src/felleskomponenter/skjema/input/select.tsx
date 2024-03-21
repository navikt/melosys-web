import { ChangeEventHandler } from "react";
import { Field, WrappedFieldProps } from "redux-form";
import * as Nav from "../../../navFrontend";
import * as SkjemaUtils from "../utils";
import * as Utils from "../../../utils";

import "../skjema.css";

interface SelectWrappedComponentBaseProps extends Nav.SelectProps {
  emptyFieldDisabled?: boolean;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
}

type SelectWrappedComponentProps = SelectWrappedComponentBaseProps & WrappedFieldProps;

function SelectWrappedComponent({
  input,
  label,
  children = (
    <option disabled value="0">
      ingen valg tilgjengelig
    </option>
  ),
  meta,
  emptyFieldDisabled = true,
  onChange,
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
    <Nav.Select label={label} feil={feil} id={inputProps.id ?? Utils._uuid()} {...inputProps}>
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
