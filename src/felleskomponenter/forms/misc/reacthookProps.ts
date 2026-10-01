import type { FieldValues, UseControllerProps } from "react-hook-form";

export interface RegisterHookFormProps {
  onChange: any;
  onBlur: any;
  ref: any;
  name: any;
  value?: any;
}

export type ReactHookFormControllerProps<TFieldValues extends FieldValues = FieldValues> =
  UseControllerProps<TFieldValues>;
