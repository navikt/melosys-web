import { RefObject, useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill-new";

import { parseValgAlternativer, parseValgToken, PlaceholderVerdi } from "../../services/modules/placeholdere";
import { PLACEHOLDER_FORMATS } from "./placeholderMarkering";
import PlaceholderValgPopover from "./placeholderValgPopover";

interface Markering {
  index: number;
  length: number;
}

export interface TreffPosisjon {
  span: HTMLElement;
  // Teksten treffet ble åpnet på. Brukes til å kjenne igjen markeringen etterpå.
  tekst: string;
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

// Blokkformatene hører til linjeskiftet, ikke tegnene, og skal aldri følge med en insert.
const BLOKKFORMATER = ["header", "list", "indent"];

const tolkSpan = (span: HTMLElement, tekst: string, verdier?: PlaceholderVerdi[]): TreffInnhold | null => {
  const nokkel = span.getAttribute("data-placeholder");
  if (span.classList.contains("placeholder-utfylt") && nokkel !== null) {
    const kjent = verdier?.find((verdi) => verdi.nokkel === nokkel);
    // Samme invariant som fjernUgyldigeUtfylteMarkeringer: avviker spanteksten fra den kjente
    // verdien, er markeringen redigert eller delt i to av en formatering, og et kandidatbytte
    // ville skrevet over feil tekstbit.
    if (kjent && tekst !== kjent.verdi && !kjent.kandidater?.includes(tekst)) return null;
    return { type: "utfylt", nokkel, alternativer: kjent?.kandidater ?? [], valgt: tekst };
  }

  const erValgt = span.classList.contains("placeholder-valgt");
  const alternativer = erValgt
    ? parseValgAlternativer(span.getAttribute("data-valg") ?? "")
    : (parseValgToken(tekst)?.alternativer ?? []);
  // Et valgtoken uten gyldige alternativer har ingenting å tilby.
  if (alternativer.length === 0) return null;
  return { type: "valg", alternativer, valgt: erValgt ? tekst : undefined };
};

const posisjonFor = (quill: Quill, span: HTMLElement): TreffPosisjon | null => {
  const blot = Quill.find(span);
  if (!blot || blot instanceof Quill) return null;
  return { span, tekst: span.textContent ?? "", index: quill.getIndex(blot), length: blot.length() };
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

  const posisjon = posisjonFor(quill, span);
  if (!posisjon) return null;

  const tolket = tolkSpan(span, posisjon.tekst, verdier);
  return tolket ? { ...tolket, ...posisjon } : null;
};

const erSammeMarkering = (treff: PlaceholderTreff, tolket: TreffInnhold): boolean =>
  treff.type === "utfylt" ? tolket.type === "utfylt" && tolket.nokkel === treff.nokkel : tolket.type === "valg";

// To like tokener i samme brev er ikke til å skille på tekst og markering alene. Den som ligger
// nærmest der treffet ble åpnet er den brukeren pekte på – den første i DOM-en kan være en annen.
export const naermestePosisjon = (kandidater: TreffPosisjon[], indeks: number): TreffPosisjon | null =>
  kandidater.reduce<TreffPosisjon | null>(
    (naermeste, kandidat) =>
      naermeste === null || Math.abs(kandidat.index - indeks) < Math.abs(naermeste.index - indeks)
        ? kandidat
        : naermeste,
    null,
  );

// Står den opprinnelige spanen igjen urørt, er det den brukeren pekte på. Identitet slår
// avstand: etter et større skift kan den foreldede indeksen ligge nærmest et likt token
// et helt annet sted i brevet. Delegerer til hovedstien så nye gyldighetsregler der
// aldri kan bli hengende igjen her.
const uendretSpan = (quill: Quill, treff: PlaceholderTreff, verdier?: PlaceholderVerdi[]): TreffPosisjon | null => {
  if (!treff.span.isConnected) return null;
  const gjenfunnet = finnPlaceholderTreff(quill, treff.span, verdier);
  if (gjenfunnet === null || gjenfunnet.span !== treff.span) return null;
  if (gjenfunnet.tekst !== treff.tekst || !erSammeMarkering(treff, gjenfunnet)) return null;
  return gjenfunnet;
};

// Popoveren kan ha stått åpen gjennom både redigering og remarkering, og remarkering bytter ut
// DOM-noden. Er spanen borte, godtas posisjonen så lenge teksten står urørt der treffet ble
// åpnet; ellers letes markeringen opp på nytt i DOM-en.
export const ferskPosisjon = (
  quill: Quill,
  treff: PlaceholderTreff,
  verdier?: PlaceholderVerdi[],
): TreffPosisjon | null => {
  const uendret = uendretSpan(quill, treff, verdier);
  if (uendret !== null) return uendret;

  if (quill.getText(treff.index, treff.length) === treff.tekst) return treff;

  const kandidater = Array.from(quill.root.querySelectorAll<HTMLElement>(TREFF_VELGER))
    .filter((span) => {
      if ((span.textContent ?? "") !== treff.tekst) return false;
      const tolket = tolkSpan(span, treff.tekst, verdier);
      return tolket !== null && erSammeMarkering(treff, tolket);
    })
    .map((span) => posisjonFor(quill, span))
    .filter((posisjon): posisjon is TreffPosisjon => posisjon !== null);

  return naermestePosisjon(kandidater, treff.index);
};

// Et kandidatbytte beholder placeholder-nøkkelen, mens et valg bærer alternativlisten
// videre i data-valg så neste klikk kan åpne samme valg igjen.
const formatFor = (treff: TreffInnhold): Record<string, string> =>
  treff.type === "utfylt"
    ? { "placeholder-utfylt": treff.nokkel }
    : { "placeholder-valgt": treff.alternativer.join("|") };

// Tokenet kan stå i fet eller kursiv tekst, og den formateringen hører til brevet – ikke til
// markeringen. Placeholder-formatene arves aldri; de settes eksplisitt av formatFor.
const bevarteFormater = (quill: Quill, treff: TreffPosisjon): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(quill.getFormat(treff.index, treff.length)).filter(
      ([navn]) => !PLACEHOLDER_FORMATS.includes(navn) && !BLOKKFORMATER.includes(navn),
    ),
  );

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
  const markeringsFormat = formatFor(treff);
  const format = { ...bevarteFormater(quill, treff), ...markeringsFormat };
  quill.updateContents(new Delta().retain(treff.index).delete(treff.length).insert(alternativ, format), "user");

  speilMarkering(quill, treff.index + alternativ.length, sisteMarkering);
  // Markøren står på bakkanten av markeringen: uten dette arver neste tastetrykk formatet, og
  // teksten havner inni spanen i stedet for etter den.
  Object.keys(markeringsFormat).forEach((navn) => quill.format(navn, false, "silent"));
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

// Tastaturveien har ingen klikket node: markeringen finnes via bloten under markøren. Kun
// valgtokener åpnes med Enter – inni en utfylt verdi skal Enter fortsatt gi linjeskift.
const treffVedMarkor = (quill: Quill, indeks: number, verdier?: PlaceholderVerdi[]): PlaceholderTreff | null => {
  const [blot] = quill.getLeaf(indeks);
  const node = blot?.domNode;
  const element = node instanceof Element ? node : (node?.parentElement ?? null);

  const treff = finnPlaceholderTreff(quill, element, verdier);
  if (!treff || treff.type !== "valg") return null;
  return indeks > treff.index && indeks < treff.index + treff.length ? treff : null;
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
// bruker "click", som fyrer etter Quills egen mouseup-håndtering. Enter inni et valgtoken
// gjør det samme for tastaturbrukere.
export const usePlaceholderValg = ({ quillRef, sisteMarkering, aktiv, editorNokkel, placeholderVerdier }: ValgArgs) => {
  const [treff, setTreff] = useState<PlaceholderTreff | null>(null);
  // Popoveren tar fokus kun når den ble åpnet fra tastaturet; ved klikk beholder editoren det.
  const [fokuserAlternativ, setFokuserAlternativ] = useState(false);
  // Lytteren lever på tvers av rendringer; refen gir den verdiene som lander etterpå.
  const verdierRef = useRef(placeholderVerdier);
  useEffect(() => {
    verdierRef.current = placeholderVerdier;
  });

  useEffect(() => {
    const quill = quillRef.current?.editor;
    if (!quill || !aktiv) return undefined;

    const aapne = (nyttTreff: PlaceholderTreff, fraTastatur: boolean) => {
      setFokuserAlternativ(fraTastatur);
      setTreff(nyttTreff);
    };

    const handterKlikk = (event: MouseEvent) => {
      const nyttTreff = finnPlaceholderTreff(quill, event.target, verdierRef.current);
      if (!nyttTreff) return;

      if (nyttTreff.type === "valg") {
        // Hele valget markeres, så en innsatt tekstblokk erstatter det i stedet for å havne inni.
        sisteMarkering.current = { index: nyttTreff.index, length: nyttTreff.length };
        quill.setSelection(nyttTreff.index, nyttTreff.length, "silent");
      } else {
        // En utfylt verdi skal kunne rettes der brukeren klikket, så Quills egen markørplassering
        // fra mouseup står – refen speiler den bare.
        const markering = quill.getSelection();
        if (markering) sisteMarkering.current = { index: markering.index, length: markering.length };
      }

      aapne(nyttTreff, false);
    };

    const handterEnter = (markering: Markering) => {
      const nyttTreff = treffVedMarkor(quill, markering.index, verdierRef.current);
      if (!nyttTreff) return true;
      aapne(nyttTreff, true);
      return false;
    };

    quill.root.addEventListener("click", handterKlikk);
    // Quills egen Enter-håndtering ligger allerede i listen og stopper kjeden, så bindingen
    // må ligge først for i det hele tatt å bli kalt.
    const enterBindinger = quill.keyboard.bindings.Enter;
    const binding = { key: "Enter", collapsed: true, handler: handterEnter };
    enterBindinger.unshift(binding);

    return () => {
      quill.root.removeEventListener("click", handterKlikk);
      enterBindinger.splice(enterBindinger.indexOf(binding), 1);
    };
  }, [aktiv, editorNokkel, quillRef, sisteMarkering]);

  // Posisjonen hentes på nytt: teksten kan ha endret seg mens popoveren sto åpen.
  const paaFersktTreff = (handling: (quill: Quill, ferskt: PlaceholderTreff) => void) => {
    const quill = quillRef.current?.editor;
    const posisjon = quill && treff ? ferskPosisjon(quill, treff, verdierRef.current) : null;
    if (quill && treff && posisjon) handling(quill, { ...treff, ...posisjon });
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
        fokuserAlternativ={fokuserAlternativ}
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
