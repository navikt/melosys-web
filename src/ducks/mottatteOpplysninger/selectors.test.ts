import * as selectors from "./selectors";

interface MaritimtArbeid {
  innretningLandkode?: string;
}

describe("MottatteOpplysninger selectors", () => {
  describe("SkipArbeidSelector", () => {
    it("returnerer arbeid på skip", () => {
      const { resultFunc } = selectors.SkipArbeidSelector;

      const maritimtarbeid: MaritimtArbeid[] = [{ innretningLandkode: "DE" }, {}];

      const result = resultFunc(maritimtarbeid);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({});
    });
  });

  describe("OffshoreArbeidSelector", () => {
    it("returnerer arbeid offshore", () => {
      const { resultFunc } = selectors.OffshoreArbeidSelector;

      const maritimtarbeid: MaritimtArbeid[] = [{ innretningLandkode: "DE" }, {}];

      const result = resultFunc(maritimtarbeid);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ innretningLandkode: "DE" });
    });
  });
});
