import { Field, WrappedFieldProps } from "redux-form";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import HtmlEditor from "../../htmlEditor";

type InnerHtmlEditorComponentProps = {
  [x: string]: any;
};

function InnerHTMLEditorComponent({
  input,
  spellcheck = true,
  ...rest
}: InnerHtmlEditorComponentProps & WrappedFieldProps) {
  const inputProps = {
    ...input,
    ...rest,
  };

  const feil = rest?.meta?.touched ? rest?.meta?.error : undefined;

  return (
    <div className="editor_content" {...inputProps}>
      <HtmlEditor
        value={input.value}
        onChange={input.onChange}
        placeholder={rest.placeholder || ""}
        readOnly={rest?.disabled}
        spellCheck={spellcheck}
        label={rest?.label}
        feil={feil}
        disabled={rest?.disabled}
      />
    </div>
  );
}

interface HtmleditorProps extends InnerHtmlEditorComponentProps {
  feltNavn: string;
  className?: string;
}

function HTMLEditor({ feltNavn, className = "", ...rest }: HtmleditorProps) {
  return <Field name={feltNavn} className={className} component={InnerHTMLEditorComponent} props={rest} />;
}

export default HTMLEditor;
