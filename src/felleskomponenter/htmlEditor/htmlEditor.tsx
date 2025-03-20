import classNames from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./htmlEditor.css";

// Registrerer egendefinert blot for tekst i klammer
const Inline = Quill.import("blots/inline") as any;

class BracketBlot extends Inline {
  static blotName = "bracketed";

  static tagName = "span";

  static create() {
    const node = super.create();
    node.classList.add("bracketed-text");
    return node;
  }

  static formats() {
    return true;
  }
}

Quill.register("formats/bracketed", BracketBlot);

interface DeltaOperation {
  insert?: any;
  delete?: number;
  retain?: number;
  attributes?: Record<string, any>;
}

interface TekstEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  feil?: string | { melding: string } | null;
  className?: string;
  placeholder?: string;
}

// Hjelpefunksjoner for å pakke inn/ut innhold med ql-fritekst div
const wrapWithHtmlEditorDiv = (content: string): string => {
  if (content.trim().startsWith('<div class="ql-fritekst">') && content.trim().endsWith("</div>")) {
    return content;
  }
  return `<div class="ql-fritekst">${content}</div>`;
};

const unwrapHtmlEditorDiv = (content: string): string => {
  // Enkel regex for å fjerne wrapper div
  const regex = /^<div class="ql-fritekst">([\s\S]*)<\/div>$/;
  const match = content.trim().match(regex);
  return match ? match[1] : content;
};

function HtmlEditor({ value, onChange, disabled, label, feil, className, placeholder }: TekstEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  // Referanse for å spore om formatering pågår, for å unngå uendelig rekursjon
  const isFormattingRef = useRef(false);
  // Intern state for å forhindre sirkulære oppdateringer
  const [internalValue, setInternalValue] = useState<string>(() => unwrapHtmlEditorDiv(value));
  // Holder styr på om oppdateringen kommer fra foreldrekomponenten
  const isExternalUpdateRef = useRef(false);

  // Synkroniserer med ekstern verdi når den endres, men bare hvis det ikke er forårsaket av vår egen onChange
  useEffect(() => {
    if (isExternalUpdateRef.current) {
      isExternalUpdateRef.current = false;
      return;
    }

    // Pakker ut verdien fra parent før den settes i editoren
    const unwrappedValue = unwrapHtmlEditorDiv(value);
    if (unwrappedValue !== internalValue) {
      setInternalValue(unwrappedValue);
    }
  }, [value, internalValue]);

  // Tillatte formater
  const formats = useMemo(
    () => ["header", "bold", "italic", "underline", "indent", "list", "table", "bracketed", "break"],
    [],
  );

  // Konfigurerer moduler
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [false, 2] }],
          ["bold", "italic", "underline"],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["clean"],
          ["undo", "redo"],
        ],
        handlers: {
          undo() {
            const editor = quillRef.current?.editor;
            if (editor && editor.history) {
              editor.history.undo();
            }
          },
          redo() {
            const editor = quillRef.current?.editor;
            if (editor && editor.history) {
              editor.history.redo();
            }
          },
        },
      },
      clipboard: {
        matchVisual: false,
      },
      history: {
        delay: 1000,
        maxStack: 500,
        userOnly: true,
      },
      table: true,
      keyboard: {
        bindings: {
          heading2: {
            key: 81, // 'q'
            ctrlKey: true,
            shiftKey: false,
            altKey: false,
            handler(range: any) {
              const quill = quillRef.current?.editor;
              if (quill && quill.getFormat && quill.formatLine) {
                const format = quill.getFormat(range);
                quill.formatLine(range.index, range.length, "header", format.header === 2 ? false : 2);
              }
              return false;
            },
          },
        },
      },
    }),
    [],
  );

  // Håndterer innholdsendringer
  const handleChange = (content: string) => {
    // Oppdaterer intern state med utpakket innhold
    setInternalValue(content);

    // Markerer at neste eksterne verdi-oppdatering skal ignoreres
    isExternalUpdateRef.current = true;

    // Sender innpakket innhold til foreldrekomponent
    const wrappedContent = wrapWithHtmlEditorDiv(content);
    onChange(wrappedContent);
  };

  useEffect(() => {
    const quill = quillRef.current?.editor;
    if (!quill) return undefined;

    // Konfigurerer clipboard-matcher for overskrifter
    if (quill.clipboard) {
      try {
        const Delta = Quill.import("delta");

        quill.clipboard.addMatcher(
          'h1, h3, h4, h5, h6, [role="heading"], [data-ccp-parastyle*="heading"], [data-ccp-parastyle*="Heading"], .MsoHeading',
          (_node: any, delta: any) => {
            const newDelta = new Delta();

            if (delta.ops) {
              delta.ops.forEach((op: DeltaOperation) => {
                if (op.insert && typeof op.insert === "string") {
                  newDelta.insert(op.insert, { ...op.attributes, header: 2 });
                } else if (op.insert) {
                  newDelta.insert(op.insert, op.attributes || {});
                }
              });
            }

            return newDelta;
          },
        );
      } catch (error) {
        console.error("Feil ved oppsett av clipboard-matchers:", error);
      }
    }

    // Håndterer tekst i klammer
    const textChangeHandler = () => {
      if (isFormattingRef.current) return;

      try {
        isFormattingRef.current = true;

        const text = quill.getText();
        const bracketRegex = /\[(.*?)\]/g;

        quill.formatText(0, text.length, "bracketed", false);

        let matchResult: RegExpExecArray | null = bracketRegex.exec(text);
        while (matchResult !== null) {
          const { index } = matchResult;
          const matchText = matchResult[0];
          quill.formatText(index, matchText.length, "bracketed", true);

          matchResult = bracketRegex.exec(text);
        }
      } finally {
        isFormattingRef.current = false;
      }
    };

    quill.on("text-change", textChangeHandler);

    // Initialiserer formatering for eksisterende innhold
    textChangeHandler();

    // Rydder opp ved avmontering
    return () => {
      quill.off("text-change", textChangeHandler);
    };
  }, []);

  return (
    <div className={classNames("htmlEditor", className)}>
      {label && <div className="editor_label">{label}</div>}
      <div
        className={classNames("editor-wrapper", {
          "editor-wrapper--disabled": disabled,
          "editor-wrapper--error": !!feil,
        })}
      >
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={internalValue}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          readOnly={disabled}
          placeholder={placeholder}
        />
      </div>
      {feil && <div className="feilmelding">{typeof feil === "string" ? feil : feil.melding}</div>}
    </div>
  );
}

export default HtmlEditor;
