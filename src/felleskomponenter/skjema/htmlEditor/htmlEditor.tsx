import { Field, WrappedFieldProps } from "redux-form";
import HtmlEditor from "../../htmlEditor";

interface SkjemaHtmlEditorProps {
  feltNavn: string;
  className?: string;
  disabled?: boolean;
  label?: React.ReactNode;
  placeholder?: string;
  error?: string | undefined;
}

function SkjemaHtmlEditorComponent({
  input,
  meta,
  error,
  ...rest
}: WrappedFieldProps & Omit<SkjemaHtmlEditorProps, "feltNavn">) {
  const feil = error || (meta.touched ? meta.error : undefined);

  return (
    <HtmlEditor
      value={input.value}
      onChange={input.onChange}
      placeholder={rest.placeholder || ""}
      label={rest.label}
      feil={feil}
      disabled={rest.disabled}
      {...rest}
    />
  );
}

function SkjemaHtmlEditor({ feltNavn, className = "", ...rest }: SkjemaHtmlEditorProps) {
  return <Field name={feltNavn} className={className} component={SkjemaHtmlEditorComponent} props={rest} />;
}

export default SkjemaHtmlEditor;
