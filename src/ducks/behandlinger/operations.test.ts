import { describe, expect, it, vi } from "vitest";

import * as Api from "../../services/api";
import { oppfriskBehandling } from "./operations";
import * as Types from "./types";

vi.mock("../../services/api", () => ({
  Behandlinger: {
    behandling: {
      hentBehandling: vi.fn(),
    },
  },
}));

const hentBehandling = vi.mocked(Api.Behandlinger.behandling.hentBehandling);
const getState = () => ({ behandlinger: { data: { behandlingID: 42, saksnummer: "MEL-1" } } });

describe("behandlinger operations", () => {
  it("oppdaterer behandlingen når oppfriskningen lykkes", async () => {
    const dispatch = vi.fn();
    const behandling = { behandlingID: 42, saksnummer: "MEL-1", tilordnetMeg: true };
    hentBehandling.mockResolvedValue(behandling as never);

    await oppfriskBehandling()(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({ type: Types.OK, data: behandling });
  });

  it("beholder eksisterende behandling når oppfriskningen feiler", async () => {
    const dispatch = vi.fn();
    hentBehandling.mockRejectedValue(new Error("Nettverksfeil"));

    await expect(oppfriskBehandling()(dispatch, getState)).rejects.toThrow("Nettverksfeil");

    expect(dispatch).not.toHaveBeenCalled();
  });
});
