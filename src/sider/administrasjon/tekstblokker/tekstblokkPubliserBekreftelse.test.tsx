import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TekstblokkPubliserBekreftelse from "./tekstblokkPubliserBekreftelse";
import { TekstblokkOversikt } from "../../../services/modules/tekstblokker";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  reset: vi.fn(),
  feil: vi.fn((): Error | null => null),
}));

vi.mock("../../../services/api/tekstblokker", () => ({
  usePubliserTekstblokk: () => ({
    mutate: mocks.mutate,
    reset: mocks.reset,
    isPending: false,
    error: mocks.feil(),
  }),
}));

const blokk: TekstblokkOversikt = {
  id: 1,
  tittel: "Om utsending",
  innhold: "<p>Tekst</p>",
  type: "TEKSTBLOKK",
  tags: [],
  sakstyper: [],
  behandlingstemaer: [],
  status: "UTKAST",
  endretDato: "2026-01-01T00:00:00Z",
  endretAv: "Z123456",
  endretAvNavn: null,
};

describe("TekstblokkPubliserBekreftelse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.feil.mockReturnValue(null);
  });

  it("publiserer blokken fra bekreftelsesknappen", async () => {
    render(<TekstblokkPubliserBekreftelse blokk={blokk} onLukk={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Publiser" }));

    expect(mocks.mutate).toHaveBeenCalledWith(1, expect.anything());
  });

  it("viser feilen fra publiseringen", () => {
    mocks.feil.mockReturnValue(new Error("Tjenesten er nede"));

    render(<TekstblokkPubliserBekreftelse blokk={blokk} onLukk={vi.fn()} />);

    expect(screen.getByText("Kunne ikke publisere: Tjenesten er nede")).toBeDefined();
  });

  // Uten nullstilling møter admin gårsdagens feilmelding neste gang modalen åpnes.
  it("nullstiller feilen når modalen lukkes", async () => {
    mocks.feil.mockReturnValue(new Error("Tjenesten er nede"));
    const onLukk = vi.fn();

    render(<TekstblokkPubliserBekreftelse blokk={blokk} onLukk={onLukk} />);
    await userEvent.click(screen.getByRole("button", { name: "Avbryt" }));

    expect(mocks.reset).toHaveBeenCalled();
    expect(onLukk).toHaveBeenCalled();
  });
});
