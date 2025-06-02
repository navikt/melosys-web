import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Aarsavregningsmeldinger } from "./aarsavregningsmeldinger";

describe("Aarsavregningsmeldinger", () => {
  describe("TrygdeavgiftErIkkeForskuddsvisFakturert", () => {
    it("matcher snapshot", () => {
      const { container } = render(<Aarsavregningsmeldinger.TrygdeavgiftErIkkeForskuddsvisFakturert />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("TrygdeavgiftSkalIkkeBetalesTilNav", () => {
    it("matcher snapshot", () => {
      const { container } = render(<Aarsavregningsmeldinger.TrygdeavgiftSkalIkkeBetalesTilNav />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
