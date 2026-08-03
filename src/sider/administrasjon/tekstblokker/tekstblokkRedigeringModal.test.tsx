import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import TekstblokkRedigeringModal from "./tekstblokkRedigeringModal";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { usePlaceholderKatalog } from "../../../services/api/placeholdere";

vi.mock("../../../featuretoggle/useFeatureToggle", () => ({
  default: vi.fn(),
}));

vi.mock("../../../services/api/placeholdere", () => ({
  usePlaceholderKatalog: vi.fn(),
}));

vi.mock("../../../services/api/tekstblokker", () => ({
  useTekstblokk: () => ({ data: undefined, isLoading: false }),
  useOpprettTekstblokk: () => ({ mutate: vi.fn(), isPending: false, error: null }),
  useOppdaterTekstblokk: () => ({ mutate: vi.fn(), isPending: false, error: null }),
}));

// Editoren stubbes: her handler det om katalogen og nøklene den får, ikke om Quill.
vi.mock("../../../felleskomponenter/htmlEditor/htmlEditor", () => ({
  default: ({ gyldigeNokler }: { gyldigeNokler?: string[] }) => (
    <div data-testid="editor" data-gyldige-nokler={(gyldigeNokler ?? []).join(",")} />
  ),
}));

const katalog = [
  {
    nokkel: "soker-navn",
    visningsnavn: "Søkers navn",
    beskrivelse: "Fullt navn på søker",
    eksempel: "Ola Nordmann",
    sakstyper: ["FTRL"],
  },
];

const mockKatalog = (verdi: object) => vi.mocked(usePlaceholderKatalog).mockReturnValue(verdi as any);

const visModal = () =>
  render(<TekstblokkRedigeringModal redigerId={null} type="TEKSTBLOKK" forslagTags={[]} onLukk={vi.fn()} />);

describe("TekstblokkRedigeringModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("viser katalogen og gir editoren nøklene når togglen er på", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    mockKatalog({ data: katalog });

    visModal();

    expect(screen.getByText("Tilgjengelige placeholdere")).toBeDefined();
    expect(screen.getByText("{soker-navn}")).toBeDefined();
    expect(screen.getByTestId("editor").getAttribute("data-gyldige-nokler")).toBe("soker-navn");
  });

  it("viser ingen katalog og ingen nøkler når togglen er av", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(false);
    mockKatalog({ data: undefined });

    visModal();

    expect(screen.queryByText("Tilgjengelige placeholdere")).toBeNull();
    expect(usePlaceholderKatalog).toHaveBeenCalledWith(false);
    expect(screen.getByTestId("editor").getAttribute("data-gyldige-nokler")).toBe("");
  });

  it("viser ingen katalog når hentingen feiler eller katalogen er tom", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    mockKatalog({ data: [] });

    visModal();

    expect(screen.queryByText("Tilgjengelige placeholdere")).toBeNull();
  });
});
