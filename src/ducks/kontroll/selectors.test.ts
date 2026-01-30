import { describe, it, expect } from "vitest";
import * as selectors from "./selectors";
import * as DucksTestUtils from "../test-utils";
import { STATUS } from "../../services/utils";

describe("kontroll selectors", () => {
  describe("KontrollFeilSelector", () => {
    it("returnerer kun FEIL fra kontrollfeilList", () => {
      const state = DucksTestUtils.lagState({
        kontroll: {
          status: STATUS.OK,
          data: {
            kontrollfeilList: [
              { kode: "FEIL1", felter: ["felt1"], type: "FEIL" },
              { kode: "ADV1", felter: ["felt2"], type: "ADVARSEL" },
              { kode: "FEIL2", felter: ["felt3"], type: "FEIL" },
            ],
          },
        },
      });
      const result = selectors.KontrollFeilSelector(state);
      expect(result).toHaveLength(2);
      expect(result.every((f: any) => f.type === "FEIL")).toBe(true);
    });

    it("returnerer tom liste når kontrollfeilList mangler", () => {
      const state = DucksTestUtils.lagState({
        kontroll: { status: STATUS.OK, data: {} },
      });
      expect(selectors.KontrollFeilSelector(state)).toEqual([]);
    });
  });

  describe("KontrollAdvarslerSelector", () => {
    it("returnerer kun ADVARSEL fra kontrollfeilList", () => {
      const state = DucksTestUtils.lagState({
        kontroll: {
          status: STATUS.OK,
          data: {
            kontrollfeilList: [
              { kode: "FEIL1", felter: ["felt1"], type: "FEIL" },
              { kode: "ADV1", felter: ["felt2"], type: "ADVARSEL" },
            ],
          },
        },
      });
      const result = selectors.KontrollAdvarslerSelector(state);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("ADVARSEL");
    });
  });

  describe("ErPendingSelector", () => {
    it("returnerer true når status er PENDING", () => {
      const state = DucksTestUtils.lagState({
        kontroll: { status: STATUS.PENDING, data: {} },
      });
      expect(selectors.ErPendingSelector(state)).toBe(true);
    });

    it("returnerer false når status er OK", () => {
      const state = DucksTestUtils.lagState({
        kontroll: { status: STATUS.OK, data: {} },
      });
      expect(selectors.ErPendingSelector(state)).toBe(false);
    });
  });
});
