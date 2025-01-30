import { forwardRef } from "react";
import { Controller, UseControllerProps } from "react-hook-form";
import HtmlEditor from "../htmlEditor";
import { getErrorMessage } from "./misc/mapFeilmelding";

interface HtmlEditorProps extends UseControllerProps {
  spellCheck?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  label?: React.ReactNode;
  onChange?: (value: string) => void;
}

const HTMLEditor = forwardRef<HtmlEditorProps, HtmlEditorProps>(
  ({ name, control, className, onChange, disabled, ...rest }, _ref) => {
    return (
      <Controller
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
  },
);

export default HTMLEditor;
