import { describe, it, expect, vi, beforeEach } from "vitest";

const { hentMock, behandlingIDSelectorMock } = vi.hoisted(() => ({
  hentMock: vi.fn(),
  behandlingIDSelectorMock: vi.fn(),
}));

vi.mock("../../services/api", () => ({
  Pensjonsopptjening: { hentPensjonsopptjening: hentMock },
}));

vi.mock("../behandlinger", () => ({
  behandlingerSelectors: { BehandlingIDSelector: behandlingIDSelectorMock },
}));

import { hentPensjonsopptjening } from "./operations";
import * as Types from "./types";

describe("hentPensjonsopptjening", () => {
  beforeEach(() => {
    hentMock.mockReset();
    behandlingIDSelectorMock.mockReset();
  });

  it("dispatcher PENDING, så OK når behandlingID fortsatt matcher", async () => {
    const respons = { inntektsAr: 2024, behandletAr: 2024, perioder: [] };
    hentMock.mockResolvedValueOnce(respons);
    behandlingIDSelectorMock.mockReturnValue(42);
    const dispatch = vi.fn();
    const getState = vi.fn(() => ({}) as any);

    await hentPensjonsopptjening(42)(dispatch, getState, undefined);

    expect(dispatch).toHaveBeenNthCalledWith(1, { type: Types.PENDING });
    expect(dispatch).toHaveBeenNthCalledWith(2, { type: Types.OK, data: respons });
  });

  it("dropper OK når behandlingID har endret seg mens kallet løper (race-guard)", async () => {
    const respons = { inntektsAr: 2024, behandletAr: 2024, perioder: [] };
    hentMock.mockResolvedValueOnce(respons);
    behandlingIDSelectorMock.mockReturnValue(99);
    const dispatch = vi.fn();
    const getState = vi.fn(() => ({}) as any);

    await hentPensjonsopptjening(42)(dispatch, getState, undefined);

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: Types.PENDING });
  });

  it("dispatcher FEILET med feilen når kallet feiler og behandlingID matcher", async () => {
    const err = new Error("boom");
    hentMock.mockRejectedValueOnce(err);
    behandlingIDSelectorMock.mockReturnValue(42);
    const dispatch = vi.fn();
    const getState = vi.fn(() => ({}) as any);

    await hentPensjonsopptjening(42)(dispatch, getState, undefined);

    expect(dispatch).toHaveBeenNthCalledWith(2, { type: Types.FEILET, data: err });
  });

  it("dropper FEILET når behandlingID har endret seg", async () => {
    hentMock.mockRejectedValueOnce(new Error("boom"));
    behandlingIDSelectorMock.mockReturnValue(99);
    const dispatch = vi.fn();
    const getState = vi.fn(() => ({}) as any);

    await hentPensjonsopptjening(42)(dispatch, getState, undefined);

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: Types.PENDING });
  });
});
