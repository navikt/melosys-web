import { act, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { Quill } from "react-quill-new";
import { beforeEach, describe, expect, it, vi } from "vitest";

import HtmlEditor from "./htmlEditor";
import { markerUerstattedeOmrader } from "./placeholderMarkering";
import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import { usePlaceholderKatalog } from "../../services/api/placeholdere";

vi.mock("../../featuretoggle/useFeatureToggle", () => ({
  default: vi.fn(),
}));

// Popoveren slår opp visningsnavnet i katalogen; her trengs ingen react-query-kontekst.
vi.mock("../../services/api/placeholdere", () => ({
  usePlaceholderKatalog: vi.fn(() => ({ data: undefined })),
}));

vi.mock("./tekstblokkSoek", () => ({
  default: () => null,
}));

const HTML_MED_MARKERING =
  '<p>Saken <span class="placeholder-utfylt" data-placeholder="saksnummer">2024/123456</span> ' +
  'og <span class="placeholder-uerstattet">{fornavn}</span></p>';

type EditorProps = Omit<React.ComponentProps<typeof HtmlEditor>, "onChange">;

// Verten må ta imot verdien editoren normaliserer, ellers skyver de to en runde til hverandre
// i det uendelige – akkurat som redux-form gjør i skjemaene.
function KontrollertEditor({ value, ...props }: EditorProps) {
  const [verdi, setVerdi] = useState(value);
  return <HtmlEditor {...props} value={verdi} onChange={setVerdi} />;
}

const renderEditor = (html: string, props: Partial<EditorProps> = {}) =>
  render(<KontrollertEditor value={html} {...props} />).container;

describe("HtmlEditor", () => {
  beforeEach(() => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
  });

  it("beholder markeringene i lagret innhold når togglen er på", async () => {
    const container = renderEditor(HTML_MED_MARKERING);

    await waitFor(() => expect(container.querySelector(".placeholder-utfylt")).not.toBeNull());
    expect(container.querySelector(".placeholder-uerstattet")?.textContent).toBe("{fornavn}");
  });

  it("beholder markeringene i lagret innhold før togglen er lastet", async () => {
    vi.mocked(useFeatureToggle).mockReturnValue(undefined);

    const container = renderEditor(HTML_MED_MARKERING);

    await waitFor(() => expect(container.querySelector(".placeholder-utfylt")).not.toBeNull());
    expect(container.querySelector(".placeholder-uerstattet")?.textContent).toBe("{fornavn}");
  });

  it("stripper markeringene i lagret innhold når togglen er av", async () => {
    vi.mocked(useFeatureToggle).mockReturnValue(false);

    const container = renderEditor(HTML_MED_MARKERING);

    await waitFor(() => expect(container.querySelector(".ql-editor")?.textContent).toContain("2024/123456"));
    expect(container.querySelector(".placeholder-utfylt")).toBeNull();
    expect(container.querySelector(".placeholder-uerstattet")).toBeNull();
  });

  it("markerer innholdet når togglen lander etter mount", async () => {
    vi.mocked(useFeatureToggle).mockReturnValue(undefined);
    const { container, rerender } = render(
      <KontrollertEditor value="<p>Hei {fornavn}</p>" gyldigeNokler={["fornavn"]} />,
    );

    await waitFor(() => expect(container.querySelector(".ql-editor")?.textContent).toContain("{fornavn}"));
    expect(container.querySelector(".placeholder-uerstattet")).toBeNull();

    vi.mocked(useFeatureToggle).mockReturnValue(true);
    rerender(<KontrollertEditor value="<p>Hei {fornavn}</p>" gyldigeNokler={["fornavn"]} />);

    await waitFor(() => expect(container.querySelector(".placeholder-uerstattet")?.textContent).toBe("{fornavn}"));
  });

  it("markerer ikke uten placeholder-kontekst fra verten (saksflyt-editorene)", async () => {
    const container = renderEditor("<p>Hei {saksnummer}</p>");

    await waitFor(() => expect(container.querySelector(".ql-editor")?.textContent).toContain("{saksnummer}"));
    expect(container.querySelector(".placeholder-uerstattet")).toBeNull();
    expect(container.querySelector(".placeholder-ukjent")).toBeNull();
  });

  it("markerer når verten sender placeholder-kontekst (Send brev, admin)", async () => {
    const container = renderEditor("<p>Hei {saksnummer}</p>", { placeholderVerdier: [] });

    await waitFor(() => expect(container.querySelector(".placeholder-uerstattet")?.textContent).toBe("{saksnummer}"));
  });
});

const klikk = (node: Element) => act(() => void node.dispatchEvent(new MouseEvent("click", { bubbles: true })));

// Editoren eier Quill-instansen internt; testene når den via containeren Quill selv er bygd på.
const hentQuill = (container: HTMLElement) => Quill.find(container.querySelector(".ql-container") as Node) as Quill;

const trykkEnter = (quill: Quill) =>
  act(() => void quill.root.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));

// Klikk-lytteren ligger som delegering på quill.root, så et boblende MouseEvent på selve
// markeringen er akkurat det brukerens klikk gir.
describe("HtmlEditor med valgtokener", () => {
  beforeEach(() => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
  });

  const renderMedValg = (props: Partial<EditorProps> = {}) =>
    renderEditor("<p>Land: {velg:Serbia|Montenegro}</p>", { placeholderVerdier: [], ...props });

  const ventPaaValgmarkering = async (container: HTMLElement) => {
    await waitFor(() => expect(container.querySelector("span.placeholder-valg")).not.toBeNull());
    return container.querySelector("span.placeholder-valg") as HTMLElement;
  };

  it("åpner popover med alternativene når valgtokenet klikkes", async () => {
    const container = renderMedValg();

    klikk(await ventPaaValgmarkering(container));

    expect(screen.getByRole("button", { name: "Serbia" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Montenegro" })).toBeInTheDocument();
  });

  it("erstatter tokenet med valgt alternativ", async () => {
    const container = renderMedValg();
    klikk(await ventPaaValgmarkering(container));

    klikk(screen.getByRole("button", { name: "Montenegro" }));

    await waitFor(() => expect(container.querySelector("span.placeholder-valgt")?.textContent).toBe("Montenegro"));
    expect(container.querySelector("span.placeholder-valgt")?.getAttribute("data-valg")).toBe("Serbia|Montenegro");
    expect(container.querySelector(".ql-editor")?.textContent).not.toContain("{velg:");
  });

  it("åpner samme valg på nytt ved klikk på det innsatte valget", async () => {
    const container = renderMedValg();
    klikk(await ventPaaValgmarkering(container));
    klikk(screen.getByRole("button", { name: "Montenegro" }));
    await waitFor(() => expect(container.querySelector("span.placeholder-valgt")).not.toBeNull());

    klikk(container.querySelector("span.placeholder-valgt") as HTMLElement);
    klikk(screen.getByRole("button", { name: "Serbia" }));

    await waitFor(() => expect(container.querySelector("span.placeholder-valgt")?.textContent).toBe("Serbia"));
  });

  it("erstatter tokenet selv om markeringene påføres på nytt mens popoveren står åpen", async () => {
    const container = renderMedValg({ gyldigeNokler: ["saksnummer"] });
    klikk(await ventPaaValgmarkering(container));

    // Katalogen lander gjerne mens popoveren står åpen, og remarkeringen bytter ut DOM-noden.
    act(() => markerUerstattedeOmrader(hentQuill(container), ["saksnummer"]));
    klikk(screen.getByRole("button", { name: "Montenegro" }));

    await waitFor(() => expect(container.querySelector("span.placeholder-valgt")?.textContent).toBe("Montenegro"));
    expect(container.querySelector(".ql-editor")?.textContent).not.toContain("{velg:");
  });

  it("markerer hele valgtokenet ved klikk, så en innsatt tekstblokk erstatter det", async () => {
    const container = renderMedValg();
    const markering = await ventPaaValgmarkering(container);

    klikk(markering);

    expect(hentQuill(container).getSelection()).toEqual({ index: 6, length: "{velg:Serbia|Montenegro}".length });
  });

  it("åpner popoveren og flytter fokus dit når Enter trykkes inni valgtokenet", async () => {
    const container = renderMedValg();
    await ventPaaValgmarkering(container);
    const quill = hentQuill(container);
    act(() => {
      quill.focus();
      quill.setSelection(10, 0);
    });

    trykkEnter(quill);

    expect(screen.getByRole("button", { name: "Serbia" })).toHaveFocus();
  });

  it("lar Enter utenfor valgtokenet gi linjeskift som før", async () => {
    const container = renderMedValg();
    await ventPaaValgmarkering(container);
    const quill = hentQuill(container);
    act(() => {
      quill.focus();
      quill.setSelection(0, 0);
    });

    trykkEnter(quill);

    expect(screen.queryByRole("button", { name: "Serbia" })).not.toBeInTheDocument();
    expect(quill.getText()).toBe("\nLand: {velg:Serbia|Montenegro}\n");
  });

  it("åpner ingen popover uten placeholder-kontekst fra verten", async () => {
    const container = renderEditor("<p>Land: {velg:Serbia|Montenegro}</p>");
    await waitFor(() => expect(container.querySelector(".ql-editor")?.textContent).toContain("{velg:"));

    klikk(container.querySelector(".ql-editor") as HTMLElement);

    expect(screen.queryByRole("button", { name: "Serbia" })).not.toBeInTheDocument();
  });
});

const HTML_MED_UTFYLT_VERDI =
  '<p>Fra <span class="placeholder-utfylt" data-placeholder="lovvalgsperiode-fra">01.03.2024</span>.</p>';

const KATALOG = [
  {
    nokkel: "lovvalgsperiode-fra",
    visningsnavn: "Lovvalgsperiode fra",
    beskrivelse: "Startdato",
    eksempel: "01.03.2024",
    sakstyper: [],
  },
];

describe("HtmlEditor med klikk på utfylt verdi", () => {
  beforeEach(() => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    vi.mocked(usePlaceholderKatalog).mockReturnValue({ data: KATALOG } as any);
  });

  const renderMedVerdi = (verdier: React.ComponentProps<typeof HtmlEditor>["placeholderVerdier"]) =>
    renderEditor(HTML_MED_UTFYLT_VERDI, { placeholderVerdier: verdier });

  const utenKandidater = [{ nokkel: "lovvalgsperiode-fra", verdi: "01.03.2024" }];
  const medKandidater = [
    { nokkel: "lovvalgsperiode-fra", verdi: "01.03.2024", kandidater: ["01.03.2024", "01.01.2023"] },
  ];

  const klikkPaaVerdi = async (container: HTMLElement) => {
    await waitFor(() => expect(container.querySelector("span.placeholder-utfylt")).not.toBeNull());
    klikk(container.querySelector("span.placeholder-utfylt") as HTMLElement);
  };

  it("viser visningsnavn, nøkkel og fjern-handling", async () => {
    const container = renderMedVerdi(utenKandidater);

    await klikkPaaVerdi(container);

    expect(screen.getByText("Lovvalgsperiode fra")).toBeInTheDocument();
    expect(screen.getByText("{lovvalgsperiode-fra}")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gjør om til vanlig tekst" })).toBeInTheDocument();
  });

  it("beholder teksten uten markering når verdien gjøres om til vanlig tekst", async () => {
    const container = renderMedVerdi(utenKandidater);
    await klikkPaaVerdi(container);

    klikk(screen.getByRole("button", { name: "Gjør om til vanlig tekst" }));

    await waitFor(() => expect(container.querySelector("span.placeholder-utfylt")).toBeNull());
    expect(container.querySelector(".ql-editor")?.textContent).toContain("Fra 01.03.2024.");
  });

  it("viser ingen alternativer når verdien mangler kandidater", async () => {
    const container = renderMedVerdi(utenKandidater);

    await klikkPaaVerdi(container);

    expect(screen.queryByRole("button", { name: "01.03.2024" })).not.toBeInTheDocument();
  });

  it("lar markøren stå der brukeren klikket i den utfylte verdien", async () => {
    const container = renderMedVerdi(medKandidater);
    await waitFor(() => expect(container.querySelector("span.placeholder-utfylt")).not.toBeNull());
    const quill = hentQuill(container);
    // Quill har alt satt markøren på mouseup; hel-seleksjon her ville gjort at neste
    // tastetrykk erstattet hele verdien i stedet for å rette den.
    act(() => quill.setSelection(7, 0));

    klikk(container.querySelector("span.placeholder-utfylt") as HTMLElement);

    expect(quill.getSelection()).toEqual({ index: 7, length: 0 });
  });

  it("bytter verdi ved valg av kandidat og beholder nøkkelen", async () => {
    const container = renderMedVerdi(medKandidater);
    await klikkPaaVerdi(container);
    expect(screen.getByRole("button", { name: "01.03.2024" })).toBeInTheDocument();

    klikk(screen.getByRole("button", { name: "01.01.2023" }));

    await waitFor(() => expect(container.querySelector("span.placeholder-utfylt")?.textContent).toBe("01.01.2023"));
    expect(container.querySelector("span.placeholder-utfylt")?.getAttribute("data-placeholder")).toBe(
      "lovvalgsperiode-fra",
    );
  });
});

describe("HtmlEditor – tone på betingelsestokener", () => {
  beforeEach(() => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
  });

  it("varsler om betingelsestokener når verten har sakens verdier (Send brev)", () => {
    const container = renderEditor("<p>{#hvis avslag}</p>", { placeholderVerdier: [] });

    expect(container.querySelector(".htmlEditor--betingelse-varsel")).not.toBeNull();
  });

  it("holder tonen nøytral der verten bare har katalogen (admin)", () => {
    const container = renderEditor("<p>{#hvis avslag}</p>", { gyldigeNokler: ["saksnummer"] });

    expect(container.querySelector(".htmlEditor--betingelse-varsel")).toBeNull();
  });

  it("holder tonen nøytral uten placeholder-kontekst (saksflyt)", () => {
    const container = renderEditor("<p>{#hvis avslag}</p>");

    expect(container.querySelector(".htmlEditor--betingelse-varsel")).toBeNull();
  });
});
