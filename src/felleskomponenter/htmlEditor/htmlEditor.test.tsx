import { act, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import HtmlEditor from "./htmlEditor";
import useFeatureToggle from "../../featuretoggle/useFeatureToggle";

vi.mock("../../featuretoggle/useFeatureToggle", () => ({
  default: vi.fn(),
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

  it("åpner ingen popover uten placeholder-kontekst fra verten", async () => {
    const container = renderEditor("<p>Land: {velg:Serbia|Montenegro}</p>");
    await waitFor(() => expect(container.querySelector(".ql-editor")?.textContent).toContain("{velg:"));

    klikk(container.querySelector(".ql-editor") as HTMLElement);

    expect(screen.queryByRole("button", { name: "Serbia" })).not.toBeInTheDocument();
  });
});
