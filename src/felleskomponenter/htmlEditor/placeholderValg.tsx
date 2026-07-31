import { RefObject, useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill-new";

import { parseValgAlternativer, parseValgToken, PlaceholderVerdi } from "../../services/modules/placeholdere";
import PlaceholderValgPopover from "./placeholderValgPopover";

interface Markering {
  index: number;
  length: number;
}

interface TreffPosisjon {
  span: HTMLElement;
  index: number;
  length: number;
}

// Valgtoken/innsatt valg og utfylt verdi deler klikk-mekanikk og popover, men henter
// alternativene ulikt: fra klammeteksten eller data-valg, mot kandidatene på verdien.
// «alternativer» er kandidatlisten for utfylte verdier, og kan være tom.
type TreffInnhold =
  | { type: "valg"; alternativer: string[]; valgt?: string }
  | { type: "utfylt"; nokkel: string; alternativer: string[]; valgt: string };

export type PlaceholderTreff = TreffPosisjon & TreffInnhold;

const TREFF_VELGER = "span.placeholder-valg, span.placeholder-valgt, span.placeholder-utfylt[data-placeholder]";

const tolkSpan = (span: HTMLElement, tekst: string, verdier?: PlaceholderVerdi[]): TreffInnhold | null => {
  const nokkel = span.getAttribute("data-placeholder");
  if (span.classList.contains("placeholder-utfylt") && nokkel !== null) {
    const kandidater = verdier?.find((verdi) => verdi.nokkel === nokkel)?.kandidater ?? [];
    return { type: "utfylt", nokkel, alternativer: kandidater, valgt: tekst };
  }

  const erValgt = span.classList.contains("placeholder-valgt");
  const alternativer = erValgt
    ? parseValgAlternativer(span.getAttribute("data-valg") ?? "")
    : (parseValgToken(tekst)?.alternativer ?? []);
  // Et valgtoken uten gyldige alternativer har ingenting å tilby.
  if (alternativer.length === 0) return null;
  return { type: "valg", alternativer, valgt: erValgt ? tekst : undefined };
};

// Finner markeringen en klikket node ligger inni: valgtokenet, det innsatte valget eller
// den utfylte verdien.
export const finnPlaceholderTreff = (
  quill: Quill,
  node: EventTarget | Node | null,
  verdier?: PlaceholderVerdi[],
): PlaceholderTreff | null => {
  const span = node instanceof Element ? node.closest<HTMLElement>(TREFF_VELGER) : null;
  if (!span || !quill.root.contains(span)) return null;

  const tolket = tolkSpan(span, span.textContent ?? "", verdier);
  if (!tolket) return null;

  const blot = Quill.find(span);
  if (!blot || blot instanceof Quill) return null;

  return { ...tolket, span, index: quill.getIndex(blot), length: blot.length() };
};

// Et kandidatbytte beholder placeholder-nøkkelen, mens et valg bærer alternativlisten
// videre i data-valg så neste klikk kan åpne samme valg igjen.
const formatFor = (treff: PlaceholderTreff): Record<string, string> =>
  treff.type === "utfylt"
    ? { "placeholder-utfylt": treff.nokkel }
    : { "placeholder-valgt": treff.alternativer.join("|") };

// Flytter markøren bak det som nettopp ble endret. "silent" emitter ingen selection-change,
// så refen må speiles her (som ellers i editoren).
const speilMarkering = (quill: Quill, indeks: number, sisteMarkering: RefObject<Markering | null>) => {
  sisteMarkering.current = { index: indeks, length: 0 };
  quill.setSelection(indeks, 0, "silent");
  quill.focus();
};

// Bytter tokenet (eller den forrige verdien) mot valgt alternativ i én Delta, slik at angre
// tar hele valget under ett. Formatet settes eksplisitt i inserten så det ikke arves fra naboen.
export const settInnValg = (
  quill: Quill,
  treff: PlaceholderTreff,
  alternativ: string,
  sisteMarkering: RefObject<Markering | null>,
) => {
  const Delta = Quill.import("delta");
  quill.updateContents(
    new Delta().retain(treff.index).delete(treff.length).insert(alternativ, formatFor(treff)),
    "user",
  );

  speilMarkering(quill, treff.index + alternativ.length, sisteMarkering);
};

// «Gjør om til vanlig tekst»: den eksplisitte varianten av rediger-er-overstyr. Kun
// markeringen fjernes – teksten står igjen som den er.
export const gjorOmTilVanligTekst = (
  quill: Quill,
  treff: PlaceholderTreff,
  sisteMarkering: RefObject<Markering | null>,
) => {
  quill.formatText(treff.index, treff.length, "placeholder-utfylt", false, "user");
  speilMarkering(quill, treff.index + treff.length, sisteMarkering);
};

interface ValgArgs {
  quillRef: RefObject<ReactQuill | null>;
  sisteMarkering: RefObject<Markering | null>;
  aktiv: boolean;
  // Skifter når ReactQuill remonteres, så klikk-lytteren følger den nye Quill-instansen.
  editorNokkel: string;
  // Kandidatene henger på verdiene, så klikk-mekanikken trenger dem for utfylte verdier.
  placeholderVerdier?: PlaceholderVerdi[];
}

// Klikk på en placeholder-markering åpner popoveren. Delegeringen ligger på quill.root og
// bruker "click", som fyrer etter Quills egen mouseup-håndtering.
export const usePlaceholderValg = ({ quillRef, sisteMarkering, aktiv, editorNokkel, placeholderVerdier }: ValgArgs) => {
  const [treff, setTreff] = useState<PlaceholderTreff | null>(null);
  // Lytteren lever på tvers av rendringer; refen gir den verdiene som lander etterpå.
  const verdierRef = useRef(placeholderVerdier);
  useEffect(() => {
    verdierRef.current = placeholderVerdier;
  });

  useEffect(() => {
    const quill = quillRef.current?.editor;
    if (!quill || !aktiv) return undefined;

    const handterKlikk = (event: MouseEvent) => {
      const nyttTreff = finnPlaceholderTreff(quill, event.target, verdierRef.current);
      if (!nyttTreff) return;
      // Hele markeringen markeres, så en innsatt tekstblokk erstatter den i stedet for å havne inni.
      sisteMarkering.current = { index: nyttTreff.index, length: nyttTreff.length };
      quill.setSelection(nyttTreff.index, nyttTreff.length, "silent");
      setTreff(nyttTreff);
    };

    quill.root.addEventListener("click", handterKlikk);
    return () => quill.root.removeEventListener("click", handterKlikk);
  }, [aktiv, editorNokkel, quillRef, sisteMarkering]);

  // Indeksene hentes på nytt: teksten kan ha endret seg mens popoveren sto åpen.
  const paaFersktTreff = (handling: (quill: Quill, ferskt: PlaceholderTreff) => void) => {
    const quill = quillRef.current?.editor;
    const ferskt = quill && treff ? finnPlaceholderTreff(quill, treff.span, verdierRef.current) : null;
    if (quill && ferskt) handling(quill, ferskt);
    setTreff(null);
  };

  // Popoveren monteres først ved treff: den ligger i hver editor, og Aksel lar den ellers
  // stå igjen som skjult markup i alle skjemaene som bruker HtmlEditor.
  return {
    valgPopover: treff ? (
      <PlaceholderValgPopover
        anker={treff.span}
        alternativer={treff.alternativer}
        valgt={treff.valgt}
        nokkel={treff.type === "utfylt" ? treff.nokkel : undefined}
        onVelg={(alternativ) =>
          paaFersktTreff((quill, ferskt) => settInnValg(quill, ferskt, alternativ, sisteMarkering))
        }
        onGjorOmTilTekst={
          treff.type === "utfylt"
            ? () => paaFersktTreff((quill, ferskt) => gjorOmTilVanligTekst(quill, ferskt, sisteMarkering))
            : undefined
        }
        onLukk={() => setTreff(null)}
      />
    ) : null,
  };
};
