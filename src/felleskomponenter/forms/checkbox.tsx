import { Controller, UseControllerProps } from "react-hook-form";
import { forwardRef } from "react";

import * as Nav from "../../navFrontend";

import { RegisterHookFormProps } from "./misc/reacthookProps";
import { getErrorMessage } from "./misc/mapFeilmelding";
import { _uuid } from "../../utils";

interface CheckboxComponentProps {
  className?: string;
  value?: string;
  label?: string;
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

type CheckboxProps = CheckboxComponentProps & UseControllerProps;

const Checkbox = forwardRef<HTMLSelectElement, CheckboxProps>(
  ({ name, control, checked, ...rest }: CheckboxProps, _ref: any) => {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, formState }) => (
          <InnerCheckboxComponent
            {...field}
            {...rest}
            checked={checked !== undefined ? checked : field.value}
            onChange={(event: any) => {
              field.onChange(event);
              if (rest.onChange) rest.onChange(event?.target?.value);
            }}
            feil={getErrorMessage(field, formState)}
          />
        )}
      />
    );
  },
);

export default Checkbox;
