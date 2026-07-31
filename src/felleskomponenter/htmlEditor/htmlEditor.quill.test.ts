import { describe, expect, it } from "vitest";
import { Quill } from "react-quill-new";

// Importeres for sideeffekten: HtmlEditor registrerer BracketBlot, placeholderMarkering
// registrerer de to placeholder-blotene.
import "./htmlEditor";
import {
  EDITOR_FORMATS,
  fjernUgyldigeUtfylteMarkeringer,
  fjernUgyldigeValgteMarkeringer,
  forberedTekstblokkHtml,
  markerUerstattedeOmrader,
  PLACEHOLDER_FORMATS,
} from "./placeholderMarkering";
import { finnValgTreff, settInnValg } from "./placeholderValg";
import { PlaceholderVerdi } from "../../services/modules/placeholdere";

// Kjører en ekte Quill 2-instans med produksjonens formats-liste og blots, slik at vi
// fanger opp det ren regex-testing ikke ser: at Parchment beholder markeringene.
const lagEditor = (formats: string[] = [...EDITOR_FORMATS, ...PLACEHOLDER_FORMATS]) => {
  const node = document.createElement("div");
  document.body.appendChild(node);
  // userOnly speiler produksjonen: kun "user"-endringer havner på angrestakken.
  return new Quill(node, { formats, modules: { history: { userOnly: true } } });
};

const verdier: PlaceholderVerdi[] = [{ nokkel: "saksnummer", verdi: "2024/123456" }];

describe("HtmlEditor med ekte Quill", () => {
  it("beholder verdi og nøkkel når erstattet tekstblokk-HTML limes inn", () => {
    const quill = lagEditor();

    quill.clipboard.dangerouslyPasteHTML(0, forberedTekstblokkHtml("<p>Saken {saksnummer} er mottatt.</p>", verdier));

    expect(quill.root.innerHTML).toContain("2024/123456");
    expect(quill.root.innerHTML).toContain('data-placeholder="saksnummer"');
    expect(quill.getText()).not.toContain("{saksnummer}");
  });

  it("markerer uerstattet placeholder uten å røre klammemarkeringen", () => {
    const quill = lagEditor();
    quill.setText("Se [KLAMME] og {nokkel} her\n");
    quill.formatText(3, 8, "bracketed", true);

    markerUerstattedeOmrader(quill);

    expect(quill.root.innerHTML).toContain('<span class="bracketed-text">[KLAMME]</span>');
    expect(quill.root.querySelector(".placeholder-uerstattet")?.textContent).toBe("{nokkel}");
    expect(quill.getFormat(15, 8)).toEqual({ "placeholder-uerstattet": true });
    expect(quill.getFormat(3, 8)).toEqual({ bracketed: true });
  });

  it("lar {nokkel} med tom verdi bli stående og gulmarkerer den", () => {
    const quill = lagEditor();

    quill.clipboard.dangerouslyPasteHTML(
      0,
      forberedTekstblokkHtml("<p>Hei {navn}.</p>", [{ nokkel: "navn", verdi: "" }]),
    );
    markerUerstattedeOmrader(quill);

    expect(quill.getText()).toContain("{navn}");
    expect(quill.root.querySelector(".placeholder-uerstattet")?.textContent).toBe("{navn}");
  });

  it("markerer ukjent nøkkel rødt og gyldig nøkkel uten verdi gult", () => {
    const quill = lagEditor();
    quill.setText("{saksnummer} og {sksnummer}\n");

    markerUerstattedeOmrader(quill, ["saksnummer"]);

    expect(quill.root.querySelector(".placeholder-uerstattet")?.textContent).toBe("{saksnummer}");
    expect(quill.root.querySelector(".placeholder-ukjent")?.textContent).toBe("{sksnummer}");
    expect(quill.root.querySelector(".placeholder-ukjent")?.getAttribute("title")).toContain(
      "Ikke en gyldig placeholder",
    );
  });

  it("markerer alt gult uten kjente nøkler (katalogen ikke lastet)", () => {
    const quill = lagEditor();
    quill.setText("{sksnummer}\n");

    markerUerstattedeOmrader(quill);

    expect(quill.root.querySelector(".placeholder-ukjent")).toBeNull();
    expect(quill.root.querySelector(".placeholder-uerstattet")?.textContent).toBe("{sksnummer}");
  });

  it("bytter markering fra rød til gul når nøkkelen rettes opp", () => {
    const quill = lagEditor();
    quill.setText("{sksnummer}\n");
    markerUerstattedeOmrader(quill, ["saksnummer"]);
    expect(quill.root.querySelector(".placeholder-ukjent")).not.toBeNull();

    quill.insertText(2, "a");
    markerUerstattedeOmrader(quill, ["saksnummer"]);

    expect(quill.root.querySelector(".placeholder-ukjent")).toBeNull();
    expect(quill.root.querySelector(".placeholder-uerstattet")?.textContent).toBe("{saksnummer}");
  });

  it("fjerner rødmarkeringen når brukeren sletter klammene rundt nøkkelen", () => {
    const quill = lagEditor();
    quill.setText("{ab}\n");
    markerUerstattedeOmrader(quill, ["saksnummer"]);
    expect(quill.root.querySelector(".placeholder-ukjent")).not.toBeNull();

    quill.deleteText(3, 1);
    quill.deleteText(0, 1);
    markerUerstattedeOmrader(quill, ["saksnummer"]);

    expect(quill.root.querySelector(".placeholder-ukjent")).toBeNull();
  });

  it("markerer ikke over avsnittsgrenser når klammene står uparet på hver sin linje", () => {
    const quill = lagEditor();
    quill.setText("Et { her\nog et } der\n");

    markerUerstattedeOmrader(quill);

    expect(quill.root.innerHTML).not.toContain("placeholder-uerstattet");
  });

  it("fjerner gulmarkeringen når brukeren sletter klammene rundt nøkkelen", () => {
    const quill = lagEditor();
    quill.setText("{ab}\n");
    markerUerstattedeOmrader(quill);
    expect(quill.root.querySelector(".placeholder-uerstattet")).not.toBeNull();

    // Klammene slettes hver for seg, så teksten står igjen helt uten klammer.
    quill.deleteText(3, 1);
    quill.deleteText(0, 1);
    markerUerstattedeOmrader(quill);

    expect(quill.getText()).toContain("ab");
    expect(quill.root.querySelector(".placeholder-uerstattet")).toBeNull();
  });

  it("dropper markeringene i innlimt innhold når formats mangler placeholder-navnene", () => {
    const quill = lagEditor(EDITOR_FORMATS);

    quill.clipboard.dangerouslyPasteHTML(0, forberedTekstblokkHtml("<p>Saken {saksnummer} er mottatt.</p>", verdier));

    expect(quill.getText()).toContain("2024/123456");
    expect(quill.root.innerHTML).not.toContain("placeholder-utfylt");
    expect(quill.root.innerHTML).not.toContain("data-placeholder");
  });

  it("fjerner utfylt-markeringen når det skrives inni verdien", () => {
    const quill = lagEditor();
    quill.clipboard.dangerouslyPasteHTML(0, forberedTekstblokkHtml("<p>Saken {saksnummer} er mottatt.</p>", verdier));

    // "Saken " er 6 tegn, så indeks 10 ligger midt inne i den utfylte verdien.
    quill.insertText(10, "X");
    fjernUgyldigeUtfylteMarkeringer(quill, verdier);

    expect(quill.getText()).toContain("2024X/123456");
    expect(quill.root.querySelector(".placeholder-utfylt")).toBeNull();
  });

  it("lar en urørt utfylt verdi beholde markeringen", () => {
    const quill = lagEditor();
    quill.clipboard.dangerouslyPasteHTML(0, forberedTekstblokkHtml("<p>Saken {saksnummer} er mottatt.</p>", verdier));

    fjernUgyldigeUtfylteMarkeringer(quill, verdier);

    expect(quill.root.querySelector(".placeholder-utfylt")?.textContent).toBe("2024/123456");
  });

  it("rører ikke markeringene uten kjente verdier (andre editorer)", () => {
    const quill = lagEditor();
    quill.clipboard.dangerouslyPasteHTML(0, forberedTekstblokkHtml("<p>Saken {saksnummer} er mottatt.</p>", verdier));

    fjernUgyldigeUtfylteMarkeringer(quill, undefined);

    expect(quill.root.querySelector(".placeholder-utfylt")?.textContent).toBe("2024/123456");
  });

  it("nøster ikke markeringer når lagret innhold alt har markerings-spans", () => {
    const quill = lagEditor();

    quill.clipboard.dangerouslyPasteHTML(
      0,
      forberedTekstblokkHtml(
        '<p><span class="placeholder-uerstattet">{saksnummer}</span> og ' +
          '<span class="bracketed-text"><span class="bracketed-text">[dato]</span></span></p>',
        verdier,
      ),
    );
    markerUerstattedeOmrader(quill);

    expect(quill.root.querySelector(".placeholder-utfylt")?.textContent).toBe("2024/123456");
    expect(quill.root.querySelector(".placeholder-uerstattet")).toBeNull();
    expect(quill.getText()).toContain("[dato]");
  });
});

// Treffet finnes normalt fra et klikk-event; her hentes det direkte fra markeringen.
const valgTreffFor = (quill: Quill, velger: string) => {
  const treff = finnValgTreff(quill, quill.root.querySelector(velger));
  if (!treff) throw new Error(`Fant ingen valgtreff for ${velger}`);
  return treff;
};

const medValgtAlternativ = (tekst: string, alternativ: string) => {
  const quill = lagEditor();
  quill.setText(tekst);
  markerUerstattedeOmrader(quill);
  settInnValg(quill, valgTreffFor(quill, "span.placeholder-valg"), alternativ, { current: null });
  return quill;
};

describe("Valgmekanikk i Quill", () => {
  it("markerer valgtoken som valg og ikke som ukjent nøkkel", () => {
    const quill = lagEditor();
    quill.setText("Land: {velg:Serbia|Montenegro} og {sksnummer}\n");

    markerUerstattedeOmrader(quill, ["saksnummer"]);

    expect(quill.root.querySelector(".placeholder-valg")?.textContent).toBe("{velg:Serbia|Montenegro}");
    expect(quill.root.querySelector(".placeholder-valg")?.getAttribute("title")).toContain("Klikk for å velge");
    expect(quill.root.querySelector(".placeholder-ukjent")?.textContent).toBe("{sksnummer}");
  });

  it("markerer valgtoken med for få alternativer som vanlig nøkkel", () => {
    const quill = lagEditor();
    quill.setText("{velg:Bare denne}\n");

    markerUerstattedeOmrader(quill, ["saksnummer"]);

    expect(quill.root.querySelector(".placeholder-valg")).toBeNull();
    expect(quill.root.querySelector(".placeholder-ukjent")?.textContent).toBe("{velg:Bare denne}");
  });

  it("erstatter tokenet med valgt alternativ og tar vare på alternativlisten", () => {
    const quill = medValgtAlternativ("Land: {velg:Serbia|Montenegro}\n", "Montenegro");

    expect(quill.getText()).toBe("Land: Montenegro\n");
    const span = quill.root.querySelector("span.placeholder-valgt");
    expect(span?.textContent).toBe("Montenegro");
    expect(span?.getAttribute("data-valg")).toBe("Serbia|Montenegro");
    expect(span?.getAttribute("title")).toContain("Klikk for å endre");
  });

  it("speiler markeringen bak det innsatte valget", () => {
    const quill = lagEditor();
    quill.setText("Land: {velg:Serbia|Montenegro}\n");
    markerUerstattedeOmrader(quill);
    const sisteMarkering: { current: { index: number; length: number } | null } = { current: null };

    settInnValg(quill, valgTreffFor(quill, "span.placeholder-valg"), "Montenegro", sisteMarkering);

    expect(sisteMarkering.current).toEqual({ index: "Land: Montenegro".length, length: 0 });
  });

  it("legger hele valget på angrestakken i ett steg", () => {
    const quill = medValgtAlternativ("Land: {velg:Serbia|Montenegro}\n", "Montenegro");

    quill.history.undo();

    expect(quill.getText()).toBe("Land: {velg:Serbia|Montenegro}\n");
  });

  it("leser alternativene fra data-valg ved omvalg", () => {
    const quill = medValgtAlternativ("Land: {velg:Serbia|Montenegro}\n", "Montenegro");

    const omvalg = valgTreffFor(quill, "span.placeholder-valgt");
    expect(omvalg.alternativer).toEqual(["Serbia", "Montenegro"]);
    expect(omvalg.valgt).toBe("Montenegro");

    settInnValg(quill, omvalg, "Serbia", { current: null });

    expect(quill.getText()).toBe("Land: Serbia\n");
    expect(quill.root.querySelector("span.placeholder-valgt")?.getAttribute("data-valg")).toBe("Serbia|Montenegro");
  });

  it("beholder det innsatte valget når markeringene påføres på nytt", () => {
    const quill = medValgtAlternativ("Land: {velg:Serbia|Montenegro}\n", "Montenegro");

    markerUerstattedeOmrader(quill);

    expect(quill.root.querySelector("span.placeholder-valgt")?.textContent).toBe("Montenegro");
  });

  it("fjerner valgt-markeringen når det skrives inni det valgte alternativet", () => {
    const quill = medValgtAlternativ("Land: {velg:Serbia|Montenegro}\n", "Montenegro");

    quill.insertText(8, "X");
    fjernUgyldigeValgteMarkeringer(quill);

    expect(quill.getText()).toContain("MoXntenegro");
    expect(quill.root.querySelector("span.placeholder-valgt")).toBeNull();
  });

  it("lar et urørt valg beholde markeringen", () => {
    const quill = medValgtAlternativ("Land: {velg:Serbia|Montenegro}\n", "Montenegro");

    fjernUgyldigeValgteMarkeringer(quill);

    expect(quill.root.querySelector("span.placeholder-valgt")?.textContent).toBe("Montenegro");
  });

  it("gir ingen treff for klikk utenfor en valgmarkering", () => {
    const quill = lagEditor();
    quill.setText("Land: {velg:Serbia|Montenegro}\n");
    markerUerstattedeOmrader(quill);

    expect(finnValgTreff(quill, quill.root)).toBeNull();
  });
});
