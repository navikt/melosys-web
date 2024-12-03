import { ReactNode, forwardRef } from "react";
import { Controller, UseControllerProps } from "react-hook-form";
import HtmlEditor from "../htmlEditor";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { RegisterHookFormProps } from "./misc/reacthookProps";
import { getErrorMessage } from "./misc/mapFeilmelding";

type HtmlEditorComponentProps = {
  spellcheck?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  label?: ReactNode;
  feil?: string;
  onChange?: any;
};

type InnerHtmlEditorComponentProps = HtmlEditorComponentProps & RegisterHookFormProps;

const InnerHTMLEditorComponent = ({ spellcheck = true, ...rest }: InnerHtmlEditorComponentProps) => {
  return (
    <div className={`${rest.className} editor_content`}>
      <HtmlEditor
        value={rest.value}
        onChange={rest.onChange}
        placeholder={rest.placeholder || ""}
        readOnly={rest?.disabled}
        spellCheck={spellcheck}
        label={rest?.label}
        feil={rest.feil}
        disabled={rest?.disabled}
      />
    </div>
  );
};

type HTMLEditorProps = HtmlEditorComponentProps & UseControllerProps;

const HTMLEditor = forwardRef<HTMLEditorProps, HTMLEditorProps>(
  ({ name, control, className, onChange, disabled }: HTMLEditorProps, _ref: any) => {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, formState }) => (
          <InnerHTMLEditorComponent
            {...field}
            className={className}
            onChange={(event: any) => {
              field.onChange(event);
              if (onChange) onChange(event);
            }}
            feil={getErrorMessage(field, formState)}
            disabled={disabled}
          />
        )}
      />
    );
  },
);

export default HTMLEditor;
