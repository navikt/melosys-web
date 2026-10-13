import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

const dispatchMock = vi.fn(() => Promise.resolve({ type: "oppsummertfakta/OK" }));
const { redigerbartSelectorMock, handlingsvalgSelectorMock, behandlingsresultatTypeSelectorMock } = vi.hoisted(() => ({
  redigerbartSelectorMock: vi.fn(() => true),
  handlingsvalgSelectorMock: vi.fn((): { kode: string } | undefined => undefined),
  behandlingsresultatTypeSelectorMock: vi.fn((): string | undefined => undefined),
}));

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
    ManglendeInnbetalingHandlingsvalgSelector: handlingsvalgSelectorMock,
  },
}));

vi.mock("../../../../../ducks/redigerbart", () => ({
  redigerbartSelectors: { RedigerbartSelector: redigerbartSelectorMock },
}));

vi.mock("../../../../../ducks/behandlingsresultat", () => ({
  behandlingsresultatSelectors: {
    BehandlingsresultatTypeSelector: behandlingsresultatTypeSelectorMock,
  },
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
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import { modalerOperations } from "../../../../../ducks/modaler";
import { BekreftValgTypes } from "../../../../../modals/bekreftValgTypes";
import { VurderingInngangManglendeInnbetaling } from "./vurderingInngangManglendeInnbetaling";

describe("VurderingInngangManglendeInnbetaling", () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    vi.mocked(oppsummertfaktaOperations.lagreManglendeInnbetalingHandlingsvalg).mockClear();
    vi.mocked(modalerOperations.visBekreftValg).mockClear();
    vi.mocked(redigerbartSelectors.RedigerbartSelector).mockReturnValue(true);
    handlingsvalgSelectorMock.mockReturnValue(undefined);
    vi.mocked(behandlingsresultatSelectors.BehandlingsresultatTypeSelector).mockReturnValue(undefined);
  });

  it.each([
    ["OPPHØRT", /Hele perioden/, "VedtakOpphoer"],
    ["DELVIS_OPPHØRT", /Deler av perioden/, "Inngang"],
    ["MEDLEM_I_FOLKETRYGDEN", /Vedtaket skal endres/, "Inngang"],
  ])("utleder radio-valg fra behandlingsresultatet %s i innsynsmodus", async (resultatType, valg, nesteStegId) => {
    vi.mocked(redigerbartSelectors.RedigerbartSelector).mockReturnValue(false);
    vi.mocked(behandlingsresultatSelectors.BehandlingsresultatTypeSelector).mockReturnValue(resultatType);
    const oppdaterStatus = vi.fn();

    await act(async () => {
      render(<VurderingInngangManglendeInnbetaling bekreft={vi.fn()} aktivtSteg oppdaterStatus={oppdaterStatus} />);
    });

    expect(screen.getByRole("radio", { name: valg })).toBeChecked();
    await waitFor(() => expect(oppdaterStatus).toHaveBeenLastCalledWith(true, nesteStegId));
  });

  it("foretrekker lagret handlingsvalg fremfor utledet resultat", async () => {
    vi.mocked(redigerbartSelectors.RedigerbartSelector).mockReturnValue(false);
    handlingsvalgSelectorMock.mockReturnValue({ kode: "DELER_AV_PERIODEN_OPPHØRES" });
    vi.mocked(behandlingsresultatSelectors.BehandlingsresultatTypeSelector).mockReturnValue("OPPHØRT");

    await act(async () => {
      render(<VurderingInngangManglendeInnbetaling bekreft={vi.fn()} aktivtSteg oppdaterStatus={vi.fn()} />);
    });

    expect(screen.getByRole("radio", { name: /Deler av perioden/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Hele perioden/ })).not.toBeChecked();
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
});
