import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

const dispatchMock = vi.fn(() => Promise.resolve());

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

vi.mock("../../../../../ducks/oppsummertfakta", () => ({
  oppsummertfaktaOperations: {
    lagreManglendeInnbetalingVurdering: vi.fn((behandlingID: number, verdi?: string) => ({
      type: "LAGRE_MANGLENDE_INNBETALING_VURDERING",
      behandlingID,
      verdi,
    })),
  },
  oppsummertfaktaSelectors: {
    ManglendeInnbetalingVurderingSelector: () => undefined,
  },
}));

vi.mock("../../../../../ducks/redigerbart", () => ({
  redigerbartSelectors: { RedigerbartSelector: () => true },
}));

vi.mock("../../../../../ducks/behandlinger", () => ({
  behandlingerSelectors: { BehandlingIDSelector: () => 162 },
}));

import { oppsummertfaktaOperations } from "../../../../../ducks/oppsummertfakta";
import { VurderingInngangManglendeInnbetaling } from "./vurderingInngangManglendeInnbetaling";

describe("VurderingInngangManglendeInnbetaling", () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    vi.mocked(oppsummertfaktaOperations.lagreManglendeInnbetalingVurdering).mockClear();
  });

  it("lagrer ikke valget bare ved å velge en radioknapp", async () => {
    render(<VurderingInngangManglendeInnbetaling bekreft={vi.fn()} aktivtSteg oppdaterStatus={vi.fn()} />);

    await act(async () => {
      fireEvent.click(screen.getByText(/Deler/).closest("label") as HTMLLabelElement);
    });

    expect(oppsummertfaktaOperations.lagreManglendeInnbetalingVurdering).not.toHaveBeenCalled();
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

    expect(oppsummertfaktaOperations.lagreManglendeInnbetalingVurdering).toHaveBeenCalledWith(
      162,
      "DELER_AV_PERIODEN_OPPHØRES",
    );
    // Lagringen må skje før navigering videre, ikke etter.
    expect(dispatchMock.mock.invocationCallOrder[0]).toBeLessThan(bekreft.mock.invocationCallOrder[0]);
  });
});
