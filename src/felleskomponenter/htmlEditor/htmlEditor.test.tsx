import { render, waitFor } from "@testing-library/react";
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

const renderEditor = (html: string) => render(<HtmlEditor value={html} onChange={() => undefined} />).container;

describe("HtmlEditor", () => {
  beforeEach(() => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
  });

  it("beholder markeringene i lagret innhold når togglen er på", async () => {
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
    const { container, rerender } = render(<HtmlEditor value="<p>Hei {fornavn}</p>" onChange={() => undefined} />);

    await waitFor(() => expect(container.querySelector(".ql-editor")?.textContent).toContain("{fornavn}"));
    expect(container.querySelector(".placeholder-uerstattet")).toBeNull();

    vi.mocked(useFeatureToggle).mockReturnValue(true);
    rerender(<HtmlEditor value="<p>Hei {fornavn}</p>" onChange={() => undefined} />);

    await waitFor(() => expect(container.querySelector(".placeholder-uerstattet")?.textContent).toBe("{fornavn}"));
  });
});
