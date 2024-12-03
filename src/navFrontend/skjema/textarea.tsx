import "./textarea.css";
import { Textarea as NavTextarea, TextareaProps } from "@navikt/ds-react";

function Textarea({ size = "small", ...rest }: TextareaProps) {
  return <NavTextarea {...rest} size={size} className="melosys-textarea" />;
}

export default Textarea;
