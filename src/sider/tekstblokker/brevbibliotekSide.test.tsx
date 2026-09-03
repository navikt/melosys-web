import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import BrevbibliotekSide from "./brevbibliotekSide";
import useFeatureToggle from "../../featuretoggle/useFeatureToggle";

vi.mock("../../featuretoggle/useFeatureToggle", () => ({ default: vi.fn() }));

// Selve oversikten er dekket av tekstblokkerSide.test; her handler det om gatingen
// og at siden ber om den skrivebeskyttede varianten.
vi.mock("./tekstblokkerSide", () => ({
  default: ({ kanRedigere }: { kanRedigere?: boolean }) => <div>{`Oversikt kanRedigere=${kanRedigere}`}</div>,
}));

vi.mock("../ukjentSide", () => ({ default: () => <div>Ukjent side</div> }));

// UkjentSide leser stien fra location, som siden henter fra ruteren.
const vis = () =>
  render(
    <MemoryRouter initialEntries={["/brevbibliotek"]}>
      <BrevbibliotekSide />
    </MemoryRouter>,
  );

describe("BrevbibliotekSide", () => {
  beforeEach(() => vi.mocked(useFeatureToggle).mockReset());

  it("viser oversikten skrivebeskyttet når togglen er på", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    vis();

    expect(screen.getByText("Oversikt kanRedigere=false")).toBeDefined();
  });

  it("er en ukjent side når togglen er av", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(false);
    vis();

    expect(screen.getByText("Ukjent side")).toBeDefined();
  });

  it("venter i stedet for å blinke opp «ukjent side» mens togglen lastes", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(undefined);
    const { container } = vis();

    expect(container.textContent).toBe("");
  });
});
