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

  describe("ÅrsavregningIkkeStøttetSakstypeMelding", () => {
    it("matcher snapshot", () => {
      const { container } = render(<Aarsavregningsmeldinger.ÅrsavregningIkkeStøttetSakstypeMelding />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("viser meldingsteksten fra MELOSYS-8163 og en stabil data-testid", () => {
      const { getByTestId } = render(<Aarsavregningsmeldinger.ÅrsavregningIkkeStøttetSakstypeMelding />);
      const alert = getByTestId("aarsavregning-ikke-stottet-sakstype");
      expect(alert).toHaveTextContent(
        "Melosys støtter ikke årsavregning for denne kombinasjonen av sakstype/-tema. Støtte vil bli gjort tilgjengelig senere.",
      );
    });
  });
});
