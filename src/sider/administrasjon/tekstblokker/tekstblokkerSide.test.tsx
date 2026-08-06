import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import TekstblokkerSide from "./tekstblokkerSide";
import { tekstblokkOversikt } from "../../../services/modules/tekstblokkTestdata";

// Siden eier utvidelsen og historikkvalget; alt annet på flaten er kulisser her.
vi.mock("./placeholderKatalog", () => ({ default: () => null }));
vi.mock("./tekstblokkerFilter", () => ({ default: () => null }));
vi.mock("./tekstblokkRedigeringModal", () => ({ default: () => null }));
vi.mock("./tekstblokkSlettBekreftelse", () => ({ default: () => null }));
vi.mock("./tekstblokkPubliserBekreftelse", () => ({ default: () => null }));
vi.mock("../../../felleskomponenter/htmlEditor/tekstblokkForhandsvisning", () => ({
  default: () => <div>Forhåndsvisning</div>,
}));
vi.mock("./tekstblokkHistorikk", () => ({ default: () => <div>Historikktabell</div> }));

const blokker = [tekstblokkOversikt({ id: 1, tittel: "Om utsending" })];

vi.mock("../../../services/api/tekstblokker", async () => {
  const faktisk = await vi.importActual<typeof import("../../../services/api/tekstblokker")>(
    "../../../services/api/tekstblokker",
  );
  return {
    ...faktisk,
    useTekstblokker: vi.fn(() => ({ data: blokker, isLoading: false, error: null })),
  };
});

const historikkKnapp = () => screen.getByRole("button", { name: "Historikk" });

describe("TekstblokkerSide – historikkvalg", () => {
  it("åpner raden og viser historikken når historikk velges", async () => {
    render(<TekstblokkerSide />);
    await userEvent.click(historikkKnapp());

    expect(screen.getByText("Historikktabell")).toBeDefined();
    expect(historikkKnapp().getAttribute("aria-pressed")).toBe("true");
  });

  it("nullstiller historikkvalget når raden lukkes, så ny åpning viser forhåndsvisningen", async () => {
    render(<TekstblokkerSide />);
    await userEvent.click(historikkKnapp());

    await userEvent.click(screen.getByRole("button", { name: "Vis mindre" }));
    await userEvent.click(screen.getByRole("button", { name: "Vis mer" }));

    expect(historikkKnapp().getAttribute("aria-pressed")).toBe("false");
    expect(screen.queryByText("Historikktabell")).toBeNull();
    expect(screen.getByText("Forhåndsvisning")).toBeDefined();
  });

  it("nullstiller historikkvalget når alle radene skjules", async () => {
    render(<TekstblokkerSide />);
    await userEvent.click(historikkKnapp());
    await userEvent.click(screen.getByRole("button", { name: "Skjul alle" }));
    await userEvent.click(screen.getByRole("button", { name: "Vis innhold for alle" }));

    expect(historikkKnapp().getAttribute("aria-pressed")).toBe("false");
    expect(screen.queryByText("Historikktabell")).toBeNull();
  });
});
