import { Field, WrappedFieldProps } from "redux-form";
import HtmlEditor from "../../htmlEditor";

interface SkjemaHtmlEditorProps {
  feltNavn: string;
  className?: string;
  disabled?: boolean;
  label?: React.ReactNode;
  placeholder?: string;
  error?: string | undefined;
  // Når true: skjul meta.error (f.eks. før innsending når vi "gater" feil)
  suppressMetaError?: boolean;
  // Vis brevmaler i tekstblokk-søket (kun fra Send brev).
  visBrevmaler?: boolean;
  // Lar brukeren utvide editoren forbi A4-bredden (kun fra Send brev).
  visBreddeToggle?: boolean;
}

function SkjemaHtmlEditorComponent({
  input,
  meta,
  error,
  ...rest
}: WrappedFieldProps & Omit<SkjemaHtmlEditorProps, "feltNavn">) {
  const shouldShowMetaError = !rest.suppressMetaError && meta.touched;
  const feil = error || (shouldShowMetaError ? meta.error : undefined);

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
