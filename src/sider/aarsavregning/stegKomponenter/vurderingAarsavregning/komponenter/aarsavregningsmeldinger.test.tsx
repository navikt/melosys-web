import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Aarsavregningsmeldinger } from "./aarsavregningsmeldinger";

describe("Aarsavregningsmeldinger", () => {
  describe("TrygdeavgiftErIkkeForskuddsvisFakturert", () => {
    it("renders correctly", () => {
      const { container } = render(<Aarsavregningsmeldinger.TrygdeavgiftErIkkeForskuddsvisFakturert />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("TrygdeavgiftSkalIkkeBetalesTilNav", () => {
    it("renders correctly", () => {
      const { container } = render(<Aarsavregningsmeldinger.TrygdeavgiftSkalIkkeBetalesTilNav />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
