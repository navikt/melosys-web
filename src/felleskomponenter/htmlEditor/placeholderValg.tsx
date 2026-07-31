import { RefObject, useEffect, useState } from "react";
import ReactQuill, { Quill } from "react-quill-new";

import { parseValgAlternativer, parseValgToken } from "../../services/modules/placeholdere";
import PlaceholderValgPopover from "./placeholderValgPopover";

interface Markering {
  index: number;
  length: number;
}

export interface ValgTreff {
  span: HTMLElement;
  alternativer: string[];
  // Satt når treffet er et allerede innsatt valg (omvalg).
  valgt?: string;
  index: number;
  length: number;
}

// Finner valgtokenet eller det innsatte valget en klikket node ligger inni. Alternativene
// leses fra klammeteksten for uvalgte tokener og fra data-valg for innsatte valg.
export const finnValgTreff = (quill: Quill, node: EventTarget | Node | null): ValgTreff | null => {
  const span =
    node instanceof Element ? node.closest<HTMLElement>("span.placeholder-valg, span.placeholder-valgt") : null;
  if (!span || !quill.root.contains(span)) return null;

  const erValgt = span.classList.contains("placeholder-valgt");
  const tekst = span.textContent ?? "";
  const alternativer = erValgt
    ? parseValgAlternativer(span.getAttribute("data-valg") ?? "")
    : (parseValgToken(tekst)?.alternativer ?? []);
  if (alternativer.length === 0) return null;

  const blot = Quill.find(span);
  if (!blot || blot instanceof Quill) return null;

  return {
    span,
    alternativer,
    valgt: erValgt ? tekst : undefined,
    index: quill.getIndex(blot),
    length: blot.length(),
  };
};

// Bytter tokenet (eller det forrige valget) mot valgt alternativ i én Delta, slik at angre
// tar hele valget under ett. Formatet settes eksplisitt i inserten så det ikke arves fra naboen.
export const settInnValg = (
  quill: Quill,
  treff: ValgTreff,
  alternativ: string,
  sisteMarkering: RefObject<Markering | null>,
) => {
  const Delta = Quill.import("delta");
  quill.updateContents(
    new Delta()
      .retain(treff.index)
      .delete(treff.length)
      .insert(alternativ, { "placeholder-valgt": treff.alternativer.join("|") }),
    "user",
  );

  const nyIndeks = treff.index + alternativ.length;
  // "silent" emitter ingen selection-change, så refen må speiles her (som ellers i editoren).
  sisteMarkering.current = { index: nyIndeks, length: 0 };
  quill.setSelection(nyIndeks, 0, "silent");
  quill.focus();
};

interface ValgArgs {
  quillRef: RefObject<ReactQuill | null>;
  sisteMarkering: RefObject<Markering | null>;
  aktiv: boolean;
  // Skifter når ReactQuill remonteres, så klikk-lytteren følger den nye Quill-instansen.
  editorNokkel: string;
}

// Klikk på en valgmarkering åpner popoveren med alternativene. Delegeringen ligger på
// quill.root og bruker "click", som fyrer etter Quills egen mouseup-håndtering.
export const usePlaceholderValg = ({ quillRef, sisteMarkering, aktiv, editorNokkel }: ValgArgs) => {
  const [treff, setTreff] = useState<ValgTreff | null>(null);

  useEffect(() => {
    const quill = quillRef.current?.editor;
    if (!quill || !aktiv) return undefined;

    const handterKlikk = (event: MouseEvent) => {
      const nyttTreff = finnValgTreff(quill, event.target);
      if (!nyttTreff) return;
      // Hele tokenet markeres, så en innsatt tekstblokk erstatter det i stedet for å havne inni.
      sisteMarkering.current = { index: nyttTreff.index, length: nyttTreff.length };
      quill.setSelection(nyttTreff.index, nyttTreff.length, "silent");
      setTreff(nyttTreff);
    };

    quill.root.addEventListener("click", handterKlikk);
    return () => quill.root.removeEventListener("click", handterKlikk);
  }, [aktiv, editorNokkel, quillRef, sisteMarkering]);

  const velg = (alternativ: string) => {
    const quill = quillRef.current?.editor;
    // Indeksene hentes på nytt: teksten kan ha endret seg mens popoveren sto åpen.
    const ferskt = quill && treff ? finnValgTreff(quill, treff.span) : null;
    if (quill && ferskt) settInnValg(quill, ferskt, alternativ, sisteMarkering);
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
        onVelg={velg}
        onLukk={() => setTreff(null)}
      />
    ) : null,
  };
};
