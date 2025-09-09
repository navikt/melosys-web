import React from "react";
import { waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import EndreBehandlingModal from "./endreBehandlingModal";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import * as Api from "../../services/api";

// Mock API calls
vi.mock("../../services/api", () => ({
  LovligeKombinasjoner: {
    hentSakstyper: vi.fn(),
    hentSakstemaer: vi.fn(),
    hentBehandlingstemaer: vi.fn(),
    hentBehandlingstyperForEndring: vi.fn(),
  },
  Fagsaker: {
    fagsak: {
      hentTrygdeavgiftOppsummering: vi.fn(),
      endreFagsak: vi.fn(),
    },
  },
  Behandlinger: {
    status: {
      hentMuligeBehandlingsstatuser: vi.fn(),
    },
  },
  Trygdeavtale: {
    slettFlyt: vi.fn(),
    oppfriskFlyt: vi.fn(),
  },
}));

describe("EndreBehandlingModal", () => {
  const mockFagsak = {
    saksnummer: "12345",
    sakstype: { kode: "EU_EOS", termnavn: "EU/EØS" },
    sakstema: { kode: "MEDLEMSKAP", termnavn: "Medlemskap" },
    hovedpartRolle: "BRUKER",
  };

  const mockOppsummering = {
    behandlingstema: { kode: "YRKESAKTIV", termnavn: "Yrkesaktiv" },
    behandlingstype: { kode: "FØRSTEGANGSBEHANDLING", termnavn: "Førstegangsbehandling" },
    behandlingsstatus: { kode: "ÅPEN", termnavn: "Åpen" },
  };

  const mockÅrsavregningOppsummering = {
    behandlingstema: { kode: "YRKESAKTIV", termnavn: "Yrkesaktiv" },
    behandlingstype: { kode: "ÅRSAVREGNING", termnavn: "Årsavregning" },
    behandlingsstatus: { kode: "ÅPEN", termnavn: "Åpen" },
  };

  const defaultProps = {
    fagsak: mockFagsak,
    oppsummering: mockOppsummering,
    mottattDato: "2024-01-01",
    skalViseModal: true,
    erÅrsavregning: false,
    lukkModal: vi.fn(),
  };

  const preloadedState = {
    behandlinger: {
      data: {
        behandlingID: 1,
      },
    },
    behandlingsstatus: {
      data: {
        muligeBehandlingsstatuser: [
          { kode: "ÅPEN", termnavn: "Åpen" },
          { kode: "AVSLUTTET", termnavn: "Avsluttet" },
        ],
      },
    },
    anmodningsperioder: {
      data: [],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Api.LovligeKombinasjoner.hentSakstyper).mockResolvedValue([]);
    vi.mocked(Api.LovligeKombinasjoner.hentSakstemaer).mockResolvedValue([]);
    vi.mocked(Api.LovligeKombinasjoner.hentBehandlingstemaer).mockResolvedValue([]);
    vi.mocked(Api.Fagsaker.fagsak.hentTrygdeavgiftOppsummering).mockResolvedValue({
      harBehandlingMedTrygdeavgift: false,
    });
    vi.mocked(Api.Behandlinger.status.hentMuligeBehandlingsstatuser).mockResolvedValue([
      { kode: "ÅPEN", termnavn: "Åpen" },
      { kode: "AVSLUTTET", termnavn: "Avsluttet" },
    ]);
  });

  it("skal filtrere bort Årsavregning fra behandlingstyper når nåværende type ikke er Årsavregning", async () => {
    const mockBehandlingstyper = [
      { kode: "FØRSTEGANGSBEHANDLING", termnavn: "Førstegangsbehandling" },
      { kode: "NY_VURDERING", termnavn: "Ny vurdering" },
      { kode: "ÅRSAVREGNING", termnavn: "Årsavregning" },
      { kode: "HENVENDELSE", termnavn: "Henvendelse" },
    ];

    vi.mocked(Api.LovligeKombinasjoner.hentBehandlingstyperForEndring).mockResolvedValue(mockBehandlingstyper);

    renderWithProviders(
      <MemoryRouter>
        <EndreBehandlingModal {...(defaultProps as any)} />
      </MemoryRouter>,
      { preloadedState },
    );

    // Vent på at API-kall fullføres og select oppdateres
    await waitFor(() => {
      expect(Api.LovligeKombinasjoner.hentBehandlingstyperForEndring).toHaveBeenCalled();
    });

    // Finn behandlingstype select
    const behandlingstypeSelect = screen.getByLabelText("Behandlingstype");
    expect(behandlingstypeSelect).toBeInTheDocument();

    // Sjekk at select-elementet eksisterer og har options
    const options = behandlingstypeSelect.querySelectorAll("option");
    const optionValues = Array.from(options).map((option) => option.value);

    // Verifiser at Årsavregning IKKE er blant valgmulighetene
    expect(optionValues).not.toContain("ÅRSAVREGNING");

    // Verifiser at andre behandlingstyper fortsatt er tilgjengelige
    expect(optionValues).toContain("FØRSTEGANGSBEHANDLING");
    expect(optionValues).toContain("NY_VURDERING");
    expect(optionValues).toContain("HENVENDELSE");
  });

  it("skal ikke filtrere behandlingstyper når nåværende type er Årsavregning", async () => {
    const årsavregningProps = {
      ...defaultProps,
      oppsummering: mockÅrsavregningOppsummering,
      erÅrsavregning: true,
    };

    renderWithProviders(
      <MemoryRouter>
        <EndreBehandlingModal {...(årsavregningProps as any)} />
      </MemoryRouter>,
      { preloadedState },
    );

    // Vent på at komponenten rendres
    await waitFor(() => {
      // Når det er en Årsavregning, er feltet readonly, så vi sjekker for Sakstype i stedet
      expect(screen.getByText("Sakstype")).toBeInTheDocument();
    });

    // Verifiser at API-kallet for å hente behandlingstyper IKKE blir gjort
    // fordi komponenten returnerer tidlig når erÅrsavregning er true
    expect(Api.LovligeKombinasjoner.hentBehandlingstyperForEndring).not.toHaveBeenCalled();

    // Finn alle select-elementer i modal
    const allSelects = screen.getAllByRole("combobox");
    // Behandlingstype er det fjerde select-elementet
    const behandlingstypeSelect =
      allSelects.find((select) => {
        const label = select.getAttribute("aria-label") || "";
        const id = select.getAttribute("id") || "";
        // Sjekk om det er behandlingstype-feltet
        return label.includes("Behandlingstype") || id.includes("behandlingstype");
      }) || allSelects[3]; // Fallback til posisjon hvis vi ikke finner ved label

    if (behandlingstypeSelect) {
      const options = behandlingstypeSelect.querySelectorAll("option");
      const optionValues = Array.from(options)
        .map((option) => option.value)
        .filter((value) => value !== ""); // Filtrer bort tom første option

      // Fjern duplikater
      const uniqueValues = [...new Set(optionValues)];
      expect(uniqueValues).toEqual(["ÅRSAVREGNING"]);
    }
  });

  it("skal kunne endre andre behandlingstyper til hverandre, men ikke til Årsavregning", async () => {
    const mockBehandlingstyper = [
      { kode: "FØRSTEGANGSBEHANDLING", termnavn: "Førstegangsbehandling" },
      { kode: "NY_VURDERING", termnavn: "Ny vurdering" },
      { kode: "HENVENDELSE", termnavn: "Henvendelse" },
      { kode: "ÅRSAVREGNING", termnavn: "Årsavregning" },
    ];

    vi.mocked(Api.LovligeKombinasjoner.hentBehandlingstyperForEndring).mockResolvedValue(mockBehandlingstyper);

    const { rerender } = renderWithProviders(
      <MemoryRouter>
        <EndreBehandlingModal {...(defaultProps as any)} />
      </MemoryRouter>,
      { preloadedState },
    );

    await waitFor(() => {
      expect(Api.LovligeKombinasjoner.hentBehandlingstyperForEndring).toHaveBeenCalled();
    });

    // Test med NY_VURDERING som nåværende type
    const nyVurderingProps = {
      ...defaultProps,
      oppsummering: {
        ...mockOppsummering,
        behandlingstype: { kode: "NY_VURDERING", termnavn: "Ny vurdering" },
      },
    };

    rerender(
      <MemoryRouter>
        <EndreBehandlingModal {...(nyVurderingProps as any)} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const behandlingstypeSelect = screen.getByLabelText("Behandlingstype");
      const options = behandlingstypeSelect.querySelectorAll("option");
      const optionValues = Array.from(options).map((option) => option.value);

      // Årsavregning skal fortsatt ikke være tilgjengelig
      expect(optionValues).not.toContain("ÅRSAVREGNING");
      // Andre typer skal være tilgjengelige
      expect(optionValues).toContain("FØRSTEGANGSBEHANDLING");
      expect(optionValues).toContain("HENVENDELSE");
    });
  });

  it("skal vise modal og lukke ved klikk på avbryt", async () => {
    const lukkModal = vi.fn();
    const props = {
      ...defaultProps,
      lukkModal,
    };

    renderWithProviders(
      <MemoryRouter>
        <EndreBehandlingModal {...(props as any)} />
      </MemoryRouter>,
      { preloadedState },
    );

    // Modal skal være synlig
    expect(screen.getByText("Avbryt")).toBeInTheDocument();

    // Klikk på avbryt
    const user = userEvent.setup();
    await user.click(screen.getByText("Avbryt"));

    // Verifiser at lukkModal ble kalt
    expect(lukkModal).toHaveBeenCalled();
  });
});
