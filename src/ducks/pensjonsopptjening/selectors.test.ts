import { describe, it, expect } from "vitest";
import { PensjonsopptjeningSelector, PensjonsopptjeningPerioderSelector } from "./selectors";
import { STATUS } from "../../services";
import type { RootState } from "AppTypes";

const stateWith = (slice: any): RootState => ({ pensjonsopptjening: slice }) as RootState;

describe("pensjonsopptjening selectors", () => {
  it("PensjonsopptjeningSelector returnerer slice", () => {
    const slice = { status: STATUS.OK, data: {} };
    expect(PensjonsopptjeningSelector(stateWith(slice))).toBe(slice);
  });

  it("PensjonsopptjeningPerioderSelector returnerer tom liste når status ikke er OK", () => {
    expect(
      PensjonsopptjeningPerioderSelector(stateWith({ status: STATUS.PENDING, data: { perioder: [{ aar: 2024 }] } })),
    ).toEqual([]);
  });

  it("PensjonsopptjeningPerioderSelector returnerer tom liste når status er ERROR selv om feilrespons inneholder perioder", () => {
    expect(
      PensjonsopptjeningPerioderSelector(stateWith({ status: STATUS.ERROR, data: { perioder: [{ aar: 2024 }] } })),
    ).toEqual([]);
  });

  it("PensjonsopptjeningPerioderSelector returnerer perioder når status er OK", () => {
    const perioder = [{ aar: 2024, pgi: 100, kilde: "SKATT" }];
    expect(PensjonsopptjeningPerioderSelector(stateWith({ status: STATUS.OK, data: { perioder } }))).toEqual(perioder);
  });

  it("PensjonsopptjeningPerioderSelector returnerer tom liste når data mangler perioder selv ved OK", () => {
    expect(PensjonsopptjeningPerioderSelector(stateWith({ status: STATUS.OK, data: {} }))).toEqual([]);
  });
});
