import { Controller, FieldValues } from "react-hook-form";
import { ReactNode } from "react";

import * as Nav from "../../navFrontend";

import { ReactHookFormControllerProps, RegisterHookFormProps } from "./misc/reacthookProps";
import { getErrorMessage } from "./misc/mapFeilmelding";
import { _uuid } from "../../utils";

interface CheckboxComponentProps {
  className?: string;
  value?: string;
  label?: string | ReactNode;
  readOnly?: boolean;
  checked?: boolean;
  onChange?: (value: any) => void;
  feil?: any;
  size?: "small" | "medium" | undefined;
}

type CheckboxInnerComponentProps = CheckboxComponentProps & RegisterHookFormProps;

function InnerCheckboxComponent({ readOnly, ...rest }: CheckboxInnerComponentProps) {
  return (
    <Nav.Checkbox
      className={rest.className}
      onChange={rest.onChange}
      onBlur={rest.onBlur}
      value={rest.value}
      name={rest.name}
      error={rest.feil}
      checked={rest.checked}
      size={rest.size}
      readOnly={readOnly}
      id={_uuid()}
    >
      {rest.label}
    </Nav.Checkbox>
  );
}

type CheckboxProps<TFieldValues extends FieldValues = FieldValues> = CheckboxComponentProps &
  ReactHookFormControllerProps<TFieldValues>;

function Checkbox<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  checked,
  ...rest
}: CheckboxProps<TFieldValues>) {
  return (
    <Controller<TFieldValues>
      name={name}
      control={control}
      render={({ field, formState }) => (
        <InnerCheckboxComponent
          {...field}
          {...rest}
          checked={checked !== undefined ? checked : field.value}
          onChange={(event: any) => {
            field.onChange(event);
            if (rest.onChange) rest.onChange(event);
          }}
          feil={getErrorMessage(field, formState)}
        />
      )}
    />
  );
}

export default Checkbox;
