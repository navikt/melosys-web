import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

const dispatchMock = vi.fn(() => Promise.resolve({ type: "oppsummertfakta/OK" }));

vi.mock("react-redux", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-redux")>();
  return {
    ...actual,
    useSelector: (selector: any) => selector(),
  };
});

vi.mock("../../../../../hooks", () => ({
  useDispatch: () => dispatchMock,
}));

vi.mock("../../../../../ducks/oppsummertfakta/types", () => ({
  FEILET: "oppsummertfakta/FEILET",
}));

vi.mock("../../../../../ducks/oppsummertfakta", () => ({
  oppsummertfaktaOperations: {
    lagreManglendeInnbetalingHandlingsvalg: vi.fn((behandlingID: number, verdi?: string) => ({
      type: "LAGRE_MANGLENDE_INNBETALING_HANDLINGSVALG",
      behandlingID,
      verdi,
    })),
  },
  oppsummertfaktaSelectors: {
    ManglendeInnbetalingHandlingsvalgSelector: () => undefined,
  },
}));

vi.mock("../../../../../ducks/redigerbart", () => ({
  redigerbartSelectors: { RedigerbartSelector: () => true },
}));

vi.mock("../../../../../ducks/behandlinger", () => ({
  behandlingerSelectors: { BehandlingIDSelector: () => 162 },
}));

vi.mock("../../../../../ducks/modaler", () => ({
  modalerOperations: {
    visBekreftValg: vi.fn((type: unknown) => ({ type: "VIS_BEKREFT_VALG", bekreftValgType: type })),
  },
}));

vi.mock("../../../../../modals/bekreftValgTypes", () => ({
  BekreftValgTypes: { FERDIGBEHANDLET: "FERDIGBEHANDLET" },
}));

import { oppsummertfaktaOperations } from "../../../../../ducks/oppsummertfakta";
import { modalerOperations } from "../../../../../ducks/modaler";
import { BekreftValgTypes } from "../../../../../modals/bekreftValgTypes";
import { VurderingInngangManglendeInnbetaling } from "./vurderingInngangManglendeInnbetaling";

describe("VurderingInngangManglendeInnbetaling", () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    vi.mocked(oppsummertfaktaOperations.lagreManglendeInnbetalingHandlingsvalg).mockClear();
    vi.mocked(modalerOperations.visBekreftValg).mockClear();
  });

  it("lagrer ikke valget bare ved å velge en radioknapp", async () => {
    render(<VurderingInngangManglendeInnbetaling bekreft={vi.fn()} aktivtSteg oppdaterStatus={vi.fn()} />);

    await act(async () => {
      fireEvent.click(screen.getByText(/Deler/).closest("label") as HTMLLabelElement);
    });

    expect(oppsummertfaktaOperations.lagreManglendeInnbetalingHandlingsvalg).not.toHaveBeenCalled();
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it("lagrer valgt verdi og navigerer videre først når Bekreft klikkes", async () => {
    const bekreft = vi.fn();
    render(<VurderingInngangManglendeInnbetaling bekreft={bekreft} aktivtSteg oppdaterStatus={vi.fn()} />);

    await act(async () => {
      fireEvent.click(screen.getByText(/Deler/).closest("label") as HTMLLabelElement);
    });
    const bekreftKnapp = await screen.findByRole("button", { name: "Bekreft og fortsett" });
    await waitFor(() => expect(bekreftKnapp).not.toBeDisabled());
    await act(async () => {
      fireEvent.click(bekreftKnapp);
    });

    await waitFor(() => expect(bekreft).toHaveBeenCalled());

    expect(oppsummertfaktaOperations.lagreManglendeInnbetalingHandlingsvalg).toHaveBeenCalledWith(
      162,
      "DELER_AV_PERIODEN_OPPHØRES",
    );
    // Lagringen må skje før navigering videre, ikke etter.
    expect(dispatchMock.mock.invocationCallOrder[0]).toBeLessThan(bekreft.mock.invocationCallOrder[0]);
  });

  it("navigerer ikke videre hvis lagringen feiler", async () => {
    dispatchMock.mockResolvedValueOnce({ type: "oppsummertfakta/FEILET" });
    const bekreft = vi.fn();
    render(<VurderingInngangManglendeInnbetaling bekreft={bekreft} aktivtSteg oppdaterStatus={vi.fn()} />);

    await act(async () => {
      fireEvent.click(screen.getByText(/Deler/).closest("label") as HTMLLabelElement);
    });
    const bekreftKnapp = await screen.findByRole("button", { name: "Bekreft og fortsett" });
    await waitFor(() => expect(bekreftKnapp).not.toBeDisabled());
    await act(async () => {
      fireEvent.click(bekreftKnapp);
    });

    expect(oppsummertfaktaOperations.lagreManglendeInnbetalingHandlingsvalg).toHaveBeenCalledWith(
      162,
      "DELER_AV_PERIODEN_OPPHØRES",
    );
    expect(bekreft).not.toHaveBeenCalled();
  });

  it('åpner "Ferdigbehandlet"-dialogen og lagrer ikke handlingsvalg når "Behandlingen skal avsluttes" bekreftes', async () => {
    const bekreft = vi.fn();
    render(<VurderingInngangManglendeInnbetaling bekreft={bekreft} aktivtSteg oppdaterStatus={vi.fn()} />);

    await act(async () => {
      fireEvent.click(screen.getByText(/Behandlingen skal avsluttes/).closest("label") as HTMLLabelElement);
    });
    const bekreftKnapp = await screen.findByRole("button", { name: "Bekreft og fortsett" });
    await waitFor(() => expect(bekreftKnapp).not.toBeDisabled());
    await act(async () => {
      fireEvent.click(bekreftKnapp);
    });

    expect(modalerOperations.visBekreftValg).toHaveBeenCalledWith(BekreftValgTypes.FERDIGBEHANDLET);
    expect(oppsummertfaktaOperations.lagreManglendeInnbetalingHandlingsvalg).not.toHaveBeenCalled();
    expect(bekreft).not.toHaveBeenCalled();
  });
});
