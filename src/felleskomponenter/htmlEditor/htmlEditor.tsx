import classNames from "classnames";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import * as Nav from "../../navFrontend";
import "./htmlEditor.css";

interface TekstEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  feil?: string | { melding: string } | null;
  className?: string;
  placeholder?: string;
  spellCheck?: boolean;
}
// /src/felleskomponenter/htmlEditor/htmlEditor.tsx

const verktøylinje = {
  toolbar: [
    [{ header: [false, 1, 2] }],
    ["bold", "italic", "underline"],
    [{ color: ["#3E3832", "#BA3A26", "#06893A"] }],
    [{ align: ["", "center", "right", "justify"] }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

const formater = ["header", "bold", "italic", "underline", "color", "align", "indent", "list", "bullet"];

interface TekstEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  feil?: string | { melding: string } | null;
  className?: string;
  placeholder?: string;
}

function HtmlEditor({ value, onChange, disabled, label, feil, className }: TekstEditorProps) {
  return (
    <div className={classNames("htmlEditor", className)}>
      {label && (
        <Nav.BodyLong weight="semibold" size="small" className="editor_label">
          {label}
        </Nav.BodyLong>
      )}
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={verktøylinje}
        formats={formater}
        readOnly={disabled}
        className={classNames("editor-wrapper", {
          "editor-wrapper--disabled": disabled,
          "editor-wrapper--error": feil,
        })}
      />
      {feil && (
        <div role="alert" aria-live="assertive" className="feilmelding">
          {typeof feil === "string" ? feil : feil.melding}
        </div>
      )}
    </div>
  );
}

export default HtmlEditor;
