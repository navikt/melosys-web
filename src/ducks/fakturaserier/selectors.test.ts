import { describe, it, expect } from "vitest";
import { FakturaserierSelector } from "./selectors";
import { STATUS } from "../../services/utils";

const lagState = (fakturaserier: any) => ({ fakturaserier }) as any;

describe("fakturaserier selectors", () => {
  it("FakturaserierSelector returnerer fakturaserier state", () => {
    const state = lagState({ status: STATUS.OK, data: [{ fakturaserieReferanse: "ref1" }] });
    const result = FakturaserierSelector(state);
    expect(result.data).toEqual([{ fakturaserieReferanse: "ref1" }]);
    expect(result.status).toBe(STATUS.OK);
  });

  it("FakturaserierSelector returnerer tom liste ved NOT_STARTED", () => {
    const state = lagState({ status: STATUS.NOT_STARTED, data: [] });
    const result = FakturaserierSelector(state);
    expect(result.data).toEqual([]);
  });
});
