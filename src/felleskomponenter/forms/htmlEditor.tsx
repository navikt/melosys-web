import React, { ReactNode } from "react";
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
};

type InnerHtmlEditorComponentProps = HtmlEditorComponentProps & RegisterHookFormProps;

const InnerHTMLEditorComponent = React.forwardRef<HTMLEditorProps, InnerHtmlEditorComponentProps>(
  ({ spellcheck = true, ...rest }: InnerHtmlEditorComponentProps, _ref: any) => {
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
  }
);

type HTMLEditorProps = HtmlEditorComponentProps & UseControllerProps;

const HTMLEditor = React.forwardRef<HTMLEditorProps, HTMLEditorProps>(
  ({ name, control, ...rest }: HTMLEditorProps, _ref: any) => {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, formState }) => (
          <InnerHTMLEditorComponent {...field} {...rest} feil={getErrorMessage(field, formState)} />
        )}
      />
    );
  }
);

export default HTMLEditor;
