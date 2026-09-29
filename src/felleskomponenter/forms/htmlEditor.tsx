import { Controller, FieldValues } from "react-hook-form";
import HtmlEditor from "../htmlEditor";
import { getErrorMessage } from "./misc/mapFeilmelding";
import { ReactHookFormControllerProps } from "./misc/reacthookProps";

interface HtmlEditorProps<TFieldValues extends FieldValues = FieldValues>
  extends ReactHookFormControllerProps<TFieldValues> {
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  label?: React.ReactNode;
  onChange?: (value: string) => void;
}

const HTMLEditor = <TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  className,
  onChange,
  disabled,
  ...rest
}: HtmlEditorProps<TFieldValues>) => (
  <Controller<TFieldValues>
    name={name}
    control={control}
    render={({ field, formState }) => (
      <HtmlEditor
        {...field}
        className={className}
        onChange={(value: string) => {
          field.onChange(value);
          if (onChange) onChange(value);
        }}
        feil={getErrorMessage(field, formState)}
        disabled={disabled}
        {...rest}
      />
    )}
  />
);

export default HTMLEditor;
