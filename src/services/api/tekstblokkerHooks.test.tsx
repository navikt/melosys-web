import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { tekstblokkerKeys, usePubliserTekstblokk, useTekstblokkHistorikk } from "./tekstblokker";
import * as Tekstblokker from "../modules/tekstblokker";

vi.mock("../modules/tekstblokker", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../modules/tekstblokker")>()),
  publiser: vi.fn(),
  hentHistorikk: vi.fn(),
}));

const publisertBlokk = {
  id: 7,
  tittel: "Om utsending",
  status: "PUBLISERT",
} as Tekstblokker.Tekstblokk;

const versjon = {
  versjon: 1,
  gyldigFra: "2026-01-01T10:00:00",
  gyldigTil: null,
  endretAv: "Z123456",
  endretAvNavn: "Kari Saksbehandler",
  endringstype: "OPPRETTET",
  tittel: "Om utsending",
  innhold: "<p>Tekst</p>",
  tags: [],
  sakstyper: [],
  sakstemaer: [],
  behandlingstemaer: [],
  status: "PUBLISERT",
} as Tekstblokker.TekstblokkVersjon;

const lagWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

describe("usePubliserTekstblokk", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  it("publiserer, oppdaterer detaljen og invaliderer lista", async () => {
    vi.mocked(Tekstblokker.publiser).mockResolvedValue(publisertBlokk);
    queryClient.setQueryData(tekstblokkerKeys.liste("TEKSTBLOKK"), []);

    const { result } = renderHook(() => usePubliserTekstblokk(), { wrapper: lagWrapper(queryClient) });
    result.current.mutate(7);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // react-query gir mutasjonsfunksjonen en kontekst som andre argument.
    expect(Tekstblokker.publiser).toHaveBeenCalledWith(7, expect.anything());
    expect(queryClient.getQueryData(tekstblokkerKeys.detalj(7))).toEqual(publisertBlokk);
    expect(queryClient.getQueryState(tekstblokkerKeys.liste("TEKSTBLOKK"))?.isInvalidated).toBe(true);
  });
});

describe("useTekstblokkHistorikk", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  it("henter historikken for blokken", async () => {
    vi.mocked(Tekstblokker.hentHistorikk).mockResolvedValue([versjon]);

    const { result } = renderHook(() => useTekstblokkHistorikk(7), { wrapper: lagWrapper(queryClient) });

    await waitFor(() => expect(result.current.data).toEqual([versjon]));
    expect(Tekstblokker.hentHistorikk).toHaveBeenCalledWith(7);
  });

  it("henter ingenting når den ikke er aktivert", () => {
    renderHook(() => useTekstblokkHistorikk(7, false), { wrapper: lagWrapper(queryClient) });

    expect(Tekstblokker.hentHistorikk).not.toHaveBeenCalled();
  });

  it("henter ingenting uten id", () => {
    renderHook(() => useTekstblokkHistorikk(null), { wrapper: lagWrapper(queryClient) });

    expect(Tekstblokker.hentHistorikk).not.toHaveBeenCalled();
  });
});
