import { ExpandIcon, ShrinkIcon } from "@navikt/aksel-icons";
import { Label } from "@navikt/ds-react";
import classNames from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER } from "../../featuretoggle/toggleNavn";
import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import * as Nav from "../../navFrontend";
import { PlaceholderVerdi } from "../../services/modules/placeholdere";
import "./htmlEditor.less";
import {
  EDITOR_FORMATS,
  fjernUgyldigeUtfylteMarkeringer,
  forberedTekstblokkHtml,
  markerUerstattedeOmrader,
  PLACEHOLDER_FORMATS,
} from "./placeholderMarkering";
import TekstblokkSoek from "./tekstblokkSoek";

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
  // Vis brevmaler i tekstblokk-søket. Settes kun fra Send brev (sidemenyen);
  // i saksflytene viser vi kun tekstblokker.
  visBrevmaler?: boolean;
  // Skru av innsetting av tekstblokker. Brukes i admin-modalen, der man redigerer selve
  // tekstblokken/brevmalen – innsetting ville laget en frossen kopi av en annen blokk.
  visTekstblokkSoek?: boolean;
  // Lar brukeren utvide editoren forbi A4-bredden. Kun relevant der det er plass til
  // det, altså i Send brev.
  visBreddeToggle?: boolean;
  // Verdier som erstatter {nokkel} ved innsetting av tekstblokk. Settes kun fra
  // Send brev når dynamisk placeholder-togglen er på.
  placeholderVerdier?: PlaceholderVerdi[];
}

const BREDDE_LAGRINGSNOKKEL = "melosys.htmlEditor.fullBredde";

// Speiler max-width på .editor-wrapper i htmlEditor.less. Brukes til å avgjøre om
// A4-grensen i det hele tatt gjør editoren smalere enn plassen den har.
const BREVBREDDE_PX = 210 * (96 / 25.4) - 7 * 16;

const lesLagretFullBredde = (): boolean => {
  try {
    return window.localStorage.getItem(BREDDE_LAGRINGSNOKKEL) === "true";
  } catch {
    return false;
  }
};

const lagreFullBredde = (fullBredde: boolean) => {
  try {
    window.localStorage.setItem(BREDDE_LAGRINGSNOKKEL, String(fullBredde));
  } catch {
    /* Privat modus e.l. – valget gjelder da kun for denne økten. */
  }
};

// Hjelpefunksjoner for å pakke inn/ut innhold med ql-fritekst div
const wrapWithHtmlEditorDiv = (content: string): string => {
  if (content.trim().startsWith('<div class="ql-fritekst">') && content.trim().endsWith("</div>")) {
    return content;
  }

  if (content.trim() === "" || content.trim() === "<p><br></p>") return "";

  return `<div class="ql-fritekst">${content}</div>`;
};

const unwrapHtmlEditorDiv = (content: string): string => {
  // Enkel regex for å fjerne wrapper div
  const regex = /^<div class="ql-fritekst">([\s\S]*)<\/div>$/;
  const match = content.trim().match(regex);
  return match ? match[1] : content;
};

function HtmlEditor({
  value,
  onChange,
  disabled,
  label,
  feil,
  className,
  placeholder,
  visBrevmaler,
  visTekstblokkSoek = true,
  visBreddeToggle = false,
  placeholderVerdier,
}: TekstEditorProps) {
  const [fullBredde, setFullBredde] = useState(lesLagretFullBredde);
  // Knappen har ingen hensikt der editoren uansett er smalere enn brevbredden.
  const [harPlassTilUtvidelse, setHarPlassTilUtvidelse] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<ReactQuill>(null);
  // Referanse for å spore om formatering pågår, for å unngå uendelig rekursjon
  const isFormattingRef = useRef(false);
  // Intern state for å forhindre sirkulære oppdateringer
  const [internalValue, setInternalValue] = useState<string>(() => unwrapHtmlEditorDiv(value));
  // Holder styr på om oppdateringen kommer fra foreldrekomponenten
  const isExternalUpdateRef = useRef(false);
  // Siste kjente cursor-posisjon – brukes ved innsetting fra TekstblokkSoek
  const lastSelectionRef = useRef<{ index: number; length: number } | null>(null);
  const dynamiskPlaceholderPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER);
  // Quill-handleren lever på tvers av rendringer, så den leser toggle og verdier via refs
  // for å få med seg at de lander etterpå.
  const dynamiskPlaceholderPaaRef = useRef(dynamiskPlaceholderPaa);
  const placeholderVerdierRef = useRef(placeholderVerdier);

  useEffect(() => {
    dynamiskPlaceholderPaaRef.current = dynamiskPlaceholderPaa;
    placeholderVerdierRef.current = placeholderVerdier;
  });

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

  // Tillatte formater. Placeholder-formatene må følge togglen, ellers beholder innlimt og
  // lagret innhold markeringene selv om togglen skrus av.
  const formats = useMemo(
    () => (dynamiskPlaceholderPaa ? [...EDITOR_FORMATS, ...PLACEHOLDER_FORMATS] : EDITOR_FORMATS),
    [dynamiskPlaceholderPaa],
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

  // Togglen bytter formats og dermed Quill-instansen (se key på ReactQuill), så handlerne
  // må kobles opp på nytt når den lander.
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
        /* eslint-disable-next-line no-console */
        console.error("Feil ved oppsett av clipboard-matchers:", error);
      }
    }

    // Håndterer tekst i klammer og uerstattede placeholdere
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

        if (dynamiskPlaceholderPaaRef.current) {
          fjernUgyldigeUtfylteMarkeringer(quill, placeholderVerdierRef.current);
          markerUerstattedeOmrader(quill);
        }
      } finally {
        isFormattingRef.current = false;
      }
    };

    quill.on("text-change", textChangeHandler);

    // Lagre siste cursor-posisjon og marker hele [PLACEHOLDER] når cursor plasseres inni
    const selectionChangeHandler = (range: any, _oldRange: any, source: string) => {
      if (!range) return;

      const forrigeMarkering = lastSelectionRef.current;
      lastSelectionRef.current = { index: range.index, length: range.length };

      if (range.length !== 0 || source !== "user") return;

      const text = quill.getText();
      const bracketRegex = /\[(.*?)\]/g;

      let matchResult: RegExpExecArray | null = bracketRegex.exec(text);
      while (matchResult !== null) {
        const { index: start } = matchResult;
        const { length } = matchResult[0];

        if (range.index > start && range.index < start + length) {
          // Marker bare når brukeren kommer utenfra. Sto markøren allerede fritt inni
          // placeholderen, har brukeren bevisst gått inn i den og skal kunne skrive og
          // navigere uten at alt markeres på nytt ved hvert tastetrykk.
          const heleVarMarkert = forrigeMarkering?.index === start && forrigeMarkering.length === length;
          const stodFrittInni =
            forrigeMarkering != null && forrigeMarkering.index > start && forrigeMarkering.index < start + length;
          if (heleVarMarkert || stodFrittInni) return;

          // "silent" undertrykker selection-change, så vi må speile markeringen i
          // lastSelectionRef selv. Ellers tror handleSettInnTekstblokk at ingenting er
          // markert, og limer tekstblokken inn midt i placeholderen i stedet for å
          // erstatte den.
          lastSelectionRef.current = { index: start, length };
          quill.setSelection(start, length, "silent");
          return;
        }

        matchResult = bracketRegex.exec(text);
      }
    };

    quill.on("selection-change", selectionChangeHandler);

    // Initialiserer formatering for eksisterende innhold
    textChangeHandler();

    // Rydder opp ved avmontering
    return () => {
      quill.off("text-change", textChangeHandler);
      quill.off("selection-change", selectionChangeHandler);
    };
  }, [dynamiskPlaceholderPaa]);

  useEffect(() => {
    const container = containerRef.current;
    if (!visBreddeToggle || !container) return undefined;

    const oppdater = () => setHarPlassTilUtvidelse(container.clientWidth > BREVBREDDE_PX);
    oppdater();

    const observer = new ResizeObserver(oppdater);
    observer.observe(container);
    return () => observer.disconnect();
  }, [visBreddeToggle]);

  const handleSettInnTekstblokk = (html: string) => {
    const quill = quillRef.current?.editor;
    if (!quill) return;

    const fallbackIndeks = Math.max(0, quill.getLength() - 1);
    const range = lastSelectionRef.current ?? { index: fallbackIndeks, length: 0 };
    let innsettingsindeks = Math.min(range.index, fallbackIndeks);

    if (range.length > 0) {
      quill.deleteText(innsettingsindeks, range.length, "user");
    }

    // Sørg for at innsettingen havner i en ny blokk
    const tegnFoer = innsettingsindeks > 0 ? quill.getText(innsettingsindeks - 1, 1) : "\n";
    if (tegnFoer !== "\n") {
      quill.insertText(innsettingsindeks, "\n", "user");
      innsettingsindeks += 1;
    }

    const lengdeFor = quill.getLength();
    quill.clipboard.dangerouslyPasteHTML(innsettingsindeks, forberedTekstblokkHtml(html, placeholderVerdier), "user");
    const innsatt = quill.getLength() - lengdeFor;

    const nyIndeks = Math.max(0, Math.min(innsettingsindeks + innsatt, quill.getLength() - 1));
    // "silent" emitter ingen selection-change, så refen må speiles her også. Ellers peker
    // den fortsatt på forrige markering, og neste innsetting havner foran denne.
    lastSelectionRef.current = { index: nyIndeks, length: 0 };
    quill.setSelection(nyIndeks, 0, "silent");
    quill.focus();
  };

  return (
    <div className={classNames("htmlEditor", className)} ref={containerRef}>
      {label && (
        <Label as="div" size="small" className="editor_label">
          {label}
        </Label>
      )}
      {visTekstblokkSoek && (
        <TekstblokkSoek
          onVelg={handleSettInnTekstblokk}
          disabled={disabled}
          visBrevmaler={visBrevmaler}
          placeholderVerdier={placeholderVerdier}
        />
      )}
      <div
        className={classNames("editor-wrapper", {
          "editor-wrapper--disabled": disabled,
          "editor-wrapper--error": !!feil,
          "editor-wrapper--fullbredde": fullBredde,
        })}
      >
        {visBreddeToggle && harPlassTilUtvidelse && !disabled && (
          <Nav.Button
            className="editor-breddeknapp"
            variant="tertiary-neutral"
            size="xsmall"
            type="button"
            icon={fullBredde ? <ShrinkIcon aria-hidden /> : <ExpandIcon aria-hidden />}
            title={fullBredde ? "Vis editoren i brevbredde" : "Utvid editoren til full bredde"}
            onClick={() => {
              setFullBredde(!fullBredde);
              lagreFullBredde(!fullBredde);
            }}
          />
        )}
        <ReactQuill
          // ReactQuill bygger editoren på nytt når formats endres, men beholder da React-
          // instansen – og våre handlere ville blitt hengende på den forkastede Quill-en.
          // Med key monteres alt på nytt, og effekten over kobler seg til den nye editoren.
          key={String(dynamiskPlaceholderPaa)}
          ref={quillRef}
          theme="snow"
          value={internalValue}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          readOnly={disabled}
          placeholder={placeholder}
          // getSemanticHTML() ville gjort punktlister om fra <ol data-list="bullet"> til
          // <ul>, men sanitizeren i melosys-api og listestylingen i dokgen krever data-list.
          useSemanticHTML={false}
        />
      </div>
      {feil && (
        // TODO Bruk av ExclamationmarkTriangleFillIcon from "@navikt/aksel-icons" ser ikke bra ut her, trolig pga
        //  versjonsforskjell på komponentene fra @navikt/ds-react og vår aksel-icons versjon.
        // Aligning av versjoner kan løse dette, men bør testes som en egen sak. I mellomtiden brukes inline SVG som er
        // lik ExclamationmarkTriangleFillIcon fra vår versjon av @navikt/ds-react her
        <div className="navds-form-field__error" aria-relevant="additions removals" aria-live="polite">
          <p className="navds-error-message navds-label navds-label--small navds-error-message--show-icon">
            <svg
              viewBox="0 0 17 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              focusable={false}
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.49209 11.534L8.11398 2.7594C8.48895 2.04752 9.50833 2.04743 9.88343 2.75924L14.5073 11.5339C14.8582 12.1998 14.3753 13 13.6226 13H4.37685C3.6242 13 3.14132 12.1999 3.49209 11.534ZM9.74855 10.495C9.74855 10.9092 9.41276 11.245 8.99855 11.245C8.58433 11.245 8.24855 10.9092 8.24855 10.495C8.24855 10.0808 8.58433 9.74497 8.99855 9.74497C9.41276 9.74497 9.74855 10.0808 9.74855 10.495ZM9.49988 5.49997C9.49988 5.22383 9.27602 4.99997 8.99988 4.99997C8.72373 4.99997 8.49988 5.22383 8.49988 5.49997V7.99997C8.49988 8.27611 8.72373 8.49997 8.99988 8.49997C9.27602 8.49997 9.49988 8.27611 9.49988 7.99997V5.49997Z"
                fill="currentColor"
              />
            </svg>
            {typeof feil === "string" ? feil : feil.melding}
          </p>
        </div>
      )}
    </div>
  );
}

export default HtmlEditor;
