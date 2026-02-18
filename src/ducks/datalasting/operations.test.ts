import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  lastInnSaksopplysningerIngenFlyt,
  lastInnSaksopplysningerRegistreringUnntaksperioder,
  lastInnSaksopplysningerBehandleMottattAOU,
} from "./operations";

describe("datalasting operations", () => {
  const mockDispatch = vi.fn(() => Promise.resolve());
  const mockGetState = vi.fn(() => ({
    anmodningsperioder: {
      data: [{ anmodningsperiodeID: 42 }],
    },
  }));

  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetState.mockClear();
  });

  describe("lastInnSaksopplysningerIngenFlyt", () => {
    it("returnerer thunk", () => {
      expect(typeof lastInnSaksopplysningerIngenFlyt("SAK-1", 123)).toBe("function");
    });

    it("returnerer Promise ved dispatch (ikke undefined)", () => {
      const thunk = lastInnSaksopplysningerIngenFlyt("SAK-1", 123);
      const result = thunk(mockDispatch);
      expect(result).toBeInstanceOf(Promise);
    });

    it("dispatcher 4 operations", () => {
      const thunk = lastInnSaksopplysningerIngenFlyt("SAK-1", 123);
      thunk(mockDispatch);
      expect(mockDispatch).toHaveBeenCalledTimes(4);
    });
  });

  describe("lastInnSaksopplysningerRegistreringUnntaksperioder", () => {
    it("returnerer thunk", () => {
      expect(typeof lastInnSaksopplysningerRegistreringUnntaksperioder("SAK-1", 123)).toBe("function");
    });

    it("returnerer Promise ved dispatch (ikke undefined)", () => {
      const thunk = lastInnSaksopplysningerRegistreringUnntaksperioder("SAK-1", 123);
      const result = thunk(mockDispatch);
      expect(result).toBeInstanceOf(Promise);
    });

    it("dispatcher 8 operations", () => {
      const thunk = lastInnSaksopplysningerRegistreringUnntaksperioder("SAK-1", 123);
      thunk(mockDispatch);
      expect(mockDispatch).toHaveBeenCalledTimes(8);
    });
  });

  describe("lastInnSaksopplysningerBehandleMottattAOU", () => {
    it("returnerer thunk", () => {
      expect(typeof lastInnSaksopplysningerBehandleMottattAOU("SAK-1", 123)).toBe("function");
    });

    it("returnerer Promise ved dispatch (ikke undefined)", async () => {
      const thunk = lastInnSaksopplysningerBehandleMottattAOU("SAK-1", 123);
      const result = thunk(mockDispatch, mockGetState);
      expect(result).toBeInstanceOf(Promise);
      await result;
    });

    it("dispatcher behandling, resultat, anmodningsperioder og dokumenter", async () => {
      const thunk = lastInnSaksopplysningerBehandleMottattAOU("SAK-1", 123);
      await thunk(mockDispatch, mockGetState);
      // 4 initielle dispatches + 1 dispatch av anmodningsperiodesvar i .then()
      expect(mockDispatch).toHaveBeenCalledTimes(5);
    });
  });
});
